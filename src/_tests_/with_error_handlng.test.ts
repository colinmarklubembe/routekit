import { withErrorHandling } from "../with_error_handling";
import { Request, Response } from "express";

describe("withErrorHandling", () => {
  it("calls the handler successfully", async () => {
    console.log("Running test: calls the handler successfully");

    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const next = jest.fn();

    const handler = jest.fn().mockResolvedValue(undefined);
    const wrapped = withErrorHandling(handler);

    console.log("Executing wrapped handler...");

    await wrapped(mockReq, mockRes, next);
    console.log("Handler executed successfully.");

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards thrown error to next()", async () => {
    console.log("Running test: forwards thrown error to next()");

    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const next = jest.fn();

    const error = new Error("fail");
    const handler = jest.fn().mockRejectedValue(error);
    const wrapped = withErrorHandling(handler);

    console.log("Executing wrapped handler with error...");

    await wrapped(mockReq, mockRes, next);
    console.log("Error forwarded to next.");

    expect(next).toHaveBeenCalledWith(error);
  });
});
