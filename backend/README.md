# Public Pulse Backend

This is the backend service for Public Pulse, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Project Structure

```
backend/
├── prisma/             # Prisma schema and migrations
├── src/                # Source code
│   ├── controllers/    # Request controllers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── app.ts          # Main application entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure the database:

Update the `.env` file with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/public_pulse?schema=public"
PORT=3000
```

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

### Running the Application

**Development mode**:

```bash
# Using ts-node-dev (faster startup)
npm run dev

# Using nodemon (more configurable)
npm run nodemon
```

**Production mode**:

```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `POST /api/users`: Create a new user
- `GET /api/posts`: Get all posts
- `GET /api/posts/:id`: Get post by ID
- `POST /api/posts`: Create a new post

## Development Tools

- **Prisma Studio**: A visual database editor for your Prisma schema

```bash
npm run prisma:studio
```
