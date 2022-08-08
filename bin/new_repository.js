const createEmptyRepository = require("../lib/new_repository/create_empty_repository");
const ensureThemeExists = require("../lib/new_repository/ensure_theme_exists");
const extractBaseTheme = require("../lib/new_repository/extract_base_theme");

const baseTheme = "grand-conference";
const directory = "../test-cms-dup-robin2/";

ensureThemeExists(baseTheme);

createEmptyRepository(directory, () => {
  extractBaseTheme(baseTheme, directory)
});