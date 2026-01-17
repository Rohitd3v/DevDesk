import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";
import { sendResponse } from "../utils/sendResponse.js";

interface ValidationSchemas {
  params?: ZodTypeAny;
  body?: ZodTypeAny;
  query?: ZodTypeAny;
}

const validate = (schemas: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return sendResponse(res, 400, false, { error: result.error });
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, false, { error: result.error });
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return sendResponse(res, 400, false, { error: result.error });
      }
    }

    next();
  };

export default validate;
