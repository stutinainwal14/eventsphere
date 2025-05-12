// src/kafka/consumer.js
const kafka = require('./client');

/**
* Consume messages from a given topic.
* @param {string} topic    – Kafka topic name
* @param {string} groupId  – Consumer group ID
* @param {function} eachMessage – Handler ({ topic, partition, message }) => {}
*/
async function consume(topic, groupId, eachMessage) {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({ eachMessage });
}

// (Optional) if you want an initializer that kicks off multiple subscriptions:
async function initConsumer() {
  // e.g. start your default subscriptions here
  await consume('user-registered', 'user-service', async ({ message }) => {
    const { id, email } = JSON.parse(message.value.toString());
    console.log(`New user registered (via initConsumer): ${id}, ${email}`);
  });
}

module.exports = { consume, initConsumer };