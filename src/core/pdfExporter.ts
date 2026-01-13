import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import markdownIt from 'markdown-it';
import puppeteer from 'puppeteer-core';

const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true
});

/**
 * Export PDF from current markdown file
 * Automatically saves PDF file to the same directory
 */
export async function exportPdfFromCurrentFile() {
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
        title: "Exporting PDF...",
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
            const outputPath = filePath.replace(/\.md$/i, '.pdf');
            
            await convertHtmlToPdf(htmlContent, outputPath, path.basename(filePath, '.md'));
            
            vscode.window.showInformationMessage(`PDF exported successfully: ${path.basename(outputPath)}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error exporting PDF: ${error}`);
        }
    });
}

/**
 * Export PDF from entire folder including subfolders
 * Allows user to choose save location
 */
export async function exportPdfFromFolder() {
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
        openLabel: 'Select output location for PDF'
    });

    if (!outputUri || outputUri.length === 0) {
        return;
    }

    const sourcePath = folderUri[0].fsPath;
    const outputPath = outputUri[0].fsPath;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Exporting PDF from folder...",
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
                const outputFilePath = path.join(outputPath, relativePath.replace(/\.md$/i, '.pdf'));
                
                // Create output directory if it doesn't exist
                const outputDir = path.dirname(outputFilePath);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                await convertHtmlToPdf(htmlContent, outputFilePath, path.basename(mdFile, '.md'));
                processed++;
            }

            vscode.window.showInformationMessage(`Successfully exported ${processed} PDF files!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error exporting PDF: ${error}`);
        }
    });
}

/**
 * Convert HTML content to PDF using puppeteer
 */
async function convertHtmlToPdf(htmlContent: string, outputPath: string, title: string) {
    // Process mermaid code blocks
    const processedContent = htmlContent.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
    ).replace(
        /<pre><code>mermaid([\s\S]*?)<\/code><\/pre>/g,
        '<div class="mermaid">$1</div>'
    );

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
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
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
        }
        img {
            max-width: 100%;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f2f2f2;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 15px;
            color: #666;
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
    </style>
</head>
<body>
    ${processedContent}
</body>
</html>`;

    // Find Edge or Chrome executable
    const edgePath = findBrowserExecutable();
    
    if (!edgePath) {
        throw new Error('Edge or Chrome browser not found. Please install Microsoft Edge or Google Chrome.');
    }

    const browser = await puppeteer.launch({
        executablePath: edgePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        // Wait for mermaid to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.pdf({
            path: outputPath,
            format: 'A4',
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            printBackground: true
        });
    } finally {
        await browser.close();
    }
}

/**
 * Find browser executable (Edge or Chrome)
 */
function findBrowserExecutable(): string | null {
    const possiblePaths = [
        // Microsoft Edge
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        // Google Chrome
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const browserPath of possiblePaths) {
        if (fs.existsSync(browserPath)) {
            return browserPath;
        }
    }

    return null;
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
