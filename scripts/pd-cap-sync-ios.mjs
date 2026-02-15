import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const output = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    output[key] = value;
  }

  return output;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

const fileEnv = parseEnvFile(envPath);
const mergedEnv = { ...fileEnv, ...process.env };

const baseUrlRaw =
  mergedEnv.PD_APP_BASE_URL ||
  mergedEnv.NEXT_PUBLIC_SITE_URL ||
  mergedEnv.CAP_BASE_URL ||
  "http://localhost:3000";
const key = mergedEnv.PD_LAB_KEY;

if (!key) {
  console.error("Missing PD_LAB_KEY. Add it to .env.local before running cap:sync:auto.");
  process.exit(1);
}

const baseUrl = trimTrailingSlash(baseUrlRaw);
const capServerUrl = `${baseUrl}/pd-lab?k=${encodeURIComponent(key)}`;

console.log(`Using CAP_SERVER_URL=${capServerUrl}`);

const result = spawnSync("npx", ["cap", "sync", "ios"], {
  cwd,
  env: { ...process.env, CAP_SERVER_URL: capServerUrl },
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
