import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

class LogoViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "projectLogo";
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(
                    path.dirname(
                        vscode.workspace.workspaceFolders![0].uri.fsPath
                    )
                ),
            ],
        };

        this.updateWebview(webviewView);

        // Listen for when the workspace folders change
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.updateWebview(webviewView);
        });
    }

    private updateWebview(webviewView: vscode.WebviewView) {
        const hasLogo = this.checkForLogo();
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Set visibility based on logo existence
        webviewView.show(hasLogo);
    }

    private checkForLogo(): boolean {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const rootPath = workspaceFolders[0].uri.fsPath;

            // start by checking in .vscode/
            const logoPathVscode = path.join(
                rootPath,
                ".vscode",
                "project-logo.svg"
            );

            if (fs.existsSync(logoPathVscode)) {
                return fs.existsSync(logoPathVscode);
            }

            return false;
        }
        return false;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders) {
            const rootPath = workspaceFolders[0].uri.fsPath;
            const logoPath = path.join(rootPath, ".vscode", "project-logo.svg");

            if (fs.existsSync(logoPath)) {
                const logoUri = webview.asWebviewUri(vscode.Uri.file(logoPath));
                return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline';">
                    <title>Project Logo</title>
                    <style>
                        * { box-sizing: border-box; }
                        html { height: 100vh; padding: 0; margin: 0; }
                        body { height: 100vh; padding: 0; margin: 0; display: flex; }
                        div { width: 100%; height: 100%; padding: 16px; }
                        img { width: 100%; height: 100%; object-fit: contain; display: block; object-position: center left; }
                    </style>
                </head>
                <body>
                <div>
                    <img src="${logoUri}" alt="Project Logo">
                </div>
                </body>
                </html>`;
            }
        }
        return `<html><body></body></html>`;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new LogoViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            LogoViewProvider.viewType,
            provider
        )
    );

    // Update view when workspace folders change
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
        vscode.commands.executeCommand("workbench.view.explorer");
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
