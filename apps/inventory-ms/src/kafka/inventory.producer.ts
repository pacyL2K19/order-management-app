import { Admin, Producer } from "kafkajs";
import { inventoryTopic, kafka } from "./kafka.config";
import { Inventory, InventoryEventDataType, InventoryEventType } from "../libs";

class InventoryProducer {
  private producer: Producer;
  private admin: Admin;
  private static instance: InventoryProducer;

  constructor() {
    this.producer = kafka.producer();
    this.admin = kafka.admin();
    this.admin.connect();
  }

  // Singleton pattern to ensure only one instance of the producer is created
  public static getInstance(): InventoryProducer {
    if (!this.instance) {
      this.instance = new InventoryProducer();
    }
    return this.instance;
  }

  private async sendMessage(
    eventType: InventoryEventType,
    data: InventoryEventDataType
  ) {
    // check if the topic exists, if not create it
    const topics = await this.admin.listTopics();
    if (!topics.includes(inventoryTopic)) {
      await this.admin.createTopics({
        topics: [
          {
            topic: inventoryTopic,
          },
        ],
        waitForLeaders: true,
      });
    }

    const message = {
      key: data.orderId?.toString() ?? data.productId?.toString() ?? Math.random().toString(),
      value: JSON.stringify({
        eventType,
        data,
      }),
    };

    await this.producer.send({
      topic: inventoryTopic,
      messages: [message],
    });
  }

  async initializeProducer() {
    await this.producer.connect();
  }

  async publishInventoryUpdatedEvent(data: InventoryEventDataType) {
    await this.sendMessage("inventoryUpdated", data);
  }

  async publishInventoryUpdateFailedEvent(data: InventoryEventDataType) {
    await this.sendMessage("inventoryUpdateFailed", data);
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

export default InventoryProducer;
