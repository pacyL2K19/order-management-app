import { Kafka, KafkaConfig } from 'kafkajs';

const kafkaConfig: KafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'inventory-ms',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
};

const kafka = new Kafka(kafkaConfig);

const inventoryTopic = process.env.KAFKA_TOPIC || 'inventory';

export { kafka, inventoryTopic };
