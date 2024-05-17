import { type Request } from "express";
import { ZodSchema } from "zod";

const validate = <T>(
  schema: ZodSchema<T>,
  req: Request,
  requestType: "body" | "params"
) => {
  const result =
    requestType === "body"
      ? schema.safeParse(req.body)
      : schema.safeParse(req.params);

  if (result.success === false) {
    throw result.error;
  } else {
    return result.data as T;
  }
};

export default validate;
