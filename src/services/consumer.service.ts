import { Kafka } from 'kafkajs';
import puppeteer from 'puppeteer';

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'scraper-group' });

export const runConsumer = async (): Promise<void> => {
  try {
    await consumer.connect();
    console.log('Consumer connected successfully.');

    await consumer.subscribe({ topic: 'scrape-requests', fromBeginning: false });

    console.log('Consumer subscribed to topic "scrape-requests".');

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const url = message.value?.toString();
        console.log(`Received message from topic "${topic}": ${url}`);

        if (url) {
          try {
            // Scrape the provided URL with Puppeteer
            const result = await scrapeWebsite(url);
            console.log(`Scraping result for ${url}:`);
            console.log(result);
          } catch (error) {
            console.error(`Error scraping ${url}:`, error);
          }
        } else {
          console.warn('Received empty or invalid message.');
        }
      },
    });

    // Block the event loop indefinitely until a graceful shutdown
    await new Promise(() => {});
  } catch (error) {
    console.error('Error in consumer:', error);
  }
};

// Puppeteer Scraping Function
const scrapeWebsite = async (url: string): Promise<string> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const title = await page.title(); // Extract the page title as an example
    await browser.close();

    return `Page title: ${title}`;
  } catch (error: unknown) {
    await browser.close();
    if (error instanceof Error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

// Graceful shutdown to disconnect from Kafka
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await consumer.disconnect();
  console.log('Consumer disconnected.');
  process.exit(0);
});

(async () => {
  await runConsumer(); // Make sure this is invoked explicitly
})();
