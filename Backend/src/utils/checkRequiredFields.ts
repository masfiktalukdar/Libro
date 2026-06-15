import { AppError } from "@utils/appError.js";

export default function checkRequiredFields(
  requiredFields: string[],
  payload: any,
) {
  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new AppError(`${field} is required for student`, 400);
    }
  }
}
