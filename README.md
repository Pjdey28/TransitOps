<div align="center">

# 🚛 TransitOps
### Smart Fleet & Transport Management System

A modern role-based fleet management platform that streamlines transportation operations, trip management, vehicle maintenance, fuel monitoring, financial tracking, and business analytics.

---

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Framework-Express-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)

</div>

---

# 📖 Table of Contents

- Introduction
- Problem Statement
- Solution
- Features
- Role Based Access Control
- Business Workflow
- Technology Stack
- System Architecture
- Folder Structure
- Demo Credentials
- Installation Guide
- Environment Variables
- Running the Project
- API Overview
- Business Value
- Future Scope
- Contributors
- License

---

# 🚀 Introduction

TransitOps is a full-stack fleet management system designed to help logistics companies efficiently manage their transportation operations.

Instead of maintaining multiple spreadsheets and manual registers for vehicles, drivers, fuel logs, maintenance records and trips, TransitOps provides one centralized dashboard for complete operational visibility.

The system supports multiple user roles with secure authentication and authorization while providing business insights through analytics and reporting dashboards.

---

# ❗ Problem Statement

Fleet management companies face several operational challenges:

- Vehicle utilization is difficult to track.
- Drivers are assigned manually.
- Trips are difficult to monitor.
- Maintenance schedules are often missed.
- Fuel expenses increase due to poor monitoring.
- Business reports require manual calculations.
- No centralized operational dashboard.

These inefficiencies result in:

- Increased operational cost
- Delayed deliveries
- Higher maintenance expenses
- Poor decision making
- Lack of accountability

---

# 💡 Solution

TransitOps digitizes the complete transportation workflow.

The application enables organizations to:

- Manage vehicles
- Manage drivers
- Create and dispatch trips
- Track maintenance
- Record fuel usage
- Monitor expenses
- Generate analytics
- Export reports

Everything is accessible through a secure role-based dashboard.

---

# ✨ Features

## Authentication

- JWT Authentication
- Secure Login
- Password Encryption using bcrypt
- Protected APIs

---

## Vehicle Management

- Add vehicles
- Update vehicle information
- Delete vehicles
- Vehicle status tracking
- Vehicle utilization

---

## Driver Management

- Driver records
- License validation
- Safety score tracking
- Driver availability
- Suspension handling

---

## Trip Management

- Draft Trips
- Dispatch Trips
- Complete Trips
- Cancel Trips
- Capacity validation
- Driver availability validation
- License expiry validation

---

## Maintenance Module

- Maintenance logs
- Vehicle repair history
- Close maintenance requests
- Automatic vehicle status updates

---

## Fuel Management

- Fuel entries
- Fuel cost tracking
- Fuel efficiency calculation

---

## Expense Tracking

- Operational expenses
- Vehicle expenses
- Cost analysis

---

## Analytics Dashboard

- Fleet utilization
- Operational cost
- Vehicle ROI
- Fuel efficiency
- Revenue trends
- Vehicle performance

---

## Reports

- Operational reports
- ROI calculation
- Fuel efficiency reports
- Vehicle performance reports

---

# 👥 Role Based Access Control

| Role | Permissions |
|-------|------------|
| Fleet Manager | Full Access |
| Driver | Trips, Fuel |
| Safety Officer | Driver Management |
| Financial Analyst | Expenses, Fuel, Analytics |

---

# 🔄 Business Workflow

```text
Vehicle Registration
          │
          ▼
Driver Assignment
          │
          ▼
Trip Creation
          │
          ▼
Trip Dispatch
          │
          ▼
Fuel Logs
          │
          ▼
Expense Tracking
          │
          ▼
Maintenance
          │
          ▼
Analytics
          │
          ▼
Business Reports
```

---

# 🏗 System Architecture

```text
                React Frontend
                      │
          REST API (Axios)
                      │
                Express Server
                      │
       Controllers → Middleware
                      │
              MongoDB Database
```

---

# 💻 Technology Stack

## Frontend

- React
- Vite
- CSS
- Recharts
- Framer Motion
- Lucide Icons

## Backend

- Node.js
- Express.js
- JWT
- bcrypt
- CORS

## Database

- MongoDB
- Mongoose

---

# 📂 Project Structure

```
TransitOps
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── styles
│   └── App.jsx
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── seed.js
│   └── server.js
│
└── README.md
```

---

# 🔑 Demo Credentials

All demo users use the same password.

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | fleet@transitops.com | password |
| Driver | driver@transitops.com | password |
| Safety Officer | safety@transitops.com | password |
| Financial Analyst | finance@transitops.com | password |

> These accounts are automatically created using the seed script. :contentReference[oaicite:0]{index=0}

---

# ⚙ Installation Guide

## Clone Repository

```bash
git clone https://github.com/Satyam20-cs/TransitOps.git

cd TransitOps
```

---

## Backend Setup

```bash
cd backend

npm install
```

---

Create a `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key
```

---

Start backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🌱 Seed Database

Run

```bash
npm run seed
```

This automatically creates

- Demo Users
- Demo Vehicles
- Demo Drivers
- Sample Fuel Logs

---

# 🌐 Running the Application

Backend

```
http://localhost:5000
```

Frontend

```
http://localhost:5173
```

---

# 📡 API Overview

Authentication

```
POST /api/auth/login

POST /api/auth/register
```

Vehicles

```
GET /api/vehicles

POST /api/vehicles

PUT /api/vehicles/:id

DELETE /api/vehicles/:id
```

Drivers

```
GET /api/drivers

POST /api/drivers
```

Trips

```
GET /api/trips

POST /api/trips

PATCH /dispatch

PATCH /complete
```

Maintenance

```
GET /maintenance

POST /maintenance
```

Fuel

```
GET /fuel

POST /fuel
```

Expenses

```
GET /expenses

POST /expenses
```

Analytics

```
GET /dashboard

GET /reports
```

---

# 📈 Business Value

TransitOps enables organizations to

- Reduce manual work
- Improve fleet utilization
- Optimize fuel consumption
- Track operational expenses
- Improve maintenance planning
- Increase transparency
- Generate business insights
- Improve operational efficiency

---

# 📊 Key Business Metrics

- Fleet Utilization

- Operational Cost

- Vehicle ROI

- Fuel Efficiency

- Driver Availability

- Revenue

- Pending Trips

- Maintenance Cost

---

# 🔒 Security Features

- JWT Authentication

- Password Hashing

- Role Based Authorization

- Protected APIs

- Input Validation

- Secure Middleware

---

# 🚀 Future Scope

- GPS Tracking

- Live Vehicle Location

- Driver Mobile App

- Route Optimization using AI

- Predictive Maintenance

- Email Notifications

- SMS Alerts

- Multi Organization Support

- Cloud Deployment

- Docker Support

- CI/CD Pipeline

---

# 📷 Screenshots

Add screenshots here after deployment.

```
Dashboard

Analytics

Trip Management

Vehicle Management

Maintenance

Reports
```

---

# 👨‍💻 Contributors

| Name | Role |
|------|------|
| Animesh Sahoo | System Architecture |
| Pranjal Dey | Frontend & Backend |
| Satyam Mohanty | Frontend & Backend |

---

# 📜 License

This project is developed for educational purposes and hackathons.

Feel free to modify and extend it according to your requirements.

---
