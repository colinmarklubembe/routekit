# @exkit/routekit

A small utility to simplify route registration in Express apps.  
Supports typed routes, optional middleware, and easy error handling.

## ✨ Features

- **Typed route configuration**: Define routes with TypeScript for better type safety.  
- **Optional global and per-route middleware**: Add middleware globally or to specific routes.  
- **Optional auth middleware**: Easily integrate authentication middleware.  
- **Built-in async error handling wrapper**: Simplify error handling with built-in support for async handlers.  
- **Supports custom request types**: Extend the request object (e.g., `req.user`) for more flexibility.  

## 📦 Install

```bash
npm install @exkit/routekit
```

## 🧩 Usage

### Basic Setup

```typescript
import express from "express";
import { createRouteHandler } from "@exkit/routekit";

const app = express();
const router = express.Router();

const routes = [
    {
        method: "get",
        path: "/ping",
        handler: async (req, res) => {
            res.json({ message: "pong" });
        }
    }
];

createRouteHandler(router, routes);
app.use("/api", router);
```

### With Middleware and Error Handling

```typescript
import express from "express";
import { createRouteHandler, withErrorHandling } from "@exkit/routekit";

const app = express();
const router = express.Router();

const authMiddleware = (req, res, next) => {
    if (req.headers.authorization) return next();
    res.status(401).send("Unauthorized");
};

const routes = [
    {
        method: "get",
        path: "/profile",
        middlewares: [authMiddleware],
        handler: withErrorHandling(async (req, res) => {
            const user = await getUserFromDB();
            res.json(user);
        })
    }
];

createRouteHandler(router, routes, { logRoutes: true });
app.use("/api", router);
```

### Type Support

You can define your own extended request type like this:

```typescript
import express from "express";
import { createRouteHandler } from "@exkit/routekit";

interface AuthenticatedRequest extends express.Request {
    user: { id: string };
}

const app = express();
const router = express.Router();

const routes = [
    {
        method: "get",
        path: "/me",
        handler: async (req: AuthenticatedRequest, res) => {
            res.json({ userId: req.user.id });
        }
    }
];

createRouteHandler(router, routes);
app.use("/api", router);
```

## 📝 Documentation

### `createRouteHandler`

Registers routes on an Express router.

```typescript
createRouteHandler(
    router: express.Router, 
    routes: RouteConfig[], 
    options?: { logRoutes: boolean }
): void;
```

- **`router`**: The Express router to register routes on.  
- **`routes`**: An array of route configurations.  
- **`options`**: Optional configuration object.  
  - **`logRoutes`**: Logs registered routes to the console.  

### `withErrorHandling`

Wraps an async route handler with error handling.

```typescript
withErrorHandling<T extends express.Request>(
    handler: (req: T, res: express.Response) => Promise<void>
): (req: T, res: express.Response, next: express.NextFunction) => void;
```

- **`handler`**: The async route handler to wrap.  

## 🙏 Acknowledgements

- **Express.js** for providing the foundation for this utility.  
- **TypeScript** for enabling type-safe route configurations.  
