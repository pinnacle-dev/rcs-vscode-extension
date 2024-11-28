import * as vscode from "vscode";
import RCSPanel from "./panel";

export function activate(extContext: vscode.ExtensionContext) {
  extContext.subscriptions.push(
    vscode.commands.registerCommand("rcs.start", () => {
      RCSPanel.createOrShow(extContext);
    })
  );
}

export function deactivate() {}
