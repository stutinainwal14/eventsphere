// src/kafka/producer.js
const kafka = require('./client');
const producer = kafka.producer();

async function publish(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

module.exports = { publish };