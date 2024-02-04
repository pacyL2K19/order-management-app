import { Consumer, EachMessagePayload } from "kafkajs";

import InventoryService, {
  inventoryService as service,
} from "../services/inventory.service";
import { kafka } from "./kafka.config";
import InventoryProducer from "./inventory.producer";
import { Order } from "../libs";

class InventoryConsumer {
  private consumer: Consumer;
  private inventoryProducer: InventoryProducer;
  private inventoryService: InventoryService;

  constructor() {
    this.consumer = kafka.consumer({ groupId: "inventory-group" });
    this.inventoryService = service;
    this.inventoryProducer = InventoryProducer.getInstance();
  }

  // Singleton pattern to ensure only one instance of the consumer is created
  public static getInstance(): InventoryConsumer {
    return new InventoryConsumer();
  }

  async initializeConsumer() {
    // Connect the consumer to the kafka cluster
    await this.consumer.connect();
    // Subscribe to the order topic
    await this.consumer.subscribe({ topic: "orders" });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        try {
          // Parse the incoming order message
          console.log("inventory cosnumer -> consuming message:".toUpperCase(), message);
          const orderData = JSON.parse(message.value?.toString() || "");

          // Process the order data and update the inventory accordingly
          await this.checkAndUpdateInventory(orderData);
        } catch (error) {
          console.error("Inventory Consumer -> Error processing order:".toUpperCase(), error);
        }
      },
    });
  }

  async checkAndUpdateInventory(orderData: Order) {
    const unExecutedLineItems = [];

    // For each order line item, check and update inventory
    for (const lineItem of orderData.lineItems) {
      const productId = lineItem.product;
      const quantity = lineItem.quantity;

      try {
        // Get the current inventory for the product
        const inventory = await this.inventoryService.getInventoryByProductId(
          productId.toString()
        );

        // Check if there's enough quantity in the inventory
        if (inventory && inventory.quantity >= quantity) {
          // If there's enough quantity, update the inventory by subtracting the ordered quantity
          const newQuantity = inventory.quantity - quantity;
          await this.inventoryService.updateInventoryQuantity(
            productId.toString(),
            newQuantity
          );
        } else {
          unExecutedLineItems.push(lineItem);
        }
      } catch (error) {
        console.error("Error updating inventory for product:", productId);
        // publish inventory creation failed event
        await this.inventoryProducer.publishInventoryUpdateFailedEvent({
          productId: productId.toString(),
          orderId: orderData._id,
        });
      }
    }

    // publish inventory updated event
    await this.inventoryProducer.publishInventoryUpdatedEvent({
      unExecutedLineItems,
      orderId: orderData._id,
    });
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}

export const inventoryConsumer = new InventoryConsumer();
export default InventoryConsumer;
