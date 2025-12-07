# 🚗 Vehicle Rental System

A comprehensive backend API for managing vehicle rental operations with role-based access control, built with Node.js, TypeScript, Express.js, and PostgreSQL.

## 🔗 Live Demo

**Live API**: [https://ph-lvl2-vehicle-mgnt-system.vercel.app/]

## ✨ Features

- **User Authentication & Authorization**
  - Secure JWT-based authentication
  - Role-based access control (Admin & Customer)
  - Password hashing with bcrypt

- **Vehicle Management**
  - Complete CRUD operations for vehicles
  - Real-time availability tracking
  - Support for multiple vehicle types (Car, Bike, Van, SUV)

- **Booking System**
  - Automated price calculation based on rental duration
  - Vehicle availability validation
  - Booking status management (Active, Cancelled, Returned)
  - Customer-specific booking history

- **User Management**
  - Admin user management capabilities
  - Profile updates with role-based permissions
  - Active booking constraints on user deletion

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcrypt
- **Database Client**: pg (node-postgres)

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mtushar78/ph-lvl2-vehicle-mgnt-system.git
cd ph-lvl2-vehicle-mgnt-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 4. Database Setup

The application will automatically create the required tables on first run. The schema includes:

- **users** - User accounts with role management
- **vehicles** - Vehicle inventory
- **bookings** - Rental transaction records

### 5. Build the Project

```bash
npm run build
```

### 6. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Dewan",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "01712345678",
  "role": "customer"
}
```

#### Login
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Vehicle Endpoints

#### Get All Vehicles (Public)
```http
GET /vehicles
```

#### Get Vehicle by ID (Public)
```http
GET /vehicles/:vehicleId
```

#### Create Vehicle (Admin Only)
```http
POST /vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_name": "Toyota Camry 2024",
  "type": "car",
  "registration_number": "ABC-1234",
  "daily_rent_price": 5000,
  "availability_status": "available"
}
```

#### Update Vehicle (Admin Only)
```http
PUT /vehicles/:vehicleId
Authorization: Bearer <token>
```

#### Delete Vehicle (Admin Only)
```http
DELETE /vehicles/:vehicleId
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <token>
```

#### Update User (Admin or Own Profile)
```http
PUT /users/:userId
Authorization: Bearer <token>
```

#### Delete User (Admin Only)
```http
DELETE /users/:userId
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "vehicle_id": 2,
  "rent_start_date": "2024-01-15",
  "rent_end_date": "2024-01-20"
}
```

#### Get Bookings (Role-based)
```http
GET /bookings
Authorization: Bearer <token>
```

#### Update Booking Status
```http
PUT /bookings/:bookingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "cancelled"
}
```

## 🗄️ Database Schema

### Users Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(50) | NOT NULL |
| role | VARCHAR(20) | CHECK (admin/customer) |

### Vehicles Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| vehicle_name | VARCHAR(255) | NOT NULL |
| type | VARCHAR(20) | CHECK (car/bike/van/SUV) |
| registration_number | VARCHAR(50) | UNIQUE, NOT NULL |
| daily_rent_price | DECIMAL(10,2) | NOT NULL, > 0 |
| availability_status | VARCHAR(20) | CHECK (available/booked) |

### Bookings Table
| Field | Type | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| customer_id | INTEGER | FOREIGN KEY (users) |
| vehicle_id | INTEGER | FOREIGN KEY (vehicles) |
| rent_start_date | DATE | NOT NULL |
| rent_end_date | DATE | NOT NULL |
| total_price | DECIMAL(10,2) | NOT NULL, > 0 |
| status | VARCHAR(20) | CHECK (active/cancelled/returned) |

## 🔐 Security Features

- Password encryption using bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention through parameterized queries

## 📦 Project Structure

```
src/
├── auth/               # Authentication logic
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.routes.ts
├── vehicles/           # Vehicle management
│   ├── vehicles.controller.ts
│   ├── vehicles.service.ts
│   └── vehicles.routes.ts
├── users/              # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.routes.ts
├── bookings/           # Booking management
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   └── bookings.routes.ts
├── middleware/         # Custom middleware
│   └── auth.ts
├── config/             # Configuration files
│   └── database.ts
├── database/           # Database setup
│   ├── schema.sql
│   └── init.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   └── env.ts
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## 🧪 Testing with Postman

Import the provided Postman collection (`Vehicle-Rental-System.postman_collection.json`) to test all endpoints.

1. Import the collection into Postman
2. Update the `BASE_URL` variable if needed
3. Start with signup/signin to get authentication tokens
4. Tokens are automatically saved to environment variables

## 🚀 Deployment

### Deploy to Render/Railway/Vercel

1. Push your code to GitHub
2. Connect your repository to your deployment platform
3. Set environment variables in the platform dashboard
4. Deploy!

### Environment Variables for Deployment

```
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_secret_key
PORT=5000
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error message"
}
```

---

**Note**: This is a backend API project. For frontend integration, use the endpoints documented above.
