import { Kafka } from 'kafkajs';

const kafka = new Kafka({ brokers: ['localhost:9092'] });
const producer = kafka.producer();

export const runProducer = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log('Producer connected successfully.');

    const sendMessage = async () => {
      try {
        const message = 'https://google.com';

        await producer.send({
          topic: 'scrape-requests',
          messages: [{ value: message }],
        });

        console.log(`Sent: ${message}`);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    // Infinite loop with 1-second interval
    setInterval(sendMessage, 1000);

    // Block the event loop indefinitely until a graceful shutdown
    await new Promise(() => {});
  } catch (error) {
    console.error('Error in producer:', error);
  }
};

// Graceful shutdown to disconnect from Kafka
process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await producer.disconnect();
  console.log('Producer disconnected.');
  process.exit(0);
});

(async () => {
  await runProducer(); // Make sure this is invoked explicitly
})();
