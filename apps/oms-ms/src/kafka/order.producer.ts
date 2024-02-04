import { Admin, Producer } from 'kafkajs';
import { kafka, orderTopic } from './kafka.config';
import { Order, OrderEventType } from '../libs';

class OrderProducer {
  private producer: Producer;
  private admin: Admin;
  private static instance: OrderProducer;

  constructor() {
    this.producer = kafka.producer();
    this.admin = kafka.admin();
    this.admin.connect();
  }

  // Singleton pattern to ensure only one instance of the producer is created
  public static getInstance(): OrderProducer {
    if (!this.instance) {
      this.instance = new OrderProducer();
    }
    return this.instance;
  }

  private async sendMessage(eventType: OrderEventType, order: Order) {
    const message = {
      key: order._id.toString(),
      value: JSON.stringify({
        eventType,
        order,
      }),
    };

    // check if the topic exists, if not create it
    const topics = await this.admin.listTopics();
    console.log('topics', topics);
    if (!topics.includes(orderTopic)) {
      await this.admin.createTopics({
        topics: [
          {
            topic: orderTopic,
          },
        ],
        waitForLeaders: true,
      });
    }

    const topicsEND = await this.admin.listTopics();
    console.log('topics', topicsEND);

    await this.producer.send({
      topic: orderTopic,
      messages: [message],
    });
  }

  async initializeProducer() {
    await this.producer.connect();
  }

  async publishOrderPlacedEvent(order: Order) {
    await this.sendMessage('orderPlaced', order);
  }

  async publishOrderModifiedEvent(order: Order) {
    await this.sendMessage('orderModified', order);
  }

  async publishOrderCancelledEvent(order: Order) {
    await this.sendMessage('orderCancelled', order);
  }

  async publishOrderPlacementFailedEvent(order: Order) {
    await this.sendMessage('orderPlacementFailed', order);
  }

  async publishOrderModificationFailedEvent(order: Order) {
    await this.sendMessage('orderModificationFailed', order);
  }

  async publishOrderCancellationFailedEvent(order: Order) {
    await this.sendMessage('orderCancellationFailed', order);
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

export default OrderProducer;
