# 🏠 RentEase - Digital Rental Platform

A modern, full-stack web application connecting tenants and landlords for seamless property rental management.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.3-cyan)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [UI/UX Design](#uiux-design)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)

---

## 🎯 Project Overview

**RentEase** is a comprehensive digital rental platform that bridges the gap between property seekers and landlords. Built with modern web technologies, it provides:

- **For Tenants**: Browse available properties, submit rental applications, track application status
- **For Landlords**: List properties, manage listings, review and approve/reject applications

### ✅ Project Scope

This project fulfills university requirements with:
- ✅ Single Page Application (SPA) architecture
- ✅ RESTful API design
- ✅ Multiple user actors (Tenant & Landlord)
- ✅ CRUD operations for all entities
- ✅ Authentication & authorization
- ✅ Modern, responsive UI/UX
- ✅ Database design with relationships

---

## ✨ Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Tenant/Landlord)
- Password hashing with bcrypt
- Protected routes and API endpoints

### Tenant Features
- Browse all available properties
- View detailed property information
- Submit rental applications with messages
- Track application status (pending/approved/rejected)
- View landlord contact information

### Landlord Features
- Create, read, update, delete property listings
- Set property status (available/occupied)
- View all applications for properties
- Approve or reject tenant applications
- Manage multiple properties

### UI/UX Features
- Modern glass-morphism design
- Smooth animations with Framer Motion
- Responsive layout for all devices
- Loading states and error handling
- Interactive cards and modals
- Beautiful gradient color schemes

---

## 🛠 Technology Stack

### Frontend
- **React 18.2** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS 3.3** - Utility-first styling
- **Framer Motion 10** - Animation library
- **JavaScript (JSX)** - Programming language

### Backend
- **FastAPI 0.104** - Python web framework
- **SQLAlchemy 2.0** - ORM
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation
- **python-jose** - JWT handling
- **Passlib** - Password hashing
- **Uvicorn** - ASGI server

### Development Tools
- **Git** - Version control
- **npm** - Package manager (frontend)
- **pip** - Package manager (backend)

---

## 📁 Project Structure

```
property/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection & session
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   │
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── user.py          # User model
│   │   ├── property.py      # Property model
│   │   └── application.py   # Application model
│   │
│   ├── schemas/             # Pydantic schemas
│   │   ├── user_schema.py
│   │   ├── property_schema.py
│   │   └── application_schema.py
│   │
│   ├── routers/            # API route handlers
│   │   ├── auth.py        # Authentication routes
│   │   ├── tenant.py      # Tenant routes
│   │   └── landlord.py    # Landlord routes
│   │
│   └── utils/             # Utility functions
│       └── jwt_handler.py # JWT token handling
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    │
    └── src/
        ├── main.jsx          # Application entry point
        ├── App.jsx           # Main app component with routing
        ├── index.css         # Global styles
        ├── api.js           # API client functions
        │
        ├── components/      # Reusable components
        │   ├── Navbar.jsx
        │   ├── HeroSection.jsx
        │   ├── PropertyCard.jsx
        │   ├── ApplicationCard.jsx
        │   └── DashboardSidebar.jsx
        │
        ├── pages/          # Page components
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── TenantDashboard.jsx
        │   └── LandlordDashboard.jsx
        │
        ├── context/       # React context
        │   └── AuthContext.jsx
        │
        └── hooks/        # Custom hooks
            └── useAuth.js
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.9 or higher)
- **PostgreSQL** (v13 or higher)
- **Git**

### Database Setup

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Linux
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   # Access PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE rentease;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE rentease TO postgres;
   \q
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # macOS/Linux:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run the backend server**
   ```bash
   python main.py
   ```

   Backend will be available at: `http://localhost:8000`
   API documentation at: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: `http://localhost:5173`

### Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the RentEase landing page
3. Try registering a new account
4. Check database tables were created: `psql rentease -c "\dt"`

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user (tenant or landlord)

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "tenant"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "tenant",
    "created_at": "2023-12-11T10:00:00"
  }
}
```

#### POST `/auth/login`
Authenticate existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { ... }
}
```

---

### Tenant Endpoints

**All tenant endpoints require `Authorization: Bearer <token>` header**

#### GET `/tenant/properties`
Get all available properties

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "landlord_id": 2,
    "title": "Modern 2BR Apartment",
    "description": "Beautiful apartment in downtown...",
    "rent_price": 1200.00,
    "location": "New York, NY",
    "status": "available",
    "created_at": "2023-12-11T10:00:00",
    "landlord_name": "Jane Smith",
    "landlord_email": "jane@example.com"
  }
]
```

#### POST `/tenant/apply`
Submit rental application

**Request Body:**
```json
{
  "property_id": 1,
  "message": "I'm interested in renting this property..."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "property_id": 1,
  "tenant_id": 1,
  "status": "pending",
  "message": "I'm interested in renting this property...",
  "created_at": "2023-12-11T10:00:00"
}
```

#### GET `/tenant/applications`
Get tenant's applications

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "tenant_id": 1,
    "status": "pending",
    "message": "I'm interested...",
    "created_at": "2023-12-11T10:00:00",
    "property_title": "Modern 2BR Apartment",
    "property_location": "New York, NY",
    "property_rent_price": 1200.00,
    "tenant_name": "John Doe",
    "tenant_email": "john@example.com"
  }
]
```

---

### Landlord Endpoints

**All landlord endpoints require `Authorization: Bearer <token>` header**

#### POST `/landlord/property`
Create new property listing

**Request Body:**
```json
{
  "title": "Cozy Studio Apartment",
  "description": "Perfect for singles or couples...",
  "rent_price": 850.00,
  "location": "Brooklyn, NY",
  "status": "available"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "landlord_id": 2,
  "title": "Cozy Studio Apartment",
  "description": "Perfect for singles or couples...",
  "rent_price": 850.00,
  "location": "Brooklyn, NY",
  "status": "available",
  "created_at": "2023-12-11T11:00:00"
}
```

#### GET `/landlord/properties`
Get all landlord's properties

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "landlord_id": 2,
    "title": "Cozy Studio Apartment",
    "description": "Perfect for singles...",
    "rent_price": 850.00,
    "location": "Brooklyn, NY",
    "status": "available",
    "created_at": "2023-12-11T11:00:00"
  }
]
```

#### PUT `/landlord/property/{property_id}`
Update property listing

**Request Body:**
```json
{
  "rent_price": 900.00,
  "status": "occupied"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "landlord_id": 2,
  "title": "Cozy Studio Apartment",
  "rent_price": 900.00,
  "status": "occupied",
  ...
}
```

#### DELETE `/landlord/property/{property_id}`
Delete property listing

**Response (204 No Content)**

#### GET `/landlord/applications`
Get all applications for landlord's properties

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "property_id": 2,
    "tenant_id": 1,
    "status": "pending",
    "message": "I'm interested...",
    "created_at": "2023-12-11T12:00:00",
    "property_title": "Cozy Studio Apartment",
    "property_location": "Brooklyn, NY",
    "property_rent_price": 900.00,
    "tenant_name": "John Doe",
    "tenant_email": "john@example.com"
  }
]
```

#### PUT `/landlord/application/{application_id}`
Update application status

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "approved",
  ...
}
```

---

## 🗃 Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────┐
│        Users            │
├─────────────────────────┤
│ PK  id                  │
│     full_name           │
│     email (unique)      │
│     password_hash       │
│     role (ENUM)         │
│     created_at          │
└─────────────────────────┘
         │ 1
         │
         │ landlord_id
         ├──────────────────────┐
         │ N                    │ N
         │                      │
         ▼                      ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│     Properties          │   │    Applications         │
├─────────────────────────┤   ├─────────────────────────┤
│ PK  id                  │   │ PK  id                  │
│ FK  landlord_id         │◄──┤ FK  property_id         │
│     title               │   │ FK  tenant_id           │
│     description         │   │     status (ENUM)       │
│     rent_price          │   │     message             │
│     location            │   │     created_at          │
│     status (ENUM)       │   └─────────────────────────┘
│     created_at          │
└─────────────────────────┘
```

### Table Descriptions

#### Users Table
- **id**: Primary key, auto-increment
- **full_name**: User's full name (required)
- **email**: Unique email address (required)
- **password_hash**: Bcrypt hashed password
- **role**: ENUM('tenant', 'landlord')
- **created_at**: Timestamp of account creation

#### Properties Table
- **id**: Primary key, auto-increment
- **landlord_id**: Foreign key to Users(id)
- **title**: Property title (required)
- **description**: Detailed property description
- **rent_price**: Monthly rent amount (decimal)
- **location**: Property location
- **status**: ENUM('available', 'occupied')
- **created_at**: Timestamp of listing creation

#### Applications Table
- **id**: Primary key, auto-increment
- **property_id**: Foreign key to Properties(id)
- **tenant_id**: Foreign key to Users(id)
- **status**: ENUM('pending', 'approved', 'rejected')
- **message**: Optional message from tenant
- **created_at**: Timestamp of application submission

### Database Constraints
- Cascade delete: Deleting a user/property deletes related records
- Unique constraint on user email
- Foreign key constraints ensure referential integrity

---

## 🎨 UI/UX Design

### Design Principles
- **Modern & Minimal**: Clean interface with focus on content
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Smooth Animations**: Framer Motion for fluid transitions
- **Responsive**: Mobile-first design approach
- **Accessible**: High contrast ratios and semantic HTML

### Color Palette

**Primary Colors (Blues)**
- 50: `#f0f9ff`
- 400: `#38bdf8`
- 600: `#0284c7` (Main)
- 800: `#075985`

**Accent Colors (Purples)**
- 400: `#e879f9`
- 600: `#c026d3` (Main)

**Neutral Colors**
- Slate 50-900 for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, 700-800 weight
- **Body**: Regular, 400 weight
- **Small Text**: Medium, 500 weight

### Component Examples

#### Hero Section Layout
```
┌─────────────────────────────────────────────────────┐
│  [Logo] RentEase          [Sign In] [Get Started]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Find Your Perfect Home Easily                     │
│  ════════════════════════                          │
│                                                     │
│  Connect with landlords, discover amazing          │
│  properties, and manage your rental journey         │
│  all in one place.                                 │
│                                                     │
│  [Get Started Free]  [Sign In]                     │
│                                                     │
│  500+         1000+        200+                    │
│  Properties   Happy Tenants Landlords              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  [Logo] RentEase     Welcome, John [Logout]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌────────────────────────────┐ │
│  │Sidebar   │  │  Main Content Area         │ │
│  │          │  │                            │ │
│  │Dashboard │  │  ┌────────┐  ┌────────┐  │ │
│  │My Props  │  │  │ Card 1 │  │ Card 2 │  │ │
│  │Apps      │  │  └────────┘  └────────┘  │ │
│  │Add New   │  │                            │ │
│  └──────────┘  └────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Animation Specifications
- **Page transitions**: 0.3s ease-out
- **Card hover**: -5px translateY, 0.3s
- **Button hover**: Scale 1.02, shadow increase
- **Modal appearance**: Scale 0.9 → 1.0, 0.2s
- **Loading spinner**: Continuous rotation

---

## 📖 Usage Guide

### For Tenants

1. **Registration**
   - Click "Get Started" or "Sign Up"
   - Fill in name, email, password
   - Select "Tenant" role
   - Click "Create Account"

2. **Browse Properties**
   - Login and navigate to dashboard
   - View all available properties
   - Check details: location, rent, description
   - See landlord contact information

3. **Apply for Property**
   - Click "Apply Now" on a property card
   - Write optional message
   - Submit application
   - Track status in "My Applications"

4. **Track Applications**
   - View all submitted applications
   - Check status: pending, approved, or rejected
   - See property details

### For Landlords

1. **Registration**
   - Click "Get Started" or "Sign Up"
   - Fill in name, email, password
   - Select "Landlord" role
   - Click "Create Account"

2. **Add Property**
   - Login and go to dashboard
   - Click "Add Property"
   - Fill in property details:
     - Title
     - Description
     - Rent price
     - Location
     - Status (available/occupied)
   - Click "Add Property"

3. **Manage Properties**
   - View all your properties
   - Edit property details
   - Update status
   - Delete listings

4. **Review Applications**
   - View all applications for your properties
   - See tenant information
   - Read application messages
   - Approve or reject applications

---

## 🌐 Deployment

### Backend Deployment (Heroku/Railway)

1. **Prepare for deployment**
   ```bash
   # Add Procfile
   echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile
   ```

2. **Set environment variables**
   - DATABASE_URL
   - SECRET_KEY
   - CORS_ORIGINS

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL`

### Database (Heroku Postgres/Supabase)
- Use managed PostgreSQL service
- Update DATABASE_URL in backend env

---

## 🔒 Security Features

- JWT tokens with expiration
- Password hashing with bcrypt
- CORS configuration
- SQL injection protection (ORM)
- XSS protection (React)
- Role-based authorization
- Input validation (Pydantic)

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] User can register as tenant
- [ ] User can register as landlord
- [ ] User can login
- [ ] Invalid credentials show error
- [ ] Token persists after refresh

**Tenant Features:**
- [ ] View all properties
- [ ] Apply for property
- [ ] Cannot apply twice
- [ ] View applications
- [ ] See application status

**Landlord Features:**
- [ ] Create property
- [ ] View all properties
- [ ] Edit property
- [ ] Delete property
- [ ] View applications
- [ ] Approve/reject applications

---

## 📝 License

This project is created for educational purposes as part of a university coursework.

---

## 👥 Contributors

- **Your Name** - Full Stack Developer

---

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using React, FastAPI, and PostgreSQL**
