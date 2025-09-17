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
│   │   └── ai/         # AI agents for issue analysis
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
- OpenAI API key for AI analysis features

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure the environment variables:

Update the `.env` file with your configuration:

```
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/public_pulse"

# Server Configuration
PORT=3000

# OpenAI API for AI analysis
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
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
- `GET /api/issues`: Get all issues
- `GET /api/issues/:id`: Get issue by ID
- `POST /api/issues`: Create a new issue (with automatic AI severity and department assignment)

## AI Features

The system uses AI to automatically analyze issues when they are submitted:

1. **Severity Scoring**: Issues are automatically scored on a scale of 1-10 based on their urgency and impact
2. **Department Assignment**: Issues are automatically routed to the appropriate government department

For more details, see [AI_FEATURES.md](./AI_FEATURES.md).

## Development Tools

- **Prisma Studio**: A visual database editor for your Prisma schema

```bash
npm run prisma:studio
```
