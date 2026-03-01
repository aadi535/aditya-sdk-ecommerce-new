# Development Environment Setup Guide

This guide provides step-by-step instructions for setting up a clean development environment after cloning the repository.

## Prerequisites

Before starting, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started) (with Docker Compose)
- [Git](https://git-scm.com/)

## Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd sdk-template-project
```

### Step 2: Configure Environment Variables

Copy the example environment file and adjust values if needed:

```bash
cp .env.example .env
```

The default configuration uses:
- Frontend: `http://localhost:5173`
- Products Service (PHP): `http://localhost:8082`
- Users Service (Python): `http://localhost:8000`
- Orders Service (Java): `http://localhost:8083`
- Database (PostgreSQL): `localhost:5432`

### Step 3: Start All Services

Build and start all Docker containers:

```bash
docker compose up -d --build
```

This command will:
- Build all service images
- Start the PostgreSQL database
- Run database migrations
- Start all backend services
- Start the frontend development server

### Step 4: Install PHP Dependencies

The Products Service requires Composer dependencies to be installed inside the container. This is necessary because the volume mount overwrites the container's vendor directory:

```bash
docker compose exec products-service composer install
```

### Step 5: Verify Services Are Running

Check that all containers are running:

```bash
docker compose ps
```

You should see all services with status "Up" or "running".

### Step 6: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Products API**: http://localhost:8082/products
- **Users API**: http://localhost:8000/users
- **Orders API**: http://localhost:8083/orders

---

## Common Issues and Solutions

### Issue 1: PHP Autoload Error

**Error Message:**
```
Warning: require(/var/www/html/public/../vendor/autoload.php): Failed to open stream: No such file or directory
Fatal error: Uncaught Error: Failed opening required '/var/www/html/public/../vendor/autoload.php'
```

**Cause:** The Docker volume mount overwrites the container's `/var/www/html` directory, removing the `vendor` folder that was created during the image build.

**Solution:**
```bash
docker compose exec products-service composer install
```

### Issue 2: CORS Errors

**Error Message:**
```
Access to fetch at 'http://localhost:8082/products' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause:** Backend services are not configured to allow cross-origin requests from the frontend.

**Solution:** CORS headers have been configured in all services. If you still encounter this issue after a fresh clone, ensure you're using the latest code and rebuild the services:

```bash
docker compose up -d --build
```

For the Orders Service (Java), changes require a rebuild:
```bash
docker compose up -d --build orders-service
```

### Issue 3: Database Connection Errors

**Error Message:**
```
Connection refused to database
```

**Cause:** The database container may not be ready when services try to connect.

**Solution:** Wait for the database to be healthy, then restart the affected service:

```bash
# Check database health
docker compose ps database

# Restart a specific service
docker compose restart products-service
```

### Issue 4: Port Already in Use

**Error Message:**
```
Error: bind: address already in use
```

**Cause:** Another application is using one of the required ports.

**Solution:** Either stop the conflicting application or modify the ports in `.env`:

```bash
# Edit .env file to change ports
FRONTEND_PORT=3000
PRODUCTS_SERVICE_PORT=8092
USERS_SERVICE_PORT=8001
ORDERS_SERVICE_PORT=8093
```

Then restart the services:
```bash
docker compose down
docker compose up -d
```

---

## Useful Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f products-service
docker compose logs -f users-service
docker compose logs -f orders-service
docker compose logs -f frontend
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart products-service
```

### Rebuild Services

```bash
# Rebuild all services
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build orders-service
```

### Stop All Services

```bash
docker compose down
```

### Clean Start (Remove All Data)

```bash
# Stop and remove containers, networks, and volumes
docker compose down -v

# Start fresh
docker compose up -d --build
docker compose exec products-service composer install
```

### Access Container Shell

```bash
# PHP service
docker compose exec products-service bash

# Python service
docker compose exec users-service bash

# Java service
docker compose exec orders-service sh

# Database
docker compose exec database psql -U postgres -d ecommerce_db
```

---

## Service Architecture

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| Frontend | Vanilla JS + Vite | 5173 | Web application UI |
| Products Service | PHP + Slim | 8082 | Product management API |
| Users Service | Python + FastAPI | 8000 | User management API |
| Orders Service | Java + Spring Boot | 8083 | Order management API |
| Database | PostgreSQL | 5432 | Data persistence |
| Migration Runner | Prisma | - | Database migrations |

---

## Development Workflow

1. Make code changes in your local editor
2. For PHP and Python services, changes are reflected immediately due to volume mounts
3. For Java service, rebuild is required:
   ```bash
   docker compose up -d --build orders-service
   ```
4. For frontend, Vite hot-reload handles changes automatically
5. Check logs if something doesn't work:
   ```bash
   docker compose logs -f <service-name>
   ```
