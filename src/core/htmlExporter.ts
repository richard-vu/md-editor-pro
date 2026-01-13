import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import markdownIt from 'markdown-it';

const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true
});

/**
 * Export HTML from current markdown file
 * Automatically saves HTML file to the same directory
 */
export async function exportHtmlFromCurrentFile() {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No file is currently open!');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'markdown') {
        vscode.window.showErrorMessage('Current file is not a Markdown file!');
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Exporting HTML...",
        cancellable: false
    }, async (progress) => {
        try {
            // Save document if modified
            if (document.isDirty) {
                await document.save();
            }

            const filePath = document.uri.fsPath;
            const content = document.getText();
            const htmlContent = md.render(content);
            
            // Get output path (same directory as source file)
            const outputPath = filePath.replace(/\.md$/i, '.html');
            
            const fullHtml = generateFullHtml(htmlContent, path.basename(filePath, '.md'));
            fs.writeFileSync(outputPath, fullHtml, 'utf-8');
            
            vscode.window.showInformationMessage(`HTML exported successfully: ${path.basename(outputPath)}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error exporting HTML: ${error}`);
        }
    });
}

/**
 * Export HTML from entire folder including subfolders
 * Allows user to choose save location
 */
export async function exportHtmlFromFolder() {
    // Get the folder to export
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select folder to export'
    });

    if (!folderUri || folderUri.length === 0) {
        return;
    }

    // Choose output directory
    const outputUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select output location for HTML'
    });

    if (!outputUri || outputUri.length === 0) {
        return;
    }

    const sourcePath = folderUri[0].fsPath;
    const outputPath = outputUri[0].fsPath;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Exporting HTML from folder...",
        cancellable: false
    }, async (progress) => {
        try {
            const mdFiles = await findMarkdownFiles(sourcePath);
            let processed = 0;

            for (const mdFile of mdFiles) {
                progress.report({ 
                    increment: (1 / mdFiles.length) * 100,
                    message: `Processing: ${path.basename(mdFile)}` 
                });

                const content = fs.readFileSync(mdFile, 'utf-8');
                const htmlContent = md.render(content);
                
                // Maintain folder structure
                const relativePath = path.relative(sourcePath, mdFile);
                const outputFilePath = path.join(outputPath, relativePath.replace(/\.md$/i, '.html'));
                
                // Create output directory if it doesn't exist
                const outputDir = path.dirname(outputFilePath);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                const fullHtml = generateFullHtml(htmlContent, path.basename(mdFile, '.md'));
                fs.writeFileSync(outputFilePath, fullHtml, 'utf-8');
                processed++;
            }

            vscode.window.showInformationMessage(`Successfully exported ${processed} HTML files!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error exporting HTML: ${error}`);
        }
    });
}

/**
 * Generate complete HTML document with styling
 */
function generateFullHtml(content: string, title: string): string {
    // Process mermaid code blocks
    const processedContent = content.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
    ).replace(
        /<pre><code>mermaid([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif'
        });
    </script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin: 20px 0 10px 0;
            font-weight: 600;
            line-height: 1.3;
        }
        
        h1 {
            font-size: 2em;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        
        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        
        h3 {
            font-size: 1.25em;
        }
        
        p {
            margin: 10px 0;
        }
        
        a {
            color: #0066cc;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 5px 0;
        }
        
        pre {
            background: #f6f8fa;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 15px 0;
            border: 1px solid #e1e4e8;
        }
        
        code {
            background: #f6f8fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
        }
        
        pre code {
            background: none;
            padding: 0;
        }
        
        blockquote {
            border-left: 4px solid #dfe2e5;
            margin: 15px 0;
            padding: 10px 20px;
            color: #6a737d;
            background: #f6f8fa;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 15px 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
            overflow: hidden;
            border-radius: 6px;
        }
        
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 10px 15px;
            text-align: left;
        }
        
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        table tr:hover {
            background-color: #f0f0f0;
        }
        
        hr {
            border: none;
            border-top: 2px solid #eee;
            margin: 20px 0;
        }
        
        /* Mermaid diagram styling */
        .mermaid {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            text-align: center;
        }
        
        .mermaid svg {
            max-width: 100%;
            height: auto;
        }
        
        @media print {
            body {
                max-width: 100%;
            }
        }
        
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            table {
                font-size: 0.9em;
            }
        }
    </style>
</head>
<body>
    ${processedContent}
</body>
</html>`;
}

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            files.push(...await findMarkdownFiles(fullPath));
        } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
            files.push(fullPath);
        }
    }
    
    return files;
}
