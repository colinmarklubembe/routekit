import { RequestHandler } from "express";
import { ControllerMethod } from "./router_utils";

// Wraps a controller function with error handling
// This ensures that any thrown error is passed to Express's error middleware
export const withErrorHandling = (fn: ControllerMethod): RequestHandler => {
  return async (req, res, next) => {
    try {
      // Run the controller logic
      await fn(req, res);
    } catch (err) {
      // If an error occurs, pass it to Express error handler
      next(err);
    }
  };
};
