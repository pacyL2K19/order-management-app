import express, { Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { BAD_REQUEST_CODE, INVALID_REQUEST } from "./libs";

import { Database } from "./libs";
import InventoryProducer from "./kafka/inventory.producer";
import InventoryConsumer from "./kafka/inventory.consumer";

// Rate limiting options
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs - - can be changed as per the requirements and application needs
});

// Graceful shutdown function to ensure that the database and kafka producer are disconnected before the process exits
async function gracefulShutdown(
  inventoryProducer: InventoryProducer,
  inventoryConsumer: InventoryConsumer,
  database: Database
) {
  await database.disconnect();

  await inventoryProducer.disconnect();

  await inventoryConsumer.disconnect();

  process.exit(0);
}

async function main() {
  dotenv.config();

  const app = express();
  app.use(express.json());
  app.use(helmet());

  // connect to database
  const database = Database.getInstance(
    process.env.MONGODB_URI ?? "mongodb://mongodb:27017/inventory-db"
  );
  await database.connect();

  // connect to kafka producer
  const inventoryProducer = InventoryProducer.getInstance();
  await inventoryProducer.initializeProducer();

  // connect to kafka consumer
  const inventoryConsumer = InventoryConsumer.getInstance();
  await inventoryConsumer.initializeConsumer();

  app.get("/", limiter, (req: Request, res: Response) => {
    res.send("I-S running!");
  });

  // HANDLE WRONG ROUTES
  app.use("*", (req: Request, res: Response) => {
    res.status(BAD_REQUEST_CODE).json({
      message: `wrong route - ${INVALID_REQUEST}`,
    });
  });

  app.listen(process.env.PORT || 8002, () => {
    console.log("Listening I-S service on port 8002");
  });

  process.on("SIGTERM", () => {
    gracefulShutdown(inventoryProducer, inventoryConsumer, database);
  });
}

main();
