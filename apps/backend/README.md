<h1 align="center">
    <br>
    <img src="novelya-icon.jpg" width="120">
    <br>
    Novelya - Backend
    <br>
</h1>

<h4 align="center">A minimalist REST API for a light novel e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.</h4>

<p align="center">
  Novelya is an e-commerce backend API designed for selling light novels. This project is a complete rebuild of an Angular + API application I started during my first-year internship in BTS SIO. Built with modern practices, it features JWT authentication, role-based authorization, and clean architecture.
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation--setup">Installation & Setup</a> •
  <a href="#api-endpoints">API Endpoints</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#file-structure">File Structure</a> •
  <a href="#known-issues">Known Issues</a> •
  <a href="#license">License</a>
</p>

## Key Features

• **JWT Authentication** – Secure login with access and refresh tokens  
• **Role-Based Access Control** – Two roles: User and Admin  
• **Product Management** – CRUD operations for light novels (Admin only)  
• **User Management** – Profile management and user administration  
• **Purchase History** – View order history (read-only for users)  
• **Wishlist System** – Add/remove products from personal wishlist  
• **File Upload** – Cover image management for light novels  
• **Docker Support** – Containerized setup for development and production  
• **API Documentation** – Swagger/OpenAPI documentation

## Installation & Setup

### Prerequisites

• Node.js 18+ and npm  
• MongoDB 6.0+  
• Docker (recommended for easy setup)

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/UnOrdinary95/novelya-back.git

# Navigate to the project directory
cd novelya-back

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with your configuration (see .env.example)

# Run with Docker (recommended)
docker-compose up

# Or run locally
npm run dev
```

## API Endpoints

### Authentication

-   `POST /register` – Register a new user
-   `POST /login` – Login and receive JWT token (stored in HttpOnly cookie)
-   `POST /logout` – Logout and clear JWT cookie

### Users

-   `GET /users/me` – Get current user profile
-   `GET /users` – List all users (Admin only)
-   `GET /users/:id` – Get a specific user (Self or Admin)
-   `PUT /users/:id` – Update user profile (Self or Admin)
-   `DELETE /users/:id` – Delete user account (Self or Admin)
-   `PATCH /users/:id/cart` – Update user's cart (Self only)
-   `PATCH /users/:id/history` – Validate purchase and add to history (Self only)
-   `PATCH /users/:id/wishlist` – Toggle light novel in wishlist (Self only)

### Light Novels

-   `GET /lightnovels` – List all light novels
-   `GET /lightnovels/search/:name` – Search light novels by name
-   `GET /lightnovels/genre/:genre` – Get light novels by genre
-   `GET /lightnovels/:id` – Get a specific light novel
-   `POST /lightnovels` – Create a light novel (Admin only)
-   `PUT /lightnovels/:id` – Update a light novel (Admin only)
-   `DELETE /lightnovels/:id` – Delete a light novel (Admin only)
-   `PATCH /lightnovels/:id/cover` – Upload cover image (Admin only)

Full API documentation available at `/docs` when running the server.

## Architecture

Novelya follows a clean architecture pattern:

• **Controllers** (`src/controllers/`) handle HTTP requests/responses and orchestrate business logic  
• **Models** (`src/models/`) contain data access layer (DAL) functions for MongoDB operations (CRUD)  
• **Interfaces** (`src/interfaces/`) define TypeScript interfaces for type safety (User, LightNovel, etc.)  
• **Middlewares** (`src/middlewares/`) provide authentication (JWT), authorization and file upload  
• **Routes** (`src/routes/`) define API endpoints and map them to controllers  
• **Utils** (`src/utils/`) contain helper functions (validation, conversion, authentication checks)  
• **Config** (`src/config/`) manages database connection singleton and environment configuration

The entry point is [src/server.ts](src/server.ts), which initializes Express, connects to MongoDB, and starts the HTTP server. Routing is centralized in [src/app.ts](src/app.ts).

## File Structure

```
novelya-back/
├── src/
│   ├── app.ts                      # Express app configuration & routing
│   ├── server.ts                   # Application entry point
│   ├── constants.ts                # Global constants (JWT secrets, patterns, etc.)
│   ├── controllers/                # HTTP request/response handlers
│   │   ├── userController.ts       # User-related endpoints logic
│   │   └── lightNovelController.ts # Light novel endpoints logic
│   ├── models/                     # Data Access Layer (DAL) - MongoDB CRUD
│   │   ├── userModel.ts            # User database operations
│   │   └── lightNovelModel.ts      # Light novel database operations
│   ├── interfaces/                 # TypeScript type definitions
│   │   ├── User.ts                 # User & UserDB interfaces
│   │   ├── LightNovel.ts           # LightNovel & LightNovelDB interfaces
│   │   ├── CartItem.ts             # Cart item structure
│   │   ├── PurchaseHistoryItem.ts  # Purchase history structure
│   │   └── TokenPayload.ts         # JWT payload structure
│   ├── middlewares/                # Request interceptors
│   │   ├── authMiddleware.ts       # JWT authentication & verification
│   │   └── uploadCoverMiddleware.ts # File upload handling (Multer)
│   ├── routes/                     # API endpoint definitions
│   │   ├── authRouter.ts           # /register, /login, /logout
│   │   ├── userRouter.ts           # /users/* endpoints
│   │   └── lightNovelRouter.ts     # /lightnovels/* endpoints
│   ├── utils/                      # Helper & utility functions
│   │   ├── authentificationUtils.ts # Password hashing & JWT generation
│   │   ├── authUserUtils.ts        # Authorization checks (admin, self)
│   │   ├── registrationUtils.ts    # User registration logic
│   │   ├── userUtils.ts            # User validation & ID conversion
│   │   ├── lightNovelUtils.ts      # Light novel validation & conversion
│   │   └── loggerUtils.ts          # Winston logger configuration
│   ├── config/                     # Configuration & connection
│   │   └── db.ts                   # MongoDB connection singleton
│   └── docs/                       # API documentation
│       └── swagger.yaml            # OpenAPI specification
├── public/
│   └── covers/                     # Uploaded cover images
├── docker-compose.yaml             # Docker development setup
├── docker-compose.prod.yaml        # Docker production setup
├── Dockerfile                      # Development Docker image
├── Dockerfile.prod                 # Production Docker image
├── package.json                    # Node.js dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## Known Issues

None at this time. Please [open an issue](https://github.com/UnOrdinary95/novelya-back/issues) if you encounter any problems.

## License

MIT
