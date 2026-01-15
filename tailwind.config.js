/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./media/**/*.{html,js,ts}",
    "./src/**/*.{html,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'vscode-bg': 'var(--vscode-editor-background)',
        'vscode-fg': 'var(--vscode-editor-foreground)',
        'vscode-border': 'var(--vscode-panel-border)',
        'vscode-hover': 'var(--vscode-list-hoverBackground)',
        'vscode-active': 'var(--vscode-list-activeSelectionBackground)',
        'vscode-selection': 'var(--vscode-editor-selectionBackground)',
        'vscode-link': 'var(--vscode-textLink-foreground)',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
