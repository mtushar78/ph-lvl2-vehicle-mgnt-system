import fs from 'fs';
import path from 'path';

let envLoaded = false;

export const loadEnvironment = () => {
  if (envLoaded) return;

  try {
    const envPath = path.join(__dirname, '..', '..', '.env');
    const data = fs.readFileSync(envPath, 'utf-8');

    data.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) return;

      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();

      if (key) {
        process.env[key] = value;
      }
    });

    envLoaded = true;
  } catch (err) {
    console.log('Using default configuration');
  }
};
