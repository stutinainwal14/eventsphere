const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function createAdminUser() {
    try {
        const adminEmail = 'admin123@gmail.com'; // Change this
        const adminPassword = 'admin123'; // Change this
        const adminUsername = 'admin'; // Change this if needed

        // Check if admin already exists
        const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [adminEmail]);
        if (existing.length > 0) {
            process.exit(1);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Insert admin user
        const [result] = await db.query(
            'INSERT INTO Users (username, email, password, role, preferences) VALUES (?, ?, ?, ?, ?)',
            [adminUsername, adminEmail, hashedPassword, 'admin', JSON.stringify({})]
        );
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
