import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { createRouteHandler, RouteConfig } from "../router_utils";

describe("createRouteHandler", () => {
  const setupApp = (routes: RouteConfig[], opts = {}, basePath = "/api") => {
    const app = express();
    const router = express.Router();
    createRouteHandler(router, routes, opts);
    app.use(basePath, router);
    return app;
  };

  it("registers a GET route and responds correctly", async () => {
    console.log("Running test: registers a GET route and responds correctly");

    const routes: RouteConfig[] = [
      {
        method: "get",
        path: "/hello",
        handler: async (req: Request, res: Response) => {
          res.status(200).json({ msg: "hi" });
        },
      },
    ];

    const app = setupApp(routes);
    const res = await request(app).get("/api/hello");

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ msg: "hi" });
  });

  it("applies global and route-specific middleware", async () => {
    console.log("Running test: applies global and route-specific middleware");

    const globalMiddleware = jest.fn((req: Request, res: Response, next) =>
      next()
    );
    const routeMiddleware = jest.fn(
      (req: Request, res: Response, next: NextFunction) => next()
    );

    const routes: RouteConfig[] = [
      {
        method: "get",
        path: "/check",
        handler: async (req: Request, res: Response) => {
          res.send("ok");
        },
        middlewares: [routeMiddleware],
      },
    ];

    const app = setupApp(routes, { globalMiddlewares: [globalMiddleware] });
    const res = await request(app).get("/api/check");

    console.log("Response text:", res.text);

    expect(res.text).toBe("ok");
    expect(globalMiddleware).toHaveBeenCalled();
    expect(routeMiddleware).toHaveBeenCalled();
  });

  it("logs routes if logRoutes is true", () => {
    console.log("Running test: logs routes if logRoutes is true");

    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const routes: RouteConfig[] = [
      {
        method: "get",
        path: "/logtest",
        handler: async (req: Request, res: Response) => {
          res.send("logged");
        },
        description: "Logging test route",
      },
    ];

    setupApp(routes, { logRoutes: true });

    console.log("Checking log output...");

    expect(spy).toHaveBeenCalledWith("✅ [GET] /logtest");
    expect(spy).toHaveBeenCalledWith("   ↳ Logging test route");

    spy.mockRestore();
  });

  it("warns on duplicate route registration", () => {
    console.log("Running test: warns on duplicate route registration");

    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const route: RouteConfig = {
      method: "get",
      path: "/dup",
      handler: async (req: Request, res: Response) => {
        res.send("one");
      },
    };

    setupApp([route, route]);

    console.log("Checking for duplicate warning...");

    expect(spy).toHaveBeenCalledWith("⚠️ Duplicate route detected: GET /dup");
    spy.mockRestore();
  });
});
