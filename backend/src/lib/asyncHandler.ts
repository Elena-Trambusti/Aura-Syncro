import { Request, Response, NextFunction, RequestHandler } from 'express'

/** Propaga errori async verso errorHandler Express */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next)
  }
}
