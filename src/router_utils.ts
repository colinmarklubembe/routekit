import { Router, Request, Response, RequestHandler } from "express";

// Allowed HTTP methods
type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

// TReq allows custom request types, like ones with `req.user`
export type ControllerMethod<TReq extends Request = Request> = (
  req: TReq,
  res: Response
) => Promise<void>;

// Single route config
export interface RouteConfig<TReq extends Request = Request> {
  method: HttpMethod;
  path: string; // Route path (e.g. "/users")
  handler: ControllerMethod<TReq>; // Function that handles the request
  middlewares?: RequestHandler[];
  description?: string; // Optional description for logging or docs
}

// Optional global config
interface CreateRouteHandlerOptions {
  authMiddleware?: RequestHandler;
  globalMiddlewares?: RequestHandler[];
  logRoutes?: boolean;
}

// Register routes
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

  const registeredRoutes = new Set<string>();

  routes.forEach(({ method, path, handler, middlewares = [], description }) => {
    const routeKey = `${method.toUpperCase()} ${path}`;

    // Warn if duplicate
    if (registeredRoutes.has(routeKey)) {
      console.warn(`⚠️ Duplicate route detected: ${routeKey}`);
    } else {
      registeredRoutes.add(routeKey);
    }

    const stack: RequestHandler[] = [
      ...globalMiddlewares,
      ...(authMiddleware ? [authMiddleware] : []),
      ...middlewares,
      handler as unknown as RequestHandler, // Type cast needed for Express compatibility
    ];

    if (logRoutes) {
      console.log(`✅ [${method.toUpperCase()}] ${path}`);
      if (description) {
        console.log(`   ↳ ${description}`);
      }
    }

    router[method](path, ...stack);
  });

  return router;
};
