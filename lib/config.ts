/**
 * This module is used to get the config file from the path and parse it.
 *
 * @module config
 */

/**
 * Get the config file from the path
 * @param {string} path The path to the config file
 * @returns {Promise<string>} The config file
 */
export async function getConfig(path: string): Promise<string> {
  const configFile = Bun.file(path);
  if (!configFile.exists()) {
    throw new Error("CONFIG environment variable is not set");
  }

  return await configFile.text();
}

/**
 * Parse the config file
 * @param {string} config The config file
 * @returns {Promise<T>} The parsed config file
 */
export async function parseConfig<T extends object>(
  config: string
): Promise<T> {
  return Promise.resolve(Bun.TOML.parse(config) as T);
}

/**
 * Generate the config types
 * @param {T} config The config file
 * @param {string} moduleName The name of the module
 * @returns {Promise<string>} The generated types
 */
export async function generateConfigTypes<T extends object>(
  config: T,
  moduleName: string
): Promise<string> {
  const types = `declare module ${moduleName} {
        interface Config ${Bun.inspect(config)}
    }`;

  await Bun.write("replit.d.ts", types);

  return types;
}

/**
 * Get the replit config
 * @returns {Promise<{config: T; types: string}>} The replit config
 */
export async function replitConfig<T extends object>(): Promise<{
  config: T;
}> {
  const config = await getConfig(".replit");
  const parsedConfig = await parseConfig(config);
  const types = await generateConfigTypes(parsedConfig, "ReplitConfig");
  return {
    config: parsedConfig as T,
    [Symbol.for("types")]: types,
  };
}
