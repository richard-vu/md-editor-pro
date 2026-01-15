interface VsCodeApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

declare function acquireVsCodeApi(): VsCodeApi;
declare const markdownit: any;
declare const mermaid: any;

interface EditorSelection {
    start: number;
    end: number;
    text: string;
}

interface EditorAPI {
    getSelection(): EditorSelection;
    insertText(text: string, offsetStart?: number, offsetEnd?: number): void;
    replaceSelection(newText: string): void;
    insertTemplate(prefix: string, suffix: string, defaultContent: string): void;
    insertAtCursor(text: string): void;
    getValue(): string;
    focus(): void;
}

(function () {
    'use strict';

    // Get VS Code API (only acquire once and share via window)
    const vscode = acquireVsCodeApi();
    (window as any).vscodeApi = vscode; // Share with toolbar.ts

    // DOM Elements
    let editor: HTMLTextAreaElement | null;
    let preview: HTMLElement | null;
    let resizer: HTMLElement | null;
    let editorPane: HTMLElement | null;
    let previewPane: HTMLElement | null;

    // State
    let markdownIt: any;
    let updateTimeout: number;
    const DEBOUNCE_DELAY = 300;

    /**
     * Get current selection in editor
     */
    function getSelection(): EditorSelection {
        if (!editor) {
            return { start: 0, end: 0, text: '' };
        }
        return {
            start: editor.selectionStart,
            end: editor.selectionEnd,
            text: editor.value.substring(editor.selectionStart, editor.selectionEnd),
        };
    }

    /**
     * Insert text at current cursor position with offsets
     */
    function insertText(text: string, offsetStart: number = 0, offsetEnd: number = 0): void {
        if (!editor) {
            console.error('Editor not initialized');
            return;
        }

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        const scrollTop = editor.scrollTop; // Save scroll position

        editor.value = before + text + after;
        editor.focus();

        // Set cursor position
        const newStart = start + text.length + offsetStart;
        const newEnd = start + text.length + offsetEnd;
        editor.setSelectionRange(newStart, newEnd);

        // Restore scroll position AFTER setting selection
        editor.scrollTop = scrollTop;

        // Trigger update
        editor.dispatchEvent(new Event('input'));
    }

    /**
     * Replace current selection with new text
     * Cursor will be placed at the end of the new text
     */
    function replaceSelection(newText: string): void {
        if (!editor) {
            console.error('Editor not initialized');
            return;
        }

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        const scrollTop = editor.scrollTop; // Save scroll position

        editor.value = before + newText + after;
        editor.focus();

        // Place cursor at the end of inserted text
        const newPosition = start + newText.length;
        editor.setSelectionRange(newPosition, newPosition);

        // Restore scroll position AFTER setting selection
        editor.scrollTop = scrollTop;

        // Trigger update
        editor.dispatchEvent(new Event('input'));
    }

    /**
     * Insert text with a template (prefix + content + suffix)
     * The defaultContent will be selected for easy editing
     */
    function insertTemplate(prefix: string, suffix: string, defaultContent: string): void {
        if (!editor) {
            console.error('Editor not initialized');
            return;
        }

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        const scrollTop = editor.scrollTop; // Save scroll position

        const fullText = prefix + defaultContent + suffix;
        editor.value = before + fullText + after;
        editor.focus();

        // Select the default content for easy editing
        const contentStart = start + prefix.length;
        const contentEnd = contentStart + defaultContent.length;
        editor.setSelectionRange(contentStart, contentEnd);

        // Restore scroll position AFTER setting selection
        editor.scrollTop = scrollTop;

        // Trigger update
        editor.dispatchEvent(new Event('input'));
    }

    /**
     * Insert text at cursor position without selection
     */
    function insertAtCursor(text: string): void {
        if (!editor) {
            console.error('Editor not initialized');
            return;
        }

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        const scrollTop = editor.scrollTop; // Save scroll position

        editor.value = before + text + after;
        editor.focus();

        // Place cursor at the end of inserted text
        const newPosition = start + text.length;
        editor.setSelectionRange(newPosition, newPosition);

        // Restore scroll position AFTER setting selection
        editor.scrollTop = scrollTop;

        // Trigger update
        editor.dispatchEvent(new Event('input'));
    }

    // Expose public API for toolbar IMMEDIATELY (before init)
    (window as any).editorAPI = {
        getSelection,
        insertText,
        replaceSelection,
        insertTemplate,
        insertAtCursor,
        getValue: () => editor ? editor.value : '',
        focus: () => editor ? editor.focus() : undefined,
    } as EditorAPI;

    /**
     * Initialize the editor
     */
    function init(): void {
        // Get DOM elements
        editor = document.getElementById('markdown-editor') as HTMLTextAreaElement;
        preview = document.getElementById('preview-content');
        resizer = document.getElementById('resizer');
        editorPane = document.getElementById('editor-pane');
        previewPane = document.getElementById('preview-pane');

        // Check if this is fullscreen mode (no preview elements)
        const isFullscreenMode = document.body.classList.contains('fullscreen-mode');

        if (!editor || !editorPane) {
            console.error('Required DOM elements not found (editor or editor-pane missing)');
            return;
        }

        // In split view mode, all elements are required
        if (!isFullscreenMode && (!preview || !resizer || !previewPane)) {
            console.error('Required DOM elements not found for split view mode');
            return;
        }

        // Initialize markdown-it (needed for preview rendering)
        if (typeof (window as any).markdownit !== 'undefined') {
            markdownIt = (window as any).markdownit({
                html: true,
                linkify: true,
                typographer: true,
                breaks: true,
            });
        } else {
            console.error('markdown-it not loaded');
        }

        // Initialize Mermaid
        if (typeof (window as any).mermaid !== 'undefined') {
            const theme = document.body.classList.contains('theme-dark') ? 'dark' : 'default';
            (window as any).mermaid.initialize({
                startOnLoad: false,
                theme: theme,
                securityLevel: 'loose',
            });
        }

        // Setup event listeners
        setupEventListeners();

        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners(): void {
        if (!editor) {
            return;
        }

        // Listen for editor input
        editor.addEventListener('input', handleEditorInput);

        // Listen for editor scroll (for sync scrolling in split view)
        if (previewPane) {
            editor.addEventListener('scroll', handleEditorScroll);
        }

        // Setup resizer (only in split view mode)
        if (resizer) {
            setupResizer();
        }

        // Listen for messages from extension
        window.addEventListener('message', handleExtensionMessage);

        // Handle keyboard shortcuts
        editor.addEventListener('keydown', handleKeyboardShortcuts);
    }

    /**
     * Handle editor input with debouncing
     */
    function handleEditorInput(): void {
        if (!editor) {
            return;
        }

        clearTimeout(updateTimeout);
        updateTimeout = window.setTimeout(() => {
            const content = editor!.value;

            // Send update to extension
            vscode.postMessage({
                type: 'edit',
                content: content,
            });

            // Update preview (only in split view mode)
            if (preview) {
                renderPreview(content);
            }
        }, DEBOUNCE_DELAY);
    }

    /**
     * Handle scroll synchronization
     */
    function handleEditorScroll(): void {
        if (!editor || !previewPane) {
            return;
        }

        const scrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        if (!isNaN(scrollPercent) && isFinite(scrollPercent)) {
            previewPane.scrollTop = scrollPercent * (previewPane.scrollHeight - previewPane.clientHeight);
        }
    }

    /**
     * Handle messages from extension
     */
    function handleExtensionMessage(event: MessageEvent): void {
        const message = event.data;

        switch (message.type) {
            case 'update':
                // Update editor content
                if (editor) {
                    editor.value = message.content;
                    // Only render preview in split view mode
                    if (preview) {
                        renderPreview(message.content);
                    }
                }
                break;

            case 'theme-changed':
                // Handle theme change
                handleThemeChange(message.kind);
                break;
        }
    }

    /**
     * Render Markdown preview
     */
    function renderPreview(markdown: string): void {
        if (!preview) {
            return;
        }

        if (!markdownIt) {
            preview.innerHTML = '<div class="loading">Loading Markdown renderer...</div>';
            return;
        }

        try {
            // Render Markdown to HTML
            const html = markdownIt.render(markdown);
            preview.innerHTML = html;

            // Render Mermaid diagrams
            if (typeof (window as any).mermaid !== 'undefined') {
                const mermaidElements = preview.querySelectorAll('code.language-mermaid');
                mermaidElements.forEach((element, index) => {
                    const code = element.textContent || '';
                    const id = `mermaid-diagram-${index}-${Date.now()}`;

                    // Create container for diagram
                    const container = document.createElement('div');
                    container.className = 'mermaid';
                    container.id = id;
                    container.textContent = code;

                    // Replace code block with mermaid container
                    const pre = element.parentElement;
                    if (pre && pre.tagName === 'PRE') {
                        pre.replaceWith(container);
                    }
                });

                // Initialize all mermaid diagrams
                try {
                    (window as any).mermaid.init(undefined, '.mermaid');
                } catch (error) {
                    console.error('Mermaid rendering error:', error);
                }
            }

            // Add click handlers for links
            preview.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    vscode.postMessage({
                        type: 'openLink',
                        url: (link as HTMLAnchorElement).href,
                    });
                });
            });
        } catch (error) {
            console.error('Preview render error:', error);
            preview.innerHTML = `<div class="loading" style="color: var(--vscode-errorForeground);">
                Error rendering preview: ${(error as Error).message}
            </div>`;
        }
    }

    /**
     * Handle theme changes
     */
    function handleThemeChange(kind: number): void {
        if (!editor) {
            return;
        }

        // kind: 1 = Dark, 2 = Light, 3 = High Contrast
        const isDark = kind === 1 || kind === 3;
        const theme = isDark ? 'dark' : 'light';

        document.body.className = `theme-${theme}`;

        // Update Mermaid theme
        if (typeof (window as any).mermaid !== 'undefined') {
            (window as any).mermaid.initialize({
                startOnLoad: false,
                theme: theme,
                securityLevel: 'loose',
            });

            // Re-render preview to apply new theme
            renderPreview(editor.value);
        }
    }

    /**
     * Setup resizer for split view
     */
    function setupResizer(): void {
        if (!resizer || !editorPane || !previewPane) {
            return;
        }

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = editorPane!.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !editorPane || !previewPane) {
                return;
            }

            const delta = e.clientX - startX;
            const newWidth = startWidth + delta;
            const containerWidth = editorPane.parentElement!.offsetWidth;

            // Constrain width between 20% and 80%
            const minWidth = containerWidth * 0.2;
            const maxWidth = containerWidth * 0.8;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                const widthPercent = (newWidth / containerWidth) * 100;
                editorPane.style.flex = `0 0 ${widthPercent}%`;
                previewPane.style.flex = `0 0 ${100 - widthPercent}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(e: KeyboardEvent): void {
        const toolbarActions = (window as any).toolbarActions;

        // Ctrl+B or Cmd+B: Bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toolbarActions?.bold();
        }

        // Ctrl+I or Cmd+I: Italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            toolbarActions?.italic();
        }

        // Ctrl+K or Cmd+K: Link
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            toolbarActions?.link();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
