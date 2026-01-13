// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { 
	translateText_command,
	translateToEnglish,
	translateToVietnamese,
	translateToJapanese,
	exportPdfFromCurrentFile,
	exportPdfFromFolder,
	exportHtmlFromCurrentFile,
	exportHtmlFromFolder
} from './commands';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "md-editor-pro" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('md-editor-pro.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from md-editor-pro!');
	});

	// Register translate commands
	const translateCommand = vscode.commands.registerCommand('md-editor-pro.translate', translateText_command);
	const translateToEn = vscode.commands.registerCommand('md-editor-pro.translateToEn', translateToEnglish);
	const translateToVi = vscode.commands.registerCommand('md-editor-pro.translateToVi', translateToVietnamese);
	const translateToJa = vscode.commands.registerCommand('md-editor-pro.translateToJa', translateToJapanese);

	// Register export commands
	const exportPdfFile = vscode.commands.registerCommand('md-editor-pro.exportPdfFile', exportPdfFromCurrentFile);
	const exportPdfFolder = vscode.commands.registerCommand('md-editor-pro.exportPdfFolder', exportPdfFromFolder);
	const exportHtmlFile = vscode.commands.registerCommand('md-editor-pro.exportHtmlFile', exportHtmlFromCurrentFile);
	const exportHtmlFolder = vscode.commands.registerCommand('md-editor-pro.exportHtmlFolder', exportHtmlFromFolder);

	context.subscriptions.push(
		disposable, 
		translateCommand,
		translateToEn, 
		translateToVi,
		translateToJa,
		exportPdfFile,
		exportPdfFolder,
		exportHtmlFile,
		exportHtmlFolder
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
