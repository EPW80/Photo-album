# TRUMP Digital Media Photo Album

[![CI](https://github.com/username/Photo-album-main/workflows/CI/badge.svg)](https://github.com/username/Photo-album-main/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg)](./coverage)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.18.0-green.svg)](https://nodejs.org/)

## Overview

A modern, fully-tested photo album web application built with Node.js, Express, and TypeScript. This project showcases best practices in web development including comprehensive testing, error handling, input validation, and a clean service-oriented architecture.

## Features

### User Features
- **Responsive Design**: Fully responsive layout that works seamlessly across all devices
- **Interactive Gallery**: Hover effects, smooth animations, and modal photo views
- **Dynamic Loading**: Photos loaded dynamically from backend API with loading states
- **Error Handling**: Graceful error messages when content fails to load

### Developer Features
- **Modern TypeScript**: TypeScript 5.9+ with strict type checking
- **Service Layer Architecture**: Clean separation of concerns (Controller → Service → Model)
- **Comprehensive Testing**: 98%+ test coverage with Jest and Supertest
- **Input Validation**: Robust validation middleware with proper error responses
- **Error Handling**: Centralized error handling with custom error classes
- **API Documentation**: Complete API documentation in [docs/API.md](docs/API.md)
- **CI/CD Pipeline**: Automated testing and linting with GitHub Actions
- **Code Quality**: ESLint + Prettier with pre-commit hooks via Husky

## Tech Stack

- **Runtime**: Node.js 22.18.0
- **Framework**: Express 4.22.1
- **Language**: TypeScript 5.9.3
- **Testing**: Jest 30.2.0 + Supertest 7.2.2
- **Styling**: Tailwind CSS 3.4.6
- **Build**: PostCSS + TypeScript Compiler
- **Quality**: ESLint + Prettier + Husky

## Installation

### Prerequisites

- Node.js 20.17+ or 22.9+ (see [.nvmrc](.nvmrc))
- npm 11.5.2+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Photo-album-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file** (optional)
   ```bash
   cp .env.example .env
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Usage

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

Build and start in production mode:
```bash
npm run build
npm run start:prod
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with ts-node |
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm run build` | Build TypeScript + CSS + copy assets |
| `npm run start:prod` | Start production server |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Endpoints

#### GET /photos
Returns all photos in the collection.

**Response:**
```json
[
  {
    "id": 1,
    "url": "/images/maga.png"
  },
  ...
]
```

#### GET /photo/:id
Returns a single photo by ID.

**Parameters:**
- `id` (number, required) - Photo ID (positive integer)

**Response:**
```json
{
  "id": 1,
  "url": "/images/maga.png"
}
```

**Error Response:**
```json
{
  "error": "Photo not found",
  "statusCode": 404
}
```

## Project Structure

```
Photo-album-main/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── docs/
│   └── API.md                  # API documentation
├── public/
│   ├── index.html              # Main HTML file
│   ├── js/
│   │   └── app.js             # Frontend JavaScript
│   ├── images/                 # Photo assets
│   └── styles/                 # Compiled CSS
├── src/
│   ├── __tests__/              # Test files
│   │   ├── app.test.ts        # API integration tests
│   │   ├── envValidation.test.ts
│   │   ├── middleware.test.ts
│   │   ├── photo.test.ts
│   │   ├── photoService.test.ts
│   │   └── types.test.ts
│   ├── config/
│   │   └── photos.json        # Photo data configuration
│   ├── controllers/
│   │   └── photoController.ts # HTTP request handlers
│   ├── middleware/
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   └── validation.ts      # Input validation
│   ├── models/
│   │   └── photo.ts           # Photo model
│   ├── routes/
│   │   └── photoRoutes.ts     # Route definitions
│   ├── services/
│   │   └── photoService.ts    # Business logic layer
│   ├── styles/
│   │   └── tailwind.css       # Tailwind source
│   ├── types/
│   │   └── photo.types.ts     # TypeScript type definitions
│   ├── views/
│   │   └── photoView.ts       # Server-side view (unused)
│   └── app.ts                  # Express app setup
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore patterns
├── .nvmrc                      # Node version specification
├── .prettierrc.json            # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## Architecture

### Request Flow
```
Client Request
    ↓
Express Router
    ↓
Validation Middleware (validatePhotoId)
    ↓
Async Handler (error catching)
    ↓
Controller (HTTP layer)
    ↓
Service (business logic)
    ↓
Model (data structure)
    ↓
Error Handler Middleware (if error)
    ↓
JSON Response
```

### Key Design Patterns
- **Service Layer**: Business logic separated from HTTP concerns
- **Middleware Pattern**: Reusable request processing (validation, error handling)
- **DTO Pattern**: Type-safe data transfer objects
- **Error Handling**: Centralized with custom `AppError` class
- **Dependency Injection**: Services injected into controllers

## Testing

The project has comprehensive test coverage:

- **Integration Tests**: API endpoint testing with Supertest
- **Unit Tests**: Service, middleware, and utility function tests
- **Type Tests**: TypeScript type guard testing
- **Environment Tests**: Configuration validation

### Coverage Report

```
File                 | Statements | Branches | Functions | Lines
---------------------|------------|----------|-----------|-------
All files            |    98.91%  |  95.83%  |   96.15%  | 98.8%
 controllers         |     100%   |   100%   |    100%   | 100%
 middleware          |     100%   |   100%   |    100%   | 100%
 models              |     100%   |   100%   |    100%   | 100%
 routes              |     100%   |   100%   |    100%   | 100%
 services            |     100%   |   100%   |    100%   | 100%
 types               |     100%   |   100%   |    100%   | 100%
```

Run tests:
```bash
npm test                  # Run all tests
npm run test:coverage     # Generate coverage report
npm run test:watch        # Watch mode for development
```

## Code Quality

### Linting & Formatting

- **ESLint**: Strict TypeScript rules, no `any` types allowed
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks prevent bad code from being committed

### Pre-commit Hooks

Automatically runs on `git commit`:
- ESLint checks and auto-fixes
- Prettier formatting
- Type checking

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
```

**Valid NODE_ENV values:** `development`, `production`, `test`

## Deployment

### Live Site

[View on Render](https://photo-album-fqg3.onrender.com/)

### Build for Production

```bash
npm run build
npm run start:prod
```

### Docker (Coming Soon)

Docker support will be added in Phase 6 (Production Hardening).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

**Note**: Pre-commit hooks will automatically run tests and linting.

## Development Roadmap

### Completed ✅
- Phase 1: Foundation & Security (Dependencies, TypeScript 5, 0 vulnerabilities)
- Phase 2: Code Quality (ESLint, Prettier, Husky, git hooks)
- Phase 3: Testing Infrastructure (Jest, 98% coverage, CI/CD)
- Phase 4: Architecture Refactoring (Service layer, validation, error handling)

### Planned
- Phase 5: Modern Development Experience (Vite, debugging, optimization)
- Phase 6: Production Hardening (Logging, security headers, Docker, monitoring)

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built with modern web technologies and best practices
- Comprehensive testing ensures reliability
- Clean architecture enables easy maintenance and extension

---

**Modernized with:** Node.js • TypeScript • Express • Jest • Tailwind CSS

**Quality Metrics:** 98% Test Coverage • 0 Vulnerabilities • 100% Type Safe
