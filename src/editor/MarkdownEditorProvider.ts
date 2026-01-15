import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Custom Text Editor Provider for Markdown files with WYSIWYG split view
 */
export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new MarkdownEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            MarkdownEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
                supportsMultipleEditorsPerDocument: false,
            }
        );
        return providerRegistration;
    }

    private static readonly viewType = 'mdEditorPro.wysiwyg';

    constructor(private readonly context: vscode.ExtensionContext) { }

    /**
     * Called when custom editor is opened
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Setup webview options
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
            ],
        };

        // Set webview HTML content
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

        // Update webview when document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(webviewPanel, document);
            }
        });

        // Handle messages from webview
        webviewPanel.webview.onDidReceiveMessage((message) => {
            this.handleWebviewMessage(message, document, webviewPanel);
        });

        // Cleanup on dispose
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Send initial content
        this.updateWebview(webviewPanel, document);
    }

    /**
     * Update webview with current document content
     */
    private updateWebview(panel: vscode.WebviewPanel, document: vscode.TextDocument) {
        panel.webview.postMessage({
            type: 'update',
            content: document.getText(),
        });
    }

    /**
     * Handle messages from webview
     */
    private async handleWebviewMessage(
        message: any,
        document: vscode.TextDocument,
        panel: vscode.WebviewPanel
    ) {
        switch (message.type) {
            case 'edit':
                // Apply edit from webview to document
                return this.applyEdit(document, message.content);

            case 'command':
                // Execute VS Code command (for Export, Translate buttons)
                return vscode.commands.executeCommand(message.command);

            case 'ready':
                // Webview is ready, send initial content
                this.updateWebview(panel, document);
                break;
        }
    }

    /**
     * Apply edit to document
     */
    private applyEdit(document: vscode.TextDocument, newContent: string) {
        const edit = new vscode.WorkspaceEdit();

        // Replace entire document content
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            newContent
        );

        return vscode.workspace.applyEdit(edit);
    }

    /**
     * Get HTML content for webview
     */
    private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
        // Get URIs for resources
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'editor', 'styles.css')
        );
        const editorScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'editor', 'editor.js')
        );
        const toolbarScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'editor', 'toolbar.js')
        );

        // Generate nonce for CSP
        const nonce = getNonce();

        // Get VS Code theme
        const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark
            ? 'dark'
            : 'light';

        return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!-- CSP: Allow scripts from self, inline styles for preview content, and CDN for Mermaid/Markdown-it -->
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
		style-src ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; 
		script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; 
		font-src ${webview.cspSource} https://fonts.gstatic.com;
		img-src ${webview.cspSource} https: data:;">
	
	<link href="${styleUri}" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
	
	<title>MD Editor Pro - WYSIWYG</title>
</head>
<body class="theme-${theme}">
	<!-- Toolbar -->
	<div id="toolbar" class="toolbar">
		<!-- Text Formatting Group -->
		<div class="toolbar-group">
			<!-- Heading Dropdown -->
			<div class="toolbar-dropdown">
				<button class="toolbar-btn" data-action="heading-toggle" title="Heading" aria-label="Heading dropdown">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M2 2h2v5h6V2h2v12h-2V9H4v5H2V2z"/>
					</svg>
					<svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="margin-left: 2px">
						<path d="M4 6l4 4 4-4z"/>
					</svg>
				</button>
				<div class="toolbar-dropdown-menu" id="heading-menu">
					<button class="toolbar-dropdown-item" data-action="heading1">
						<span class="dropdown-item-text">Heading 1</span>
						<span class="dropdown-item-shortcut">#</span>
					</button>
					<button class="toolbar-dropdown-item" data-action="heading2">
						<span class="dropdown-item-text">Heading 2</span>
						<span class="dropdown-item-shortcut">##</span>
					</button>
					<button class="toolbar-dropdown-item" data-action="heading3">
						<span class="dropdown-item-text">Heading 3</span>
						<span class="dropdown-item-shortcut">###</span>
					</button>
					<button class="toolbar-dropdown-item" data-action="heading4">
						<span class="dropdown-item-text">Heading 4</span>
						<span class="dropdown-item-shortcut">####</span>
					</button>
					<button class="toolbar-dropdown-item" data-action="heading5">
						<span class="dropdown-item-text">Heading 5</span>
						<span class="dropdown-item-shortcut">#####</span>
					</button>
					<button class="toolbar-dropdown-item" data-action="heading6">
						<span class="dropdown-item-text">Heading 6</span>
						<span class="dropdown-item-shortcut">######</span>
					</button>
				</div>
			</div>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Basic Text Styling -->
		<div class="toolbar-group">
			<button class="toolbar-btn" data-action="bold" title="Bold (Ctrl+B)">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M4 2h5.5a3.5 3.5 0 0 1 2.5 6 3.5 3.5 0 0 1-2.5 6H4V2zm5.5 5.5A2 2 0 0 0 9.5 4H6v3.5h3.5zm0 5A2 2 0 0 0 9.5 10H6v3.5h3.5z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="italic" title="Italic (Ctrl+I)">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M6 2h6v2h-2l-2 8h2v2H4v-2h2l2-8H6V2z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="strikethrough" title="Strikethrough">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M8 0a5.5 5.5 0 0 1 3.5 9.73V10h3v1h-3v.27A5.5 5.5 0 1 1 8 0zm0 1a4.5 4.5 0 1 0 2.5 8.24V8h-5v1.24A4.5 4.5 0 0 0 8 1z"/>
					<path d="M0 8h16v1H0z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="highlight" title="Highlight">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M11.096.644a2 2 0 0 1 2.791.036l1.433 1.433a2 2 0 0 1 .036 2.791l-8.5 8.5a2 2 0 0 1-.836.496l-3.5 1a.5.5 0 0 1-.621-.621l1-3.5a2 2 0 0 1 .496-.836l8.5-8.5zM12 2.25l1.75 1.75L5 12.75V11h-1.25L12 2.25zM0 14.5A1.5 1.5 0 0 1 1.5 13h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 0 14.5z"/>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Code & Quote -->
		<div class="toolbar-group">
			<button class="toolbar-btn" data-action="inline-code" title="Inline Code">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="code" title="Code Block">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M5.854 4.854a.5.5 0 10-.708-.708l-3.5 3.5a.5.5 0 000 .708l3.5 3.5a.5.5 0 00.708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 01.708-.708l3.5 3.5a.5.5 0 010 .708l-3.5 3.5a.5.5 0 01-.708-.708L13.293 8l-3.147-3.146z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="quote" title="Quote">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.569-.182h-.027c.1-.152.214-.283.34-.397.13-.117.278-.225.44-.324z"/>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Lists -->
		<div class="toolbar-group">
			<button class="toolbar-btn" data-action="unordered-list" title="Bullet List">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M2 4a1 1 0 100-2 1 1 0 000 2zm3.75-1.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM2 9a1 1 0 100-2 1 1 0 000 2zm0 5a1 1 0 100-2 1 1 0 000 2z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="ordered-list" title="Numbered List">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
					<path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="task-list" title="Task List">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M2.5 1.5A1.5 1.5 0 0 1 4 0h8a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 12 16H4a1.5 1.5 0 0 1-1.5-1.5v-13zm1 0v13a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5H4a.5.5 0 0 0-.5.5zm7.854 3.646a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Insert Elements -->
		<div class="toolbar-group">
			<button class="toolbar-btn" data-action="link" title="Insert Link (Ctrl+K)">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="image" title="Insert Image">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M1 3a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V3zm11 1a1 1 0 11-2 0 1 1 0 012 0zM3 13h10L9 8 7 11l-2-1-2 3z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="table" title="Insert Table">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M0 2a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2zm5 0v3h6V2H5zm6 4H5v3h6V6zM5 10v3h6v-3H5zm-1 0H1v3h3v-3zm1-1V6H1v3h4zm7 0V6h4v3h-4zm0 1h4v3h-4v-3zm-8-6h3V1H1v3zm12 0V1h-3v3h3z"/>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider"></div>

		<!-- Tools -->
		<div class="toolbar-group">
			<!-- Emoji Picker -->
			<div class="toolbar-dropdown">
				<button class="toolbar-btn" data-action="emoji-toggle" title="Insert Emoji" aria-label="Emoji picker">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
						<path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
					</svg>
					<svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" style="margin-left: 2px">
						<path d="M4 6l4 4 4-4z"/>
					</svg>
				</button>
				<div class="toolbar-dropdown-menu" id="emoji-menu">
					<div class="emoji-category">😊 Smileys</div>
					<div class="emoji-grid">
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😀" title="Grinning">😀</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😃" title="Smile">😃</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😄" title="Happy">😄</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😁" title="Grin">😁</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😆" title="Laugh">😆</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😅" title="Sweat">😅</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤣" title="Rofl">🤣</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😂" title="Joy">😂</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🙂" title="Slight Smile">🙂</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🙃" title="Upside Down">🙃</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😉" title="Wink">😉</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😊" title="Blush">😊</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😇" title="Angel">😇</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🥰" title="Love">🥰</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="😍" title="Heart Eyes">😍</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤩" title="Star Eyes">🤩</button>
					</div>
					<div class="emoji-category">❤️ Hearts</div>
					<div class="emoji-grid">
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="❤️" title="Red Heart">❤️</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🧡" title="Orange Heart">🧡</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💛" title="Yellow Heart">💛</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💚" title="Green Heart">💚</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💙" title="Blue Heart">💙</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💜" title="Purple Heart">💜</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🖤" title="Black Heart">🖤</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤍" title="White Heart">🤍</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💔" title="Broken Heart">💔</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💕" title="Two Hearts">💕</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💖" title="Sparkling Heart">💖</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💗" title="Growing Heart">💗</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💓" title="Beating Heart">💓</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💞" title="Revolving Hearts">💞</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💝" title="Heart with Ribbon">💝</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="❣️" title="Heart Exclamation">❣️</button>
					</div>
					<div class="emoji-category">👍 Gestures</div>
					<div class="emoji-grid">
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="👍" title="Thumbs Up">👍</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="👎" title="Thumbs Down">👎</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="👌" title="OK">👌</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="✌️" title="Peace">✌️</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤞" title="Fingers Crossed">🤞</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤝" title="Handshake">🤝</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🙏" title="Pray">🙏</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="👏" title="Clap">👏</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💪" title="Strong">💪</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤲" title="Palms Up">🤲</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="👐" title="Open Hands">👐</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🙌" title="Raising Hands">🙌</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="✊" title="Fist">✊</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤛" title="Left Fist">🤛</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤜" title="Right Fist">🤜</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🤘" title="Rock">🤘</button>
					</div>
					<div class="emoji-category">✨ Symbols</div>
					<div class="emoji-grid">
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="✅" title="Check">✅</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="❌" title="Cross">❌</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="⭐" title="Star">⭐</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="✨" title="Sparkles">✨</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🔥" title="Fire">🔥</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💯" title="100">💯</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="⚡" title="Lightning">⚡</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💡" title="Bulb">💡</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🎉" title="Party">🎉</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🎊" title="Confetti">🎊</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🎈" title="Balloon">🎈</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🎁" title="Gift">🎁</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🏆" title="Trophy">🏆</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🥇" title="Gold Medal">🥇</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="🌟" title="Glowing Star">🌟</button>
						<button class="emoji-item toolbar-dropdown-item" data-action="insert-emoji" data-emoji="💫" title="Dizzy">💫</button>
					</div>
				</div>
			</div>
			<button class="toolbar-btn" data-action="export-pdf" title="Export to PDF">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M5.523 12.424c.14-.082.293-.162.459-.238a7.878 7.878 0 0 1-.45.606c-.28.337-.498.516-.635.572a.266.266 0 0 1-.035.012.282.282 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548zm2.455-1.647c-.119.025-.237.05-.356.078a21.148 21.148 0 0 0 .5-1.05 12.045 12.045 0 0 0 .51.858c-.217.032-.436.07-.654.114zm2.525.939a3.881 3.881 0 0 1-.435-.41c.228.005.434.022.612.054.317.057.466.147.518.209a.095.095 0 0 1 .026.064.436.436 0 0 1-.06.2.307.307 0 0 1-.094.124.107.107 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256zM8.278 6.97c-.04.244-.108.524-.2.829a4.86 4.86 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.517.517 0 0 1 .145-.04c.013.03.028.092.032.198.005.122-.007.277-.038.465z"/>
					<path fill-rule="evenodd" d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.165 13.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.651 11.651 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.856.856 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.844.844 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.76 5.76 0 0 0-1.335-.05 10.954 10.954 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.238 1.238 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a19.697 19.697 0 0 1-1.062 2.227 7.662 7.662 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103z"/>
				</svg>
			</button>
			<button class="toolbar-btn" data-action="translate" title="Translate Content">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
					<path d="M4.545 6.714L4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z"/>
					<path d="M0 2a2 2 0 012-2h7a2 2 0 012 2v3h3a2 2 0 012 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-3H2a2 2 0 01-2-2V2zm2-1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V2a1 1 0 00-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 01-.415-.492 1.988 1.988 0 01-.94.31z"/>
				</svg>
			</button>
		</div>
	</div>

	<!-- Split View Container -->
	<div id="split-container" class="split-container">
		<!-- Left: Editor Pane -->
		<div id="editor-pane" class="pane editor-pane">
			<textarea id="markdown-editor" spellcheck="false"></textarea>
		</div>

		<!-- Resizer -->
		<div id="resizer" class="resizer"></div>

		<!-- Right: Preview Pane -->
		<div id="preview-pane" class="pane preview-pane">
			<div id="preview-content" class="preview-content"></div>
		</div>
	</div>

	<!-- Load Markdown-it and Mermaid from CDN -->
	<script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js"></script>
	<script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
	
	<!-- Load editor scripts - compiled from TypeScript -->
	<script nonce="${nonce}" src="${editorScriptUri}"></script>
	<script nonce="${nonce}" src="${toolbarScriptUri}"></script>
</body>
</html>`;
    }
}

/**
 * Generate a nonce for CSP
 */
function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
