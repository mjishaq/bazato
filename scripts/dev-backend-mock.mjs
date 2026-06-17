import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(command, ["--workspace", "apps/backend", "run", "dev"], {
  env: {
    ...process.env,
    DATA_SOURCE: "memory",
    OTP_PROVIDER: "mock",
    PORT: process.env.PORT ?? "4000"
  },
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
