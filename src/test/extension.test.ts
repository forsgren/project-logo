import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import { findLogoUri } from "../extension";

suite("Extension Test Suite", () => {
    // The test run opens this repo, whose .vscode/project-logo.svg is the fixture
    test("findLogoUri finds the workspace's .vscode/project-logo.svg", () => {
        const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        assert.ok(rootPath, "expected a workspace folder to be open");
        assert.strictEqual(
            findLogoUri()?.fsPath,
            path.join(rootPath, ".vscode", "project-logo.svg")
        );
    });
});
