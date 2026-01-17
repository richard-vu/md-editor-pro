import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Open HTML file in default browser
 * Can be triggered by double-click or context menu
 */
export async function openHtmlInBrowser(uri?: vscode.Uri) {
	try {
		// Get the URI of the file
		let fileUri: vscode.Uri | undefined = uri;

		// If no URI provided, try to get from active editor
		if (!fileUri) {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				fileUri = activeEditor.document.uri;
			}
		}

		// If still no URI, show error
		if (!fileUri) {
			vscode.window.showErrorMessage('No HTML file selected');
			return;
		}

		// Check if file is HTML
		const ext = path.extname(fileUri.fsPath).toLowerCase();
		if (ext !== '.html' && ext !== '.htm') {
			vscode.window.showWarningMessage('Selected file is not an HTML file');
			return;
		}

		// Open in default browser using VS Code's built-in command
		await vscode.env.openExternal(fileUri);
		
		vscode.window.showInformationMessage(`Opening ${path.basename(fileUri.fsPath)} in browser...`);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to open file in browser: ${error}`);
		console.error('Error opening HTML file in browser:', error);
	}
}

/**
 * Open any file in browser (for context menu on any file)
 */
export async function openFileInBrowser(uri?: vscode.Uri) {
	try {
		let fileUri: vscode.Uri | undefined = uri;

		if (!fileUri) {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor) {
				fileUri = activeEditor.document.uri;
			}
		}

		if (!fileUri) {
			vscode.window.showErrorMessage('No file selected');
			return;
		}

		// Open in default browser
		await vscode.env.openExternal(fileUri);
		
		vscode.window.showInformationMessage(`Opening ${path.basename(fileUri.fsPath)} in browser...`);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to open file in browser: ${error}`);
		console.error('Error opening file in browser:', error);
	}
}
