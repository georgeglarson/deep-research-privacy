import fs from 'fs/promises';

export async function readSecret(envVar: string): Promise<string> {
  const filePath = process.env[`${envVar}_FILE`];
  if (!filePath) {
    // Fall back to environment variable if file path not provided
    const value = process.env[envVar];
    if (!value) {
      throw new Error(`Neither ${envVar}_FILE nor ${envVar} environment variable is set`);
    }
    return value;
  }

  try {
    const secret = await fs.readFile(filePath, 'utf-8');
    return secret.trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read secret from ${filePath}: ${message}`);
  }
}