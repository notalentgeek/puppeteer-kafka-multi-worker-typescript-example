
# Puppeteer Kafka Multi-Worker TypeScript Example

This repository demonstrates a scalable and efficient architecture for web scraping using **Puppeteer**, **Kafka**, and **TypeScript**. It features multi-worker processing with dynamic resource management, allowing the system to adjust the number of active workers based on available CPU and memory resources.

---

## Features

- **TypeScript**: Ensures robust type-checking and maintainable code.
- **Puppeteer**: Automates browser tasks for web scraping.
- **Apache Kafka**: Manages the message queue for distributing tasks among workers.
- **Cluster API**: Spawns multiple worker processes dynamically.
- **Resource-Aware Scaling**: Dynamically adjusts the number of workers based on system CPU and memory availability.

---

## Prerequisites

1. **Node.js** (v18 or later recommended)
2. **Kafka**:
   - Install and start Kafka on your machine or use a hosted Kafka service.
3. **TypeScript**:
   - Ensure `tsc` (TypeScript Compiler) is installed globally or locally.

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<username>/puppetteer-kafka-multi-worker-typescript-example.git
   cd puppetteer-kafka-multi-worker-typescript-example
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile the TypeScript files:

   ```bash
   npm run build
   ```

---

## Configuration

1. Create a `.env` file in the root directory to set environment variables:

   ```env
   KAFKA_BROKER=localhost:9092
   WORKER_MEMORY_THRESHOLD_MB=200  # Minimum memory required for a worker to run
   WORKER_CPU_THRESHOLD=0.5        # Minimum CPU load required for a worker to run
   ```

2. Adjust `WORKER_MEMORY_THRESHOLD_MB` and `WORKER_CPU_THRESHOLD` in `.env` to set resource thresholds for worker management.

---

## Usage

### Run the Producer

The producer sends tasks to Kafka, where they are picked up by consumer workers.

```bash
npm run start producer --worker <num_workers>
```

Replace `<num_workers>` with the desired number of workers.

### Run the Consumer

The consumer processes tasks from Kafka using Puppeteer.

```bash
npm run start consumer --worker <num_workers>
```

### Example Commands

- Start a producer with 4 workers:
  ```bash
  npm run start producer --worker 4
  ```

- Start a consumer with dynamic scaling:
  ```bash
  npm run start consumer
  ```

---

## Scripts

- `npm run build`: Compiles TypeScript files.
- `npm run start`: Runs the application (`producer` or `consumer` mode).

---

## Architecture

- **Producer**: Sends scraping tasks to a Kafka topic.
- **Consumer**: Dynamically spawns workers to process tasks from Kafka. The number of workers adjusts based on system resource usage.
- **Worker Management**: Uses the `pidusage` library to monitor CPU and memory for dynamic scaling.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit changes:
   ```bash
   git commit -m "Add my new feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/my-feature
   ```
5. Open a pull request.

---

## Acknowledgments

- Inspired by real-world challenges in scalable web scraping.
- Powered by Puppeteer, Kafka, and Node.js.

For issues or suggestions, feel free to open an issue or contact the repository maintainer.
