const { consume } = require('../kafka/consumer');

async function handleEvents() {
  await consume('user-registered', 'user-service', async ({ message }) => {
    const { id, email } = JSON.parse(message.value.toString());
    console.log(`New user registered: ${id}, ${email}`);
  });

  // If you also want to listen for logins:
  await consume('user-login', 'user-service', async ({ message }) => {
    const { id, email } = JSON.parse(message.value.toString());
    console.log(`User logged in: ${id}, ${email}`);
  });
}

handleEvents().catch(console.error);