import slugify from "slugify";
import { RowDataPacket } from "mysql2";
import { dbPool } from "@config/dbConnect.js";

export const createUniqueSlugForInstitution = async (
  institution_name: string,
  institution_id: string,
): Promise<string> => {
  const idLastFourCharecters = institution_id.slice(-4);
  const slug = `${slugify(institution_name, { lower: true, strict: true })}-${idLastFourCharecters}`;

  const institutionSlugFindSQL = `
    SELECT institution_slug from institution where institution_slug = ?
  `;
  const [slugResult] = await dbPool.execute<RowDataPacket[]>(
    institutionSlugFindSQL,
    [slug],
  );

  let uniqueSlug = slug;
  let counter = 1;
  let exists = true;

  while (exists) {
    if (slugResult.length === 0) {
      exists = false;
    } else {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }
  return uniqueSlug;
};
