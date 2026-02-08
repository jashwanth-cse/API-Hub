# API Hub Backend

A clean, modular Node.js backend foundation for the API Hub project.

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Express server entry point
│   ├── config/
│   │   └── env.js             # Environment configuration
│   ├── db/
│   │   └── supabaseClient.js  # Supabase client setup
│   ├── middleware/
│   │   └── apiKeyAuth.js      # API key authentication
│   ├── routes/
│   │   └── accessibility.js   # API routes
│   └── services/
│       └── accessibilityService.js  # Business logic
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: (Optional) Service role key for admin operations
- `API_KEY`: Your custom API key for endpoint protection

### 3. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Health Check
- **GET** `/health` - Check if the API is running (no auth required)

### Accessibility Resources
All endpoints require the `x-api-key` header.

- **GET** `/api/accessibility` - Get all resources
- **GET** `/api/accessibility/:id` - Get a specific resource
- **POST** `/api/accessibility` - Create a new resource
- **PUT** `/api/accessibility/:id` - Update a resource
- **DELETE** `/api/accessibility/:id` - Delete a resource

### Authentication

All API endpoints (except `/health`) require an API key in the request headers:

```
x-api-key: your_api_key_here
```

## Features

✅ **Modular Architecture** - Clear separation of concerns  
✅ **Express.js** - Fast, unopinionated web framework  
✅ **Supabase Integration** - Ready-to-use database client  
✅ **API Key Authentication** - Secure your endpoints  
✅ **Security Middleware** - Helmet.js for HTTP headers  
✅ **CORS Support** - Configurable cross-origin requests  
✅ **Request Logging** - Morgan for HTTP request logs  
✅ **Error Handling** - Global error handler  
✅ **ES Modules** - Modern JavaScript import/export  

## Development

The project uses ES modules (`"type": "module"` in package.json). Use `import/export` syntax instead of `require`.

## Adding New Routes

1. Create a new service in `src/services/`
2. Create a new route file in `src/routes/`
3. Import and use the route in `src/server.js`

Example:
```javascript
import newRoutes from './routes/newRoutes.js';
app.use('/api/new', apiKeyAuth, newRoutes);
```

## License

ISC
