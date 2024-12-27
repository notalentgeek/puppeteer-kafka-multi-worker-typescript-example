import { cpus, freemem, totalmem } from 'os';
import { hideBin } from 'yargs/helpers';
import { join } from 'path';
import cluster, { Worker } from 'cluster';
import pidusage from 'pidusage';
import yargs from 'yargs';

const MAX_MEMORY_USAGE = 75;  // Max memory usage in percentage (e.g., 75%)
const MAX_CPU_USAGE = 75;  // Max CPU usage in percentage (e.g., 75%)

let currentWorkers: Worker[] = [];

const argv = yargs(hideBin(process.argv))
  .command('producer', 'Run as producer')
  .command('consumer', 'Run as consumer')
  .option('worker', {
    alias: 'w',
    type: 'number',
    description: 'Number of worker processes to spawn for the consumer',
    default: 1,
  })
  .help()
  .parseSync();

// Function to monitor system resources and adjust worker processes
const monitorResources = () => {
  const numCPUs = cpus().length;
  const totalMem = totalmem();
  const freeMem = freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  pidusage(process.pid, (err, stats) => {
    if (err) {
      console.error('Error fetching PID usage stats:', err);
      return;
    }

    const cpuUsage = stats.cpu;

    console.log(`CPU Usage: ${cpuUsage}% | Memory Usage: ${memoryUsage}%`);

    // Adjust workers based on system resources
    if (cpuUsage < MAX_CPU_USAGE && memoryUsage < MAX_MEMORY_USAGE) {
      // If resources are available, spawn a new worker if we need more
      if (currentWorkers.length < numCPUs) {
        const worker = cluster.fork();
        currentWorkers.push(worker);
        console.log(`Forked a new worker with PID: ${worker.process.pid}`);
      }
    } else {
      // If system is under heavy load, kill workers to free up resources
      if (currentWorkers.length > 0) {
        const workerToKill = currentWorkers.pop();
        if (workerToKill) {
          workerToKill.kill();
          console.log(`Killed worker with PID: ${workerToKill.process.pid}`);
        }
      }
    }
  });
};

const runProducer = (workers: number) => {
  if (cluster.isPrimary) {
    console.log(`Running as producer with ${workers} worker(s).`);

    // Fork workers
    for (let i = 0; i < workers; i++) {
      const worker = cluster.fork(); // Fork the worker
      currentWorkers.push(worker);

      // Log the PID of the worker when it's forked
      console.log(`Forked worker with PID: ${worker.process.pid}`);
    }

    // Monitor resources periodically
    setInterval(monitorResources, 5000); // Monitor every 5 seconds

    // When workers exit, log their PID and status
    cluster.on('exit', (worker, code) => {
      console.log(`Worker ${worker.process.pid} exited with code ${code}`);
    });
  } else {
    // Dynamically import the worker script for each worker process
    import(join(__dirname, './services/producer.service.js'))
      .then(() => {
        console.log(`Worker process initialized with PID: ${process.pid}`);
      })
      .catch((error) => {
        console.error('Error loading worker process:', error);
      });
  }
};

const runConsumer = (workers: number) => {
  if (cluster.isPrimary) {
    console.log(`Running as consumer with ${workers} worker(s).`);

    // Fork workers
    for (let i = 0; i < workers; i++) {
      const worker = cluster.fork(); // Fork the worker
      currentWorkers.push(worker);

      // Log the PID of the worker when it's forked
      console.log(`Forked worker with PID: ${worker.process.pid}`);
    }

    // Monitor resources periodically
    setInterval(monitorResources, 5000); // Monitor every 5 seconds

    // When workers exit, log their PID and status
    cluster.on('exit', (worker, code) => {
      console.log(`Worker ${worker.process.pid} exited with code ${code}`);
    });
  } else {
    // Dynamically import the worker script for each worker process
    import(join(__dirname, './services/consumer.service.js'))
      .then(() => {
        console.log(`Worker process initialized with PID: ${process.pid}`);
      })
      .catch((error) => {
        console.error('Error loading worker process:', error);
      });
  }
};

(async () => {
  const command = argv._[0];

  if (command === 'producer') {
    const workers = Math.max(1, argv.worker as number); // Ensure at least 1 worker
    runProducer(workers);
  } else if (command === 'consumer') {
    const workers = Math.max(1, argv.worker as number); // Ensure at least 1 worker
    runConsumer(workers);
  } else {
    console.error('Invalid command. Use "producer" or "consumer".');
    process.exit(1);
  }
})();
