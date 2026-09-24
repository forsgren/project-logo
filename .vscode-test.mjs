import { defineConfig } from "@vscode/test-cli";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig({
    files: "out/test/**/*.test.js",
    // short temp dir keeps VS Code's IPC socket path under macOS's 103-char limit
    launchArgs: ["--user-data-dir", mkdtempSync(join(tmpdir(), "vsc-"))],
});
