# E-commerce Starter

## Services
- **Frontend**: Vanilla JavaScript + Vite 7.2.4 (Port 5173)
- **Products**: PHP Slim 4.15.1 (Port 8082)
- **Users**: Python FastAPI 0.120.0 (Port 8000)
- **Orders**: Java Spring Boot 4.0.2 (Port 8083)
- **Database**: PostgreSQL 18.1 (Port 5432)

## Quick Start
1. **Configure**: `cp .env.example .env`
2. **Run**: `docker-compose up --build`

## Structure
- `frontend/`: UI application (Vanilla JavaScript)
- `products-service/`: Product catalog API (PHP)
- `users-service/`: User management API (Python)
- `orders-service/`: Order management API (Java)
- `database/`: Prisma migrations

## Documentation
- [Development Setup Guide](dev-starter.md) - **Start here for new developers**
- [Architecture Overview](ARCHITECTURE.md)
- [Frontend Conversion Plan](plans/frontend-vanilla-js-conversion.md)
