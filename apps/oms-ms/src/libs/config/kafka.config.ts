import { Kafka, KafkaConfig } from 'kafkajs';

const kafkaConfig: KafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'oms-ms',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
};

const kafka = new Kafka(kafkaConfig);

const orderTopic = process.env.KAFKA_ORDER_TOPIC || 'orders';

export { kafka, orderTopic };
