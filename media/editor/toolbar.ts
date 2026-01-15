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

interface ToolbarActions {
    [key: string]: () => void;
}

(function () {
    'use strict';

    // Get VS Code API from window (shared with editor.ts)
    const vscode = (window as any).vscodeApi;

    if (!vscode) {
        console.error('VS Code API not found. Make sure editor.ts loads first.');
        return;
    }

    /**
     * Wait for editorAPI to be available
     */
    function waitForEditorAPI(callback: () => void, maxAttempts: number = 50): void {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if ((window as any).editorAPI) {
                clearInterval(interval);
                console.log('Editor API ready, initializing toolbar');
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('Editor API not available after waiting');
            }
        }, 100);
    }

    /**
     * Toolbar actions - properly format selected text or insert template
     */
    const toolbarActions: ToolbarActions = {
        'heading-toggle': () => {
            const menu = document.getElementById('heading-menu');
            console.log('Heading toggle clicked, menu:', menu);
            if (menu) {
                const isShowing = menu.classList.contains('show');
                menu.classList.toggle('show');
                console.log('Menu toggled, now showing:', !isShowing);
            } else {
                console.error('Heading menu not found in DOM');
            }
        },

        heading1: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Replace and place cursor at end
                editorAPI.replaceSelection(`# ${selection.text}`);
            } else {
                // Insert at cursor position
                editorAPI.insertAtCursor('# ');
            }
            closeDropdown();
        },

        heading2: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`## ${selection.text}`);
            } else {
                editorAPI.insertAtCursor('## ');
            }
            closeDropdown();
        },

        heading3: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`### ${selection.text}`);
            } else {
                editorAPI.insertAtCursor('### ');
            }
            closeDropdown();
        },

        heading4: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`#### ${selection.text}`);
            } else {
                editorAPI.insertAtCursor('#### ');
            }
            closeDropdown();
        },

        heading5: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`##### ${selection.text}`);
            } else {
                editorAPI.insertAtCursor('##### ');
            }
            closeDropdown();
        },

        heading6: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`###### ${selection.text}`);
            } else {
                editorAPI.insertAtCursor('###### ');
            }
            closeDropdown();
        },

        bold: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Wrap selected text and place cursor at end
                editorAPI.replaceSelection(`**${selection.text}**`);
            } else {
                // Insert template with placeholder selected for easy typing
                editorAPI.insertTemplate('**', '**', 'bold text');
            }
        },

        italic: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Wrap selected text and place cursor at end
                editorAPI.replaceSelection(`*${selection.text}*`);
            } else {
                // Insert template with placeholder selected for easy typing
                editorAPI.insertTemplate('*', '*', 'italic text');
            }
        },

        link: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Wrap selected text in link, with URL selected
                editorAPI.insertTemplate(`[${selection.text}](`, ')', 'url');
            } else {
                // Insert link template with text selected
                editorAPI.insertTemplate('[', '](url)', 'link text');
            }
        },

        image: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Wrap selected text as alt text, with URL selected
                editorAPI.insertTemplate(`![${selection.text}](`, ')', 'image-url');
            } else {
                // Insert image template with alt text selected
                editorAPI.insertTemplate('![', '](image-url)', 'alt text');
            }
        },

        code: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                // Wrap selected text in code block
                editorAPI.replaceSelection(`\`\`\`\n${selection.text}\n\`\`\``);
            } else {
                // Insert empty code block with placeholder
                editorAPI.insertTemplate('```\n', '\n```', 'code');
            }
        },

        'inline-code': () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`\`${selection.text}\``);
            } else {
                editorAPI.insertTemplate('`', '`', 'code');
            }
        },

        strikethrough: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`~~${selection.text}~~`);
            } else {
                editorAPI.insertTemplate('~~', '~~', 'strikethrough text');
            }
        },

        highlight: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                editorAPI.replaceSelection(`==${selection.text}==`);
            } else {
                editorAPI.insertTemplate('==', '==', 'highlight text');
            }
        },

        quote: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                const lines = selection.text.split('\n');
                const quotedLines = lines.map(line => `> ${line}`).join('\n');
                editorAPI.replaceSelection(quotedLines);
            } else {
                editorAPI.insertAtCursor('> ');
            }
        },

        table: () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const tableTemplate = `| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;
            editorAPI.insertAtCursor(tableTemplate);
        },

        'unordered-list': () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                const lines = selection.text.split('\n');
                const formattedList = lines.map(line => line.trim() ? `- ${line}` : '').join('\n');
                editorAPI.replaceSelection(formattedList);
            } else {
                editorAPI.insertAtCursor('- ');
            }
        },

        'ordered-list': () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                const lines = selection.text.split('\n');
                const formattedList = lines.map((line, index) => 
                    line.trim() ? `${index + 1}. ${line}` : ''
                ).join('\n');
                editorAPI.replaceSelection(formattedList);
            } else {
                editorAPI.insertAtCursor('1. ');
            }
        },

        'task-list': () => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const selection = editorAPI.getSelection();
            
            if (selection.text) {
                const lines = selection.text.split('\n');
                const taskList = lines.map(line => 
                    line.trim() ? `- [ ] ${line}` : ''
                ).join('\n');
                editorAPI.replaceSelection(taskList);
            } else {
                editorAPI.insertAtCursor('- [ ] ');
            }
        },

        'emoji-toggle': () => {
            const menu = document.getElementById('emoji-menu');
            if (menu) {
                menu.classList.toggle('show');
            }
        },

        'insert-emoji': (event?: Event) => {
            const editorAPI = (window as any).editorAPI as EditorAPI;
            const target = event?.target as HTMLElement;
            const emoji = target?.getAttribute('data-emoji');
            if (emoji) {
                editorAPI.insertAtCursor(emoji);
            }
            const menu = document.getElementById('emoji-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        },

        'export-pdf': () => {
            vscode.postMessage({
                type: 'command',
                command: 'md-editor-pro.exportPdfFile',
            });
        },

        translate: () => {
            vscode.postMessage({
                type: 'command',
                command: 'md-editor-pro.translate',
            });
        },
    };

    /**
     * Close dropdown menu
     */
    function closeDropdown(): void {
        const menu = document.getElementById('heading-menu');
        if (menu) {
            menu.classList.remove('show');
        }
    }

    /**
     * Initialize toolbar
     */
    function initToolbar(): void {
        console.log('Initializing toolbar...');
        
        // Verify dropdown menu exists
        const headingMenu = document.getElementById('heading-menu');
        console.log('Heading menu found:', !!headingMenu);
        if (headingMenu) {
            console.log('Heading menu children:', headingMenu.children.length);
        }
        
        // Handle clicks on the entire document to catch dropdown items
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const button = target.closest('[data-action]') as HTMLElement;
            
            if (button) {
                const action = button.getAttribute('data-action');
                console.log(`Button clicked with action: ${action}`);

                // Check if this is a dropdown item
                const isDropdownItem = button.classList.contains('toolbar-dropdown-item');
                
                if (action && toolbarActions[action]) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    try {
                        console.log(`Executing action: ${action}`);
                        // Pass event for insert-emoji action
                        if (action === 'insert-emoji') {
                            (toolbarActions[action] as (e?: Event) => void)(e);
                        } else {
                            toolbarActions[action]();
                        }
                        
                        // Focus editor after action (except for toggle actions)
                        if (!action.includes('toggle') && !action.includes('export') && !action.includes('translate')) {
                            const editorAPI = (window as any).editorAPI as EditorAPI;
                            if (editorAPI && editorAPI.focus) {
                                setTimeout(() => editorAPI.focus(), 10);
                            }
                        }
                    } catch (error) {
                        console.error(`Error executing action ${action}:`, error);
                    }
                } else if (action) {
                    console.warn(`Unknown action: ${action}`);
                }
            } else {
                // Clicked outside - close dropdown
                const dropdown = target.closest('.toolbar-dropdown');
                const dropdownMenu = target.closest('.toolbar-dropdown-menu');
                
                if (!dropdown && !dropdownMenu) {
                    closeDropdown();
                    const emojiMenu = document.getElementById('emoji-menu');
                    if (emojiMenu) {
                        emojiMenu.classList.remove('show');
                    }
                }
            }
        });

        console.log('Toolbar initialized successfully');
    }

    // Expose toolbar actions for keyboard shortcuts
    (window as any).toolbarActions = toolbarActions;

    // Initialize when DOM is ready AND editorAPI is available
    function startInitialization(): void {
        waitForEditorAPI(initToolbar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInitialization);
    } else {
        startInitialization();
    }
})();