# Vanilla JavaScript + Vite Frontend

This is a simple frontend application built with vanilla JavaScript and Vite for the e-commerce starter project.

## Features

- **ES6 Modules**: Modern JavaScript module system
- **Vite Dev Server**: Fast hot module replacement (HMR)
- **Plain CSS**: Simple, maintainable styles without preprocessors
- **API Integration**: Fetches data from Products, Users, and Orders services

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
├── public/
│   └── vite.svg           # Favicon
└── src/
    ├── main.js            # Application entry point
    ├── styles.css         # Global styles
    ├── api/
    │   └── api.js         # API communication utilities
    └── components/
        ├── products.js    # Products display component
        ├── users.js       # Users display component
        └── orders.js      # Orders display component
```

## Development

### Prerequisites
- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at http://localhost:5173

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Environment Variables

The following environment variables are used (prefixed with `VITE_` for Vite):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PRODUCTS_API_URL` | Products service URL | `http://localhost:8082` |
| `VITE_USERS_API_URL` | Users service URL | `http://localhost:8000` |
| `VITE_ORDERS_API_URL` | Orders service URL | `http://localhost:8083` |

## Docker

The frontend runs in a Docker container with Vite's development server:

```bash
docker-compose up frontend
```

## Learning Resources

This project demonstrates:
- ES6 module imports/exports
- Async/await for API calls
- Template literals for HTML generation
- CSS Grid and Flexbox layouts
- Error handling patterns
- Environment variable usage with Vite
