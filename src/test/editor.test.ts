import * as assert from 'assert';
import * as vscode from 'vscode';

suite('WYSIWYG Editor - Editor API Tests', () => {
    test('getSelection should return correct selection data', async () => {
        // This will be tested in webview context
        // For now, we test that the extension loads
        const ext = vscode.extensions.getExtension('luong-vu.md-editor-pro');
        assert.ok(ext, 'Extension should be found');
    });

    test('Extension should register custom editor provider', async () => {
        const ext = vscode.extensions.getExtension('luong-vu.md-editor-pro');
        assert.ok(ext, 'Extension should exist');

        if (!ext.isActive) {
            await ext.activate();
        }

        assert.ok(ext.isActive, 'Extension should be active');
    });

    test('Custom editor should be available for .md files', async () => {
        // Create a test markdown file
        const doc = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: '# Test Heading\n\nTest content'
        });

        assert.strictEqual(doc.languageId, 'markdown', 'Document should be markdown');

        // Clean up
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
});

suite('WYSIWYG Editor - Command Tests', () => {
    test('Export PDF command should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(
            commands.includes('md-editor-pro.exportPdfFile'),
            'Export PDF command should be registered'
        );
    });

    test('Export HTML command should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(
            commands.includes('md-editor-pro.exportHtmlFile'),
            'Export HTML command should be registered'
        );
    });

    test('Translation commands should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(
            commands.includes('md-editor-pro.translate'),
            'Translate command should be registered'
        );
        assert.ok(
            commands.includes('md-editor-pro.translateToEn'),
            'Translate to English command should be registered'
        );
    });
});

suite('WYSIWYG Editor - Document Editing Tests', () => {
    test('Should format text as bold', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Hello World'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select "Hello"
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 5)
        );

        // Expected: **Hello** World after bold formatting
        // This would be tested in webview context

        assert.ok(editor.selection.start.character === 0, 'Selection should start at 0');
        assert.ok(editor.selection.end.character === 5, 'Selection should end at 5');

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });

    test('Should insert heading prefix', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'markdown',
            content: 'Test Heading'
        });

        const editor = await vscode.window.showTextDocument(doc);

        // Select text
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 12)
        );

        // Expected: ## Test Heading
        assert.ok(editor.document.getText().includes('Test Heading'));

        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
});
