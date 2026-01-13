import * as vscode from 'vscode';
import { translateText } from '../core/translator';

/**
 * Command handler: Translate to selected language (auto-detect source)
 */
export async function translateText_command() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	// Check if the file is a markdown file
	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('This command only works with Markdown files (.md)');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	// Show quick pick for target language
	const targetLanguage = await vscode.window.showQuickPick([
		{ label: 'English', value: 'en', description: 'Translate to English' },
		{ label: 'Tiếng Việt', value: 'vi', description: 'Dịch sang Tiếng Việt' },
		{ label: '日本語', value: 'ja', description: 'Translate to Japanese' }
	], {
		placeHolder: 'Select target language / Chọn ngôn ngữ đích'
	});

	if (!targetLanguage) {
		return; // User cancelled
	}

	try {
		// Always use 'auto' as source language
		const translatedText = await translateText(text, 'auto', targetLanguage.value);
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage(`Translated to ${targetLanguage.label}!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate to English (auto-detect source)
 */
export async function translateToEnglish() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('This command only works with Markdown files (.md)');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'auto', 'en');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to English!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate to Vietnamese (auto-detect source)
 */
export async function translateToVietnamese() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('This command only works with Markdown files (.md)');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'auto', 'vi');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to Vietnamese!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate to Japanese (auto-detect source)
 */
export async function translateToJapanese() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('This command only works with Markdown files (.md)');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'auto', 'ja');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to Japanese!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}
