# EventSphere

EventSphere is a full-stack web application built to help users explore, filter, and register for events seamlessly. With a clean frontend interface and robust backend integration, it provides functionality for user authentication and event discovery. This application is structured into separate services for backend, frontend, and database, with a proxy server facilitating secure communication between components.

---

##  Project Structure

- **Frontend**: Located in the `auth/` folder, served via a `proxy-server.js` file.
- **Backend**: Located in the `backend/` folder, built with Node.js and integrated with Kafka.
- **Database**: MySQL, managed locally.

---

## 🛠 Setup Instructions

Follow the steps below to get the EventSphere app up and running locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
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

```bash
sudo service mysql start
```

> Ensure MySQL is properly installed and configured.


##  Access the Application

- **Homepage**: [http://localhost:3000/homepage/index.html](http://localhost:3000/homepage/index.html)
- **Login Page**: [http://localhost:3000/login/login.html](http://localhost:3000/login/login.html)
- **Signup Page**: [http://localhost:3000/signup/signup.html](http://localhost:3000/signup/signup.html)

---

##  Features

- **User Signup** – Register a new account  
- **User Login** – Secure login session  
- **User Logout** – End user session safely  
- **Search Events**:
  - Filter by **Date**
  - Filter by **City**

---

##  Known Bugs or Limitations

_To be added_

---

##  Tech Stack

- **Backend**: Node.js, Express, KafkaJS  
- **Frontend**: HTML, CSS, JavaScript  
- **Database**: MySQL  
- **Others**: Nodemon, KafkaJS, Custom Proxy Server

---

##  Note

This project was developed as part of the **Web and Distributed Computing (WDC)** course group project.
