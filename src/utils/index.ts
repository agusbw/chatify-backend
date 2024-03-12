import crypto from "crypto";

export function generateUniqueCode(): string {
  const length = 6; //code length
  const timestamp = Date.now().toString(); // get the current timestamp
  const randomBytes = crypto.randomBytes(8).toString("hex"); // generate string random

  // combine timestamp and string random
  const uniqueString = timestamp + randomBytes;

  // Use hash (SHA-256) to generate unique code
  const hashedString = crypto
    .createHash("sha256")
    .update(uniqueString)
    .digest("hex");

  // Take hash substr to be the code
  const uniqueCode = hashedString.substring(0, length);

  return uniqueCode;
}
