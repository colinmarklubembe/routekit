# @exkit/routekit

A small utility to simplify route registration in Express apps.  
Supports typed routes, optional middleware, and easy error handling.

## ✨ Features

- **Typed route configuration**: Define routes with TypeScript for better type safety.  
- **Optional global and per-route middleware**: Add middleware globally or to specific routes.  
- **Optional auth middleware**: Easily integrate authentication middleware.  
- **Built-in async error handling wrapper**: Simplify error handling with built-in support for async handlers.  
- **Supports custom request types**: Extend the request object (e.g., `req.user`) for more flexibility.  
- **Duplicate route detection**: Logs a warning when duplicate routes are registered.  

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

### Duplicate Route Detection

If the same route is registered more than once, a warning will be logged:

```bash
⚠️ Duplicate route detected: GET /path
```

You can prevent this by ensuring each route path is unique when registering routes.

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
  - **`authMiddleware`**: Optionally add authentication middleware for protected routes.  
  - **`globalMiddlewares`**: Optionally add global middleware to all routes.  

### `withErrorHandling`

Wraps an async route handler with error handling. This ensures that any thrown error is passed to Express's error middleware.

```typescript
withErrorHandling<T extends express.Request>(
    handler: (req: T, res: express.Response) => Promise<void>
): (req: T, res: express.Response, next: express.NextFunction) => void;
```

- **`handler`**: The async route handler to wrap.  

### `RouteConfig`

The configuration object for defining a route.

```typescript
interface RouteConfig<TReq extends express.Request = express.Request> {
  method: HttpMethod; 
  path: string; 
  handler: ControllerMethod<TReq>;
  middlewares?: express.RequestHandler[]; 
  description?: string;
}
```

- **`method`**: The HTTP method for the route (e.g., "get", "post", etc.).  
- **`path`**: The route path (e.g., "/users").  
- **`handler`**: The function that handles the request. It can be asynchronous.  
- **`middlewares`**: An optional array of middleware functions to apply to this specific route.  
- **`description`**: An optional description of the route, which is logged if `logRoutes` is enabled.  

### `ControllerMethod`

A type for defining request handler functions with custom request types.

```typescript
type ControllerMethod<TReq extends express.Request = express.Request> = (
  req: TReq,
  res: express.Response
) => Promise<void>;
```

You can extend the `Request` type (e.g., `req.user`) for more flexibility.

## 📄 License

This project is licensed under the [MIT License](https://github.com/colinmarklubembe/routekit?tab=MIT-1-ov-file).

## 🙏 Acknowledgements

- **Express.js** for providing the foundation for this utility.  
- **TypeScript** for enabling type-safe route configurations.  
