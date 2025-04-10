const express = require('express');
const { User } = require('../models'); // Import the User model from the models folder
const { hashPassword, comparePassword } = require('../services/authService'); // Import the password hashing function
const router = express.Router();

// Sign-Up Route
router.post('/register', async (req, res) => {
  console.log("Register route hit");
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    res.send('User registration route works!');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Return success response
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
