import * as vscode from "vscode";
import * as fs from "fs";

const logoExtensions = ["svg", "png", "jpg", "jpeg"];

// First `.vscode/project-logo.<ext>` in the first workspace folder, by extension priority
export const findLogoUri = (): vscode.Uri | undefined => {
    const rootFolder = vscode.workspace.workspaceFolders?.[0];
    if (!rootFolder) {
        return undefined;
    }
    return logoExtensions
        .map((extension) =>
            vscode.Uri.joinPath(
                rootFolder.uri,
                ".vscode",
                `project-logo.${extension}`
            )
        )
        .find((logoUri) => fs.existsSync(logoUri.fsPath));
};

class LogoViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "projectLogo";
    private view?: vscode.WebviewView;

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this.view = webviewView;
        webviewView.onDidDispose(() => {
            this.view = undefined;
        });

        this.updateWebview(webviewView);
    }

    // Re-render the live view when the workspace changes
    public refresh() {
        if (this.view) {
            this.updateWebview(this.view);
        }
    }

    private updateWebview(webviewView: vscode.WebviewView) {
        // No folder open (e.g. empty window) means no logo roots, not a crash
        const rootFolder = vscode.workspace.workspaceFolders?.[0];
        webviewView.webview.options = {
            localResourceRoots: rootFolder
                ? [vscode.Uri.joinPath(rootFolder.uri, ".vscode")]
                : [],
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
    }

    private getHtmlForWebview(webview: vscode.Webview) {
        const logoUri = findLogoUri();
        if (!logoUri) {
            return `<html><body></body></html>`;
        }

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline';">
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
                <img src="${webview.asWebviewUri(logoUri)}" alt="Project Logo">
            </div>
            </body>
            </html>`;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new LogoViewProvider();
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            LogoViewProvider.viewType,
            provider
        ),
        vscode.workspace.onDidChangeWorkspaceFolders(() => provider.refresh())
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
