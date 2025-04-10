const db = require('../config/db');
const { hashPassword, comparePassword } = require('../services/authService');

exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashedPassword = await hashPassword(password);

  const sql = "INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [username, email, hashedPassword, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "User registered successfully" });
  });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM Users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: "Invalid email" });

    const user = results[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user });
  });
};
