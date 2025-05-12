// src/kafka/client.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'eventsphere-backend',
  brokers: ['host.docker.internal:9092'],
});

module.exports = kafka;