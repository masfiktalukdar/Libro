import slugify from "slugify";

export const createInstitutionSlug = async (
  institution_name: string,
  institution_id: string,
): Promise<string> => {
  const suffix = institution_id.replace(/-/g, "").slice(-8);

  return `${slugify(institution_name, {
    lower: true,
    strict: true,
    trim: true,
  })}-${suffix}`;
};
