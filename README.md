# Enterprise E-Commerce Platform

Full-stack e-commerce platform with a React frontend and Express backend.

## Structure

```
enterprise-ecommerce/
├── frontend/    - React + Vite application
└── backend/     - Express API
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB
- Docker & Docker Compose (optional)

### Install Dependencies

```bash
cd frontend && npm install
cd backend && npm install
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` as needed.

### Run Development Servers

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

### Docker

```bash
docker-compose up --build
```

Frontend will be available at `http://localhost:3000`.
Backend will be available at `http://localhost:5000`.