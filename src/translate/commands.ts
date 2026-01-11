import * as vscode from 'vscode';
import { translateText } from './translator';

/**
 * Command handler: Translate Vietnamese to English
 */
export async function translateVietnameseToEnglish() {
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

	try {
		const translatedText = await translateText(text, 'vi', 'en');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to English!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate English to Vietnamese
 */
export async function translateEnglishToVietnamese() {
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

	try {
		const translatedText = await translateText(text, 'en', 'vi');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to Vietnamese!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate Vietnamese to Japanese
 */
export async function translateVietnameseToJapanese() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('Lệnh này chỉ hoạt động với file Markdown (.md)');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'vi', 'ja');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Đã dịch sang Tiếng Nhật!');
	} catch (error) {
		vscode.window.showErrorMessage(`Dịch thất bại: ${error}`);
	}
}

/**
 * Command handler: Translate Japanese to Vietnamese
 */
export async function translateJapaneseToVietnamese() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('このコマンドはMarkdownファイルでのみ動作します');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'ja', 'vi');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Đã dịch sang Tiếng Việt!');
	} catch (error) {
		vscode.window.showErrorMessage(`Dịch thất bại: ${error}`);
	}
}

/**
 * Command handler: Translate English to Japanese
 */
export async function translateEnglishToJapanese() {
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
		const translatedText = await translateText(text, 'en', 'ja');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to Japanese!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}

/**
 * Command handler: Translate Japanese to English
 */
export async function translateJapaneseToEnglish() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor!');
		return;
	}

	if (editor.document.languageId !== 'markdown') {
		vscode.window.showErrorMessage('このコマンドはMarkdownファイルでのみ動作します');
		return;
	}

	const selection = editor.selection;
	const text = editor.document.getText(selection);

	if (!text) {
		vscode.window.showErrorMessage('No text selected!');
		return;
	}

	try {
		const translatedText = await translateText(text, 'ja', 'en');
		await editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		});
		vscode.window.showInformationMessage('Translated to English!');
	} catch (error) {
		vscode.window.showErrorMessage(`Translation failed: ${error}`);
	}
}
