export async function getConfig(path: string): Promise<string> {
  const configFile = Bun.file(path);
  if (!configFile.exists()) {
    throw new Error("CONFIG environment variable is not set");
  }

  return await configFile.text();
}

export async function parseConfig<T extends object>(
  config: string
): Promise<T> {
  return Promise.resolve(Bun.TOML.parse(config) as T);
}

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
