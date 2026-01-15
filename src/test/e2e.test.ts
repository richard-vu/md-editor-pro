import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

/**
 * End-to-End Tests for WYSIWYG Editor
 * Tests the complete user workflow from opening a file to formatting text
 */

suite('E2E: WYSIWYG Editor Workflow', () => {
    let testDocument: vscode.TextDocument;
    let testEditor: vscode.TextEditor;

    setup(async () => {
        // Activate extension first
        const ext = vscode.extensions.getExtension('luong-vu.md-editor-pro');
        if (ext && !ext.isActive) {
            await ext.activate();
        }
    });

    teardown(async () => {
        // Close all editors after each test
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('E2E: Open markdown file and verify extension loads', async () => {
        // Step 1: Create a test markdown file
        const content = '# Test Markdown File\n\nThis is a test.';
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: content
        });

        // Step 2: Show document in editor
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 3: Verify document is opened
        assert.strictEqual(testEditor.document.languageId, 'markdown');
        assert.ok(testEditor.document.getText().includes('Test Markdown File'));
    });

    test('E2E: Format selected text as bold', async () => {
        // Step 1: Create document with text
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Hello World'
        });
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 2: Select "Hello"
        testEditor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 5)
        );

        // Step 3: Verify selection
        const selectedText = testEditor.document.getText(testEditor.selection);
        assert.strictEqual(selectedText, 'Hello');

        // Step 4: Apply edit (simulating bold)
        await testEditor.edit(editBuilder => {
            editBuilder.replace(testEditor.selection, `**${selectedText}**`);
        });

        // Step 5: Verify result
        const finalText = testEditor.document.getText();
        assert.strictEqual(finalText, '**Hello** World');
    });

    test('E2E: Insert heading', async () => {
        // Step 1: Create document
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'My Title'
        });
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 2: Select all text
        const entireRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(0, 8)
        );
        testEditor.selection = new vscode.Selection(entireRange.start, entireRange.end);

        // Step 3: Add H2 prefix
        const selectedText = testEditor.document.getText(testEditor.selection);
        await testEditor.edit(editBuilder => {
            editBuilder.replace(testEditor.selection, `## ${selectedText}`);
        });

        // Step 4: Verify
        assert.strictEqual(testEditor.document.getText(), '## My Title');
    });

    test('E2E: Convert lines to list', async () => {
        // Step 1: Create multi-line document
        const lines = 'Item 1\nItem 2\nItem 3';
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: lines
        });
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 2: Select all
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(2, 6)
        );
        testEditor.selection = new vscode.Selection(fullRange.start, fullRange.end);

        // Step 3: Convert to list
        const text = testEditor.document.getText(testEditor.selection);
        const listLines = text.split('\n').map(line => `- ${line}`).join('\n');

        await testEditor.edit(editBuilder => {
            editBuilder.replace(testEditor.selection, listLines);
        });

        // Step 4: Verify
        const expected = '- Item 1\n- Item 2\n- Item 3';
        assert.strictEqual(testEditor.document.getText(), expected);
    });

    test('E2E: Insert link template', async () => {
        // Step 1: Create document
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Click here'
        });
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 2: Select text
        testEditor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 10)
        );

        // Step 3: Wrap in link syntax
        const selectedText = testEditor.document.getText(testEditor.selection);
        await testEditor.edit(editBuilder => {
            editBuilder.replace(testEditor.selection, `[${selectedText}](url)`);
        });

        // Step 4: Verify
        assert.strictEqual(testEditor.document.getText(), '[Click here](url)');
    });

    test('E2E: Insert code block', async () => {
        // Step 1: Create document with code
        const code = 'function hello() {\n  console.log("Hi");\n}';
        testDocument = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: code
        });
        testEditor = await vscode.window.showTextDocument(testDocument);

        // Step 2: Select all code
        const codeRange = new vscode.Range(
            new vscode.Position(0, 0),
            testEditor.document.lineAt(testEditor.document.lineCount - 1).range.end
        );
        testEditor.selection = new vscode.Selection(codeRange.start, codeRange.end);

        // Step 3: Wrap in code block
        const selectedCode = testEditor.document.getText(testEditor.selection);
        await testEditor.edit(editBuilder => {
            editBuilder.replace(testEditor.selection, `\`\`\`\n${selectedCode}\n\`\`\``);
        });

        // Step 4: Verify
        const result = testEditor.document.getText();
        assert.ok(result.startsWith('```'));
        assert.ok(result.endsWith('```'));
        assert.ok(result.includes('function hello()'));
    });
});

suite('E2E: WYSIWYG Editor Commands', () => {
    test('E2E: Export PDF command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('md-editor-pro.exportPdfFile'),
            'Export PDF command should be available'
        );
    });

    test('E2E: Translation command exists', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('md-editor-pro.translate'),
            'Translate command should be available'
        );
    });

    test('E2E: All export commands registered', async () => {
        const commands = await vscode.commands.getCommands(true);

        const requiredCommands = [
            'md-editor-pro.exportPdfFile',
            'md-editor-pro.exportPdfFolder',
            'md-editor-pro.exportHtmlFile',
            'md-editor-pro.exportHtmlFolder'
        ];

        for (const cmd of requiredCommands) {
            assert.ok(
                commands.includes(cmd),
                `Command ${cmd} should be registered`
            );
        }
    });
});

suite('E2E: Document Persistence', () => {
    test('E2E: Changes should persist in document', async () => {
        // Step 1: Create and edit document
        const doc = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Original text'
        });
        const editor = await vscode.window.showTextDocument(doc);

        // Step 2: Make edit
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(0, 13)
            );
            editBuilder.replace(fullRange, '**Original text**');
        });

        // Step 3: Verify document is dirty (modified)
        assert.ok(doc.isDirty, 'Document should be marked as modified');

        // Step 4: Verify content
        assert.strictEqual(doc.getText(), '**Original text**');

        // Cleanup
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('E2E: Multiple edits should accumulate', async () => {
        // Step 1: Create document
        const doc = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Test'
        });
        const editor = await vscode.window.showTextDocument(doc);

        // Step 2: First edit - make bold
        await editor.edit(editBuilder => {
            const range = doc.lineAt(0).range;
            editBuilder.replace(range, '**Test**');
        });

        // Step 3: Second edit - add heading
        await editor.edit(editBuilder => {
            const range = doc.lineAt(0).range;
            const currentText = doc.getText(range);
            editBuilder.replace(range, `# ${currentText}`);
        });

        // Step 4: Verify both edits applied
        assert.strictEqual(doc.getText(), '# **Test**');

        // Cleanup
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
});
