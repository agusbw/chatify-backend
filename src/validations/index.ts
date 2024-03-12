import { Request } from "express";
import { ZodSchema } from "zod";

const validate = (schema: ZodSchema, req: Request) => {
  const result = schema.safeParse(req.body);
  if (result.success === false) {
    throw result.error;
  } else {
    return result.data;
  }
};

export default validate;
