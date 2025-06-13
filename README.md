# EventSphere

EventSphere is a full-stack web application built to help users explore, filter, and register for events seamlessly. With a clean frontend interface and robust backend integration, it provides functionality for user authentication and event discovery. This application is structured into separate services for backend, frontend, and database, with a proxy server facilitating secure communication between components.

---

##  Project Structure

- **Frontend**: Located in the `auth/` folder, served via a `proxy-server.js` file.
- **Backend**: Located in the `backend/` folder, built with Node.js.
- **Database**: MySQL, managed locally.

---

##  Setup Instructions

Follow the steps below to get the EventSphere app up and running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/UAdelaide/25S1_WDC_PG_Groups_4.git
cd 25S1_WDC_PG_Groups_4
```

### 2. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

> The backend server will start on port `8080`.

### 3. Start the Proxy Frontend Server

```bash
cd ../auth
npm install
node proxy-server.js
```

> The frontend will be served at `http://localhost:3000/`.

### 4. Start the MySQL Database

**Ensure MySQL is properly installed and running.**
```bash
cd backend
sudo service mysql start
```

**Environment Setup:** Open the .env file and add your own DB_PASSWORD. All other variables are already pre-configured.

**Set up the database:**

1. Create a new database:
```bash
mysql -u root -p -e "CREATE DATABASE eventsphere"
```
2. Import the backup into the newly created database:
```bash
mysql -u root -p eventsphere < eventsphere_backup.sql
```
3. Start MySQL (if not already running):
```bash
sudo service mysql start
```

> Ensure MySQL is properly installed and configured.

**Note:**
All three services (Backend, Proxy Frontend, and MySQL) must run simultaneously in separate terminal windows or tabs. 
Make sure:
1. One terminal runs npm run dev (backend),
2. One runs node proxy-server.js (frontend),
3. And MySQL is running in the background or started in its own terminal.

###  Access the Application

- **Homepage**: [http://localhost:3000/homepage/index.html](http://localhost:3000/homepage/index.html)
- **Login Page**: [http://localhost:3000/login/login.html](http://localhost:3000/login/login.html)
- **Signup Page**: [http://localhost:3000/signup/signup.html](http://localhost:3000/signup/signup.html)
- **Profile Page**: http://localhost:3000/dashboard/profile/profile.html
- **Admin Panel**: http://localhost:3000/admin/main/admin.html

---

###  Features

### Authentication & Security
- **Signup**: Create a new account using your email, password, and optional 2FA setup. Form validations are enforced for all fields.
- **Login (with optional 2FA)**: Login using your email and password. If 2FA is enabled, you will also be prompted to enter a 6-digit code from Google Authenticator.
- **Logout**: Secure logout that clears your session and blacklists your JWT on the backend. This prevents token reuse.
- **JWT-based Protected Routes**: All sensitive API routes and pages are protected using JSON Web Tokens stored in HTTP-only cookies. Unauthorized users are redirected.

### Event Search & Interaction
- **Search Events on Homepage**: Use filters such as:
  1. Location
  2. Event Type: music, dance, comedy, theatre, sports, festival
  3. Start Date and End Date
  4. Sort By: date (ascending/descending), name (A-Z/Z-A), relevance
- **Bookmark Events with Tags**: You can save events to your profile with or without tags. Tags make saved events searching for the event later easier (Tags music,dance,sports,comedy,theatre,festival). You can also skip this if you don't want to add tags.
- **Redirect to Event Details Page**: Clicking “Get Details” redirects you to a dedicated event details page, where you can view full event information and access the official ticket purchase link (ticketmaster link).

### UI Features
- **Dark/Light Mode Toggle**: Easily switch between dark and light themes using a toggle button in the header.
- **Profile Dropdown & Quick Access**: On Top-right users can access:
  1. Profile
  2. Logout
  3. Quick switch between “My Events” and Dashboard
 
### User Profile Management
- **Update Profile**: Modify Full Name, Username, Email, Phone Number, Location, Avatar, and About Me (“Bio”) directly from the dashboard.
- **Delete User**: Permanently remove your account using a delete button at the bottom of the profile page (irreversible).
- **Download User Data**:A button is available to download your saved data (functionality to be implemented).
- **Change Password with Strength Meter**-
  - Requires input of the current password.
  - New password must meet minimum strength criteria.
  - Strength feedback is shown via a dynamic meter.

### Two-Factor Authentication (2FA)
- **Enable 2FA via Google Authenticator**
  - Click “Setup Two-Factor Authentication”
  - Scan the QR code using the Google Authenticator app
  - Enter the first 6-digit code to confirm setup
  - Once enabled, you must use the app code each time you log in

### My Events Dashboard

- **View Saved Events**: All bookmarked events are listed under the “My Events” section
- **Search Saved Events**: Search using event name, location, or tag
- **Delete Saved Events**: You can remove any saved event from your list

### Admin Panel Features

**Admin Setup (CLI-only for security)**: Run
```bash
    cd backend
    node create-admin.js
```
**No API is exposed for admin creation for security reasons.**

- **Admin Login**:
  - Credentials:
    - Email: admin123@gmail.com
    - Password: admin123
  - Redirects to Admin Panel at http://localhost:3000/admin/main/admin.html
- **Admin Dashboard**:
  -Shows real-time insights:
    - Total Users
    - Total Events
    - Total Trending Events
  - Trending Events: List of all events marked as trending.
    - Each includes:
      - Ticketmaster link
      - (Future) Edit/Delete buttons (not yet implemented)
  - All Events
    - Same structure as Trending Events list.
    - Displays every event in the system.
  - User Management
    - Admin can view all users.
    - Passwords are hidden, even from admins (for security).
    - “Edit” button allows:
      - Update Username
      - Update Email
      - Update Password
    - “Delete” button removes a user from the database permanently.
- **All Admin actions are fully synced with the backend and database.**

---

##  Removed Features
During development, some features and integrations were explored for learning and scalability purposes but were removed from the final submission to prioritize stability, simplicity, and maintainability:

### KafkaJS (Exploratory Integration)
KafkaJS was initially integrated to explore distributed event streaming and gain experience with asynchronous logging and microservices architecture. It was used to publish audit logs for actions such as:

- User signups
- Profile updates
- Admin user edits
  
However, as the project matured, we chose to streamline the backend by removing non-critical components. Since advanced logging and event streaming were not essential for the current scope, Kafka integration was removed in the final version.

The codebase remains modular and Kafka-ready if future iterations require reintroducing asynchronous logging, service decoupling, or real-time pipelines.

---

##  Known Bugs or Limitations

- Placeholder for future functionality to manage purchased tickets
- In admin panel - Trending Events - Edit/Delete buttons (not yet implemented)
- Disable 2fa - not yet implemented
- Profile Page - Download User Data to download user's saved data (functionality to be implemented)

---

##  Tech Stack Overview

### Backend

**Node.js + Express.js**
We chose Node.js with the Express framework for its non-blocking, event-driven architecture, which is well-suited for real-time, scalable applications like event management platforms. Express allows us to write modular, maintainable route handlers and middleware to efficiently manage API requests.

### Frontend

**HTML, CSS, JavaScript (Vanilla + jQuery)**
We used plain HTML, CSS, and JavaScript (with minimal jQuery) to build a fast, accessible frontend that works well without frameworks like React or Vue. This choice ensures lightweight rendering, fast load times, and easier integration with backend routes and cookies.
- Theme Toggle: Switch between dark and light mode.
- Responsive Design: Mobile-friendly layout via CSS media queries.
- jQuery: Used selectively for DOM manipulation and AJAX requests.

### Database

**MySQL**
A relational database was used for its support for structured schemas and complex queries. The schema includes normalized tables for:
- Users: User profiles and 2FA setup
- SavedEvents: Bookmarked events with optional tags
- BlacklistedTokens: Secure token invalidation on logout
- user_logs: Activity logging for auditing purposes

MySQL was selected for:
- Strong relational integrity
- Support for indexing and search optimization
- ACID compliance ensuring data reliability

### Database Design & ER Diagram

Our system uses a relational schema optimized for user authentication, event bookmarking, and log tracking. The key entities are:
- **Users**: Stores user credentials, profile, and 2FA settings.
- **SavedEvents**: Stores user-bookmarked events along with tags.
- **BlacklistedTokens**: Tracks invalidated JWTs for secure logout.
- **user_logs**: Stores user action logs (e.g., login/logout), used with Kafka initially.

**Relationship**
- A User can have many SavedEvents — foreign key: SavedEvents.user_id → Users.user_id.

**Notes**
- user_logs.username is stored as plain text (not FK) for log safety and Kafka compatibility. Although Kafka integration was removed in the final version, this design has been retained to keep the logging system Kafka-ready for future enhancements.
- BlacklistedTokens is standalone and not linked via FK for performance and security decoupling.

<img width="1118" alt="image" src="https://github.com/user-attachments/assets/8fdd1666-6770-4c3f-8be9-cdb1b08a1931" />

### Authentication & Security
- JWT (JSON Web Tokens) for session management, stored securely via HTTP-only cookies.
- 2FA (Two-Factor Authentication) integrated with Google Authenticator.
- bcrypt used for secure password hashing.
- Token Blacklisting to prevent token reuse after logout.
- Input Validation using express-validator to prevent XSS and injection attacks.

### Development Utilities

- **Nodemon**: Enables automatic server restarts during development for rapid iteration.
- **Custom Proxy Server**: Used to enable frontend-backend communication during development.

---

##  API Testing with Insomnia

A full collection of API endpoints is included for testing with [Insomnia](https://insomnia.rest/), exported in YAML format.

### How to Import

1. Open Insomnia.
2. Click the top-left dropdown → `Import Data` → `From File`.
3. Select [`EventSphere_API.insomnia_v5.yaml`](./insomnia/EventSphere_API.insomnia_v5.yaml).
4. Set your environment base URL (e.g., `http://localhost:8080`) or use variables as configured.
5. Add cookies or Bearer tokens as needed for protected routes.

### Sample Request Screenshot

<img width="1648" alt="image" src="https://github.com/user-attachments/assets/f0fd4307-9482-40b3-a36d-036f77111352" />

## Security Testing & Input Validation
EventSphere implements multiple layers of security to ensure robust protection against common web vulnerabilities such as XSS (Cross-Site Scripting) and SQL Injection. All incoming data is validated and sanitized on both the client and server sides using libraries like express-validator.

To verify our security mechanisms, we manually tested all critical API endpoints, including /api/auth/profile, using malicious payloads and crafted requests via curl. These tests were designed to simulate common attack vectors such as XSS, SQL injection, and authorization bypass, ensuring that each endpoint properly handles and sanitizes input data.

Some curls :

### XSS Attack Attempt

```bash
curl --request PUT \
  --url http://localhost:8080/api/auth/profile \
  --header 'Authorization: Bearer <JWT>' \
  --header 'content-type: multipart/form-data' \
  --cookie token=<JWT> \
  --form 'email="><script>alert("xss")</script>@test.com'
```
The input was rejected during validation, and the XSS payload was not executed or stored.

<img width="1348" alt="image" src="https://github.com/user-attachments/assets/5ef6025a-6522-42d7-aa4f-3f19243769f6" />

### SQL Injection Attempt

```bash
curl --request PUT \
  --url http://localhost:8080/api/auth/profile \
  --header 'Authorization: Bearer <JWT>' \
  --header 'content-type: multipart/form-data' \
  --cookie token=<JWT> \
  --form 'username=Robert\'); DROP TABLE Users;--'
```
The input was sanitized and parameterized, preventing any SQL manipulation.

<img width="1348" alt="image" src="https://github.com/user-attachments/assets/e5ba7c22-dfee-4d5d-a5e7-9913303e77ed" />

These tests confirm that:
- XSS is mitigated via proper input sanitization and content encoding.
- SQL Injection is prevented using parameterized queries with the mysql2 driver.

**Note** - Tokens in the above examples are obfuscated for security. Never expose real JWTs or credentials in repositories.

---

## Application Screenshots

### Home Page
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/61195e03-a1a5-4443-ae6c-0c35ed5a8c26" />

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/39835f80-dede-4f86-becf-7e7274bf667d" />

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/d2aaa425-f262-4d81-968f-544a870e47d7" />

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/65e3cc51-c34a-48ee-8c28-b20367ea589b" />


### Sign up
<img width="1677" alt="image" src="https://github.com/user-attachments/assets/6d68ee44-d166-41e3-91bd-43c5949623cb" />

### Login with 2FA
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/d4c2c668-39f7-4cc8-b6d6-41b95854aab4" />

### Event Search and Filters
<img width="1677" alt="image" src="https://github.com/user-attachments/assets/3284ea0e-4ecd-450b-98a2-c667996e119b" />

### Event Detail Page – Dark Mode
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/11b07bd2-4827-401d-b874-6920c2bce385" />

### Bookmarking Events
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/6dddbc12-3e67-4749-93e6-e166db376e04" />

### User Profile
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/ed127fcb-15f0-4533-a632-21b754e05d67" />

**Bookmarked Events**

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/f9a0dfb6-9b26-4b86-8083-04658c6c88e4" />

### Admin Panel
<img width="1707" alt="image" src="https://github.com/user-attachments/assets/33f5b276-0ca9-456f-80a3-ae7279d96041" />

**Trending Events**

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/058a90e3-52f3-4a14-a5dc-9181052d7c1d" />

**All Events**

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/bbb4871e-030f-402a-97dc-7bb653e2d52a" />

**Manage Users**

<img width="1707" alt="image" src="https://github.com/user-attachments/assets/8786375c-48e2-443b-8702-5b84d856c4cb" />

## Project Management

This project is managed using a Jira board. You can view our tasks, progress, and backlog here:
[View Jira Board](https://eventsphereweb.atlassian.net/jira/core/projects/WEB4/board?groupBy=priority&atlOrigin=eyJpIjoiMTg5MzJhYmE1MGI1NDM2ODkwY2MyMDFkOTFkMzBkN2QiLCJwIjoiaiJ9)
##  Note

This project was developed as part of the **Web and Distributed Computing (WDC)** course group project.
