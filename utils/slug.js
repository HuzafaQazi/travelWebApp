export function createSlug(title) {
  return title
    ?.toLowerCase() // Convert to lowercase
    .replace(/[^a-zA-Z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}
