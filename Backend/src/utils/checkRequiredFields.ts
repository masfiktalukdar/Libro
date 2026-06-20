import { AppError } from "@utils/appError.js";

export default function checkRequiredFields(
  requiredFields: string[],
  payload: any,
) {
  for (const field of requiredFields) {
    if (!payload[field]) {
      const formatted = field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      throw new AppError(`${formatted} is required`, 400);
    }
  }
}
