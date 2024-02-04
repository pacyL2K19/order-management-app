import { Consumer } from "kafkajs";
import {
  InventoryEventDataType,
  InventoryEventType,
  Order,
  OrderLineItem,
  OrderStatus,
  kafka,
  orderTopic,
} from "../libs";
import OrderService, { orderService as service } from "../services/order.service";

class OrderConsumer {
  private consumer: Consumer;
  private orderService: OrderService;

  constructor() {
    this.consumer = kafka.consumer({ groupId: "order-group" });
    this.orderService = service;
  }

  // Singleton pattern to ensure only one instance of the consumer is created
  public static getInstance(): OrderConsumer {
    return new OrderConsumer();
  }

  async initializeConsumer() {
    await this.consumer.connect();
    // subscribe to the inventory topic
    await this.consumer.subscribe({ topic: "inventory" });

    console.log("Order Consumer -> initialized");

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const inventoryEventData = JSON.parse(
            message.value?.toString() || ""
          );
          console.log(
            "Order Consumer -> consuming message:".toUpperCase(),
            inventoryEventData
          );
          switch (inventoryEventData.eventType as InventoryEventType) {
            case "inventoryUpdated":
              await this.processInventoryUpdatedEvent(inventoryEventData);
              break;
            case "inventoryUpdateFailed":
              await this.processInventoryUpdateFailedEvent(inventoryEventData);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("Error processing order:", error);
        }
      },
    });
  }

  async processInventoryUpdatedEvent(eventData: InventoryEventDataType) {
    try {
      const { unExecutedLineItems = [], orderId } = eventData;
        const order = await this.orderService.findOrderById(orderId);
        await this.orderService.updateOrder(orderId, {
          status: unExecutedLineItems.length > 0 ? OrderStatus.PARTIALLY_EXECUTED : OrderStatus.EXECUTED,
          lineItems: order.lineItems.map((lineItem: OrderLineItem) => {
            if (unExecutedLineItems.filter((item) => item === lineItem._id).length) {
              return {
                ...lineItem,
                status: OrderStatus.CANCELED,
              };
            }
            return lineItem;
          }) as OrderLineItem[]
        });

        // TODO: Optionally,we can notify the user that the order has been executed through a notification service - this is out of scope for this workshop
    } catch (error) {
      // TODO: Optionally, we can notify the user that the order has failed through a notification service - this is out of scope for this workshop
      console.error("Error processing inventory updated event:", error);
      throw new Error("Error processing inventory updated event");
    }
  }

  // IF THE INVENTORY UPDATE FAILED, CANCEL THE ORDER WITH ITS LINE ITEMS
  async processInventoryUpdateFailedEvent(eventData: InventoryEventDataType) {
    try {
      const { orderId } = eventData;
      const order = await this.orderService.findOrderById(orderId);
      await this.orderService.updateOrder(orderId, {
        status: OrderStatus.CANCELED,
        lineItems: order.lineItems.map((lineItem: OrderLineItem) => ({
          ...lineItem,
          status: OrderStatus.CANCELED,
        })) as OrderLineItem[]
      });

      // TODO: Optionally, we can notify the user that the order has failed through a notification service - this is out of scope for this workshop
    } catch (error) {
      // TODO: Optionally, we can notify the user that the order has failed through a notification service - this is out of scope for this workshop
      // this will keep order status as pending - depending on the business logic, we can also cancel the order after a certain number of retries - this is out of scope for this workshop
      console.error("Error processing inventory update failed event:", error);
      throw new Error("Error processing inventory update failed event");
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}

export default OrderConsumer;
