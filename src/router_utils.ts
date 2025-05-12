import { Router, Request, Response, RequestHandler } from "express";

// Allowed HTTP methods for routing
type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

// TReq allows custom request types, like ones with `req.user`
export type ControllerMethod<TReq extends Request = Request> = (
  req: TReq,
  res: Response
) => Promise<void>;

// Configuration for a single route
export interface RouteConfig<TReq extends Request = Request> {
  method: HttpMethod; // HTTP method (get, post, etc.)
  path: string; // Route path (e.g. "/users")
  handler: ControllerMethod<TReq>; // Function that handles the request
  middlewares?: RequestHandler[]; // Optional route-specific middleware
}

// Optional global options when setting up routes
interface CreateRouteHandlerOptions {
  authMiddleware?: RequestHandler; // Optional auth middleware (e.g. JWT check)
  globalMiddlewares?: RequestHandler[]; // Middleware applied to all routes
  logRoutes?: boolean; // Whether to log registered routes
}

// Creates and registers all routes on a given Express router
export const createRouteHandler = <TReq extends Request = Request>(
  router: Router,
  routes: RouteConfig<TReq>[],
  options: CreateRouteHandlerOptions = {}
): Router => {
  const {
    authMiddleware, // Use this for protected routes (if needed)
    globalMiddlewares = [], // Apply these to every route
    logRoutes = false, // Enable/disable logging
  } = options;

  // Loop through each route config and register it
  routes.forEach(({ method, path, handler, middlewares = [] }) => {
    // Build middleware stack in order:
    // 1. Global middleware (e.g., CORS, JSON body parser)
    // 2. Optional auth middleware
    // 3. Route-specific middleware
    // 4. Controller handler
    const stack: RequestHandler[] = [
      ...globalMiddlewares,
      ...(authMiddleware ? [authMiddleware] : []),
      ...middlewares,
      handler as unknown as RequestHandler, // Type cast needed for Express compatibility
    ];

    // Log route registration if enabled
    if (logRoutes) {
      console.log(`Registering [${method.toUpperCase()}] ${path}`);
    }

    // Register the route on the Express router
    router[method](path, ...stack);
  });

  // Return the configured router so it can be mounted
  return router;
};
