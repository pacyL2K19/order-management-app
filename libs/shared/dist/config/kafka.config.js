"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderTopic = exports.kafka = void 0;
var kafkajs_1 = require("kafkajs");
var kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID || 'oms-ms',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
};
var kafka = new kafkajs_1.Kafka(kafkaConfig);
exports.kafka = kafka;
var orderTopic = process.env.KAFKA_ORDER_TOPIC || 'orders';
exports.orderTopic = orderTopic;
