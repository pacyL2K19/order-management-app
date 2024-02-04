import express, { Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import { Database } from "./libs";
import { BAD_REQUEST_CODE, INVALID_REQUEST,  } from "./libs";

import OrderProducer from "./kafka/order.producer";
import router from "./routes/order.routes";
import rateLimit from "express-rate-limit";
import OrderConsumer from "./kafka/order.consumer";

// Rate limiting options
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs - - can be changed as per the requirements and application needs
});

// Graceful shutdown function to ensure that the database and kafka producer are disconnected before the process exits
async function gracefulShutdown(
  orderProducer: OrderProducer,
  orderConsumer: OrderConsumer,
  database: Database
) {
  await database.disconnect();

  await orderProducer.disconnect();

  await orderConsumer.disconnect();

  process.exit(0);
}

async function main() {
  dotenv.config();

  const app = express();
  app.use(express.json());
  app.use(helmet());

  // connect to database
  const database = Database.getInstance(
    process.env.MONGODB_URI ?? "mongodb://mongodb:27017/oms-db"
  );
  await database.connect();

  // connect to kafka producer
  const orderProducer = OrderProducer.getInstance();
  await orderProducer.initializeProducer();

  // connect to kafka consumer
  const orderConsumer = OrderConsumer.getInstance();
  await orderConsumer.initializeConsumer();

  app.get("/", limiter, (req: Request, res: Response) => {
    res.send("OMS running!");
  });

  app.use("/api/orders", router);

  // HANDLE WRONG ROUTES
  app.use("*", (req: Request, res: Response) => {
    res.status(BAD_REQUEST_CODE).json({
      message: `wrong route - ${INVALID_REQUEST}`,
    });
  });

  app.listen(process.env.PORT || 8001, () => {
    console.log("Listening OMS service on port 8001");
  });

  process.on("SIGTERM", () => {
    gracefulShutdown(orderProducer, orderConsumer, database);
  });
}

main();
