import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "src/generated/prisma");
const target = resolve(root, "dist/generated/prisma");

if (!existsSync(source)) {
  throw new Error(
    "Prisma client is missing. Run `npm --workspace apps/backend run db:generate` before build."
  );
}

rmSync(target, { force: true, recursive: true });
mkdirSync(dirname(target), { recursive: true });
cpSync(source, target, { recursive: true });
