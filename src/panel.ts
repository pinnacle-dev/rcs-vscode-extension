import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { sendRCS } from "./webview/components/RCSSend";

export default class RCSPanel {
  public static currentPanel: RCSPanel | undefined;

  private static readonly viewType = "rcs";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _extContext: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];
  private _fileSystemWatcher: vscode.FileSystemWatcher | undefined;

  public static createOrShow(extContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (RCSPanel.currentPanel) {
      RCSPanel.currentPanel._panel.reveal(column);
    } else {
      RCSPanel.currentPanel = new RCSPanel(extContext, vscode.ViewColumn.Two);
    }
  }

  private constructor(
    extContext: vscode.ExtensionContext,
    column: vscode.ViewColumn
  ) {
    this._extContext = extContext;
    this._extensionUri = extContext.extensionUri;
    // Not added - state preserver**

    // Create and show a new webview panel
    this._panel = vscode.window.createWebviewPanel(
      RCSPanel.viewType,
      "rcs",
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this._extensionUri],
      }
    );

    // Set webview favicon
    this._panel.iconPath = vscode.Uri.joinPath(
      this._extensionUri,
      "src/media",
      "favicon.ico"
    );

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (msg: any) => {
        console.log("Panel received message - type:", msg.type);
        switch (msg.type) {
          case "onFile":
            if (!msg.value) break; //if doesnt work change to return
            break;
          case "onViewFile":
            if (!msg.value) return;
            const doc = await vscode.workspace.openTextDocument(msg.value);
            this._panel.webview.postMessage({
              type: "activeFile",
              value: doc.getText(),
            });
            break;
          case "getActiveFile":
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
              const document = activeEditor.document;
              this._panel.webview.postMessage({
                type: "activeFile",
                value: await document.getText(),
                content: await document.getText(),
              });
            }
            break;
          case "sendRCS":
            console.log("Panel: Received sendRCS message with payload:", {
              apiKey: msg.apiKey ? "present" : "missing",
              json: msg.json,
            });
            await this.handleSendMessage(msg.apiKey, msg.json);
            break;
          case "getJsonFiles":
            await this.getJsonFiles();
            break;
          case "getApiKey":
            let apiKey = "";
            try {
              // Check workspace for .env file
              const workspaceFolders = vscode.workspace.workspaceFolders;
              if (workspaceFolders) {
                const envPath = vscode.Uri.joinPath(
                  workspaceFolders[0].uri,
                  ".env"
                );
                try {
                  const envFile = await vscode.workspace.fs.readFile(envPath);
                  const envContent = Buffer.from(envFile).toString();

                  // Simple .env parsing
                  const envVars = envContent
                    .split("\n")
                    .reduce((acc: { [key: string]: string }, line) => {
                      const [key, ...valueParts] = line.split("=");
                      if (key && valueParts.length > 0) {
                        acc[key.trim()] = valueParts
                          .join("=")
                          .trim()
                          .replace(/^["'](.*)["']$/, "$1");
                      }
                      return acc;
                    }, {});

                  apiKey = envVars.PINNACLE_API_KEY || "";
                } catch (err) {
                  console.log(".env file not found or not accessible");
                }
              }

              this._panel.webview.postMessage({
                type: "apiKey",
                value: apiKey,
              });
            } catch (error) {
              console.error("Error reading API key:", error);
              this._panel.webview.postMessage({
                type: "apiKey",
                value: "",
              });
            }
            break;
        }
      },
      null,
      this._disposables
    );

    // Add file system watcher
    this._fileSystemWatcher =
      vscode.workspace.createFileSystemWatcher("**/*.rcs.json");

    // Watch for file changes
    this._fileSystemWatcher.onDidCreate(() => this.getJsonFiles());
    this._fileSystemWatcher.onDidDelete(() => this.getJsonFiles());
    this._fileSystemWatcher.onDidChange(async (uri) => {
      try {
        // Get the updated file content
        const document = await vscode.workspace.openTextDocument(uri);
        const content = document.getText();

        // Send both the list update and the new content
        await this.getJsonFiles();
        this._panel.webview.postMessage({
          type: "activeFile",
          value: content,
          path: uri.fsPath,
        });
      } catch (error) {
        console.error("Error handling file change:", error);
      }
    });

    // Add watcher to disposables
    this._disposables.push(this._fileSystemWatcher);
  }

  public dispose() {
    RCSPanel.currentPanel = undefined;
    // Clean up our resources
    this._panel.dispose();
    if (this._fileSystemWatcher) {
      this._fileSystemWatcher.dispose();
    }
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "main.wv.js")
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RCS Visualizer</title>
        <link rel="stylesheet" href="${styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi();
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }

  private async getJsonFiles() {
    // Search recursively in all directories for .rcs.json files
    const jsonFiles = await vscode.workspace.findFiles(
      "**/*.rcs.json",
      null,
      1000
    );
    const fileNames = jsonFiles.map((file) => file.fsPath);
    this._panel.webview.postMessage({
      type: "jsonFiles",
      value: fileNames,
    });
  }

  private async handleSendMessage(apiKey: string, json: any) {
    if (!apiKey) {
      console.error("API key is required");
      return;
    }

    try {
      const res = await sendRCS(apiKey, json);
      console.log("Response:", res);
      vscode.window.showInformationMessage("RCS message sent successfully!");
      this._panel.webview.postMessage({ type: "sendComplete" });
    } catch (error) {
      // Log the full error object for debugging
      console.error("Full error object:", error);

      if (error.response) {
        // Log detailed response error information
        console.error("Response error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        if (error.response.status !== 200)
          vscode.window.showErrorMessage(
            `Request failed with status ${
              error.response.status
            }: ${JSON.stringify(error.response.data)}`
          );
      } else if (error.request) {
        // Request was made but no response received
        vscode.window.showErrorMessage(
          `No response received from server: ${error.message}`
        );
      } else {
        // Error in setting up the request
        vscode.window.showErrorMessage(
          `Error setting up request: ${error.message}`
        );
      }

      this._panel.webview.postMessage({ type: "sendComplete" });
    }
  }
}
