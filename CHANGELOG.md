# Change Log

All notable changes to the "md-editor-pro" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.3] - 2026-01-15

### Added
- **WYSIWYG Markdown Editor** with rich visual editing interface
- **Enhanced Toolbar** with comprehensive formatting options
  - Headings dropdown (H1-H6)
  - Text formatting: Bold, Italic, Strikethrough, Highlight
  - Code: Inline code and code blocks
  - Lists: Bullet, Numbered, and Task lists
  - Insert: Links, Images, Tables
  - Quotes: Blockquote support
- **Emoji Picker** with 64+ categorized emojis (smileys, hearts, gestures, symbols)
- **Split-pane Editor** with resizable editor and preview
- **Real-time Preview** with Mermaid diagram rendering
- **VS Code Theme Integration** for consistent look and feel

### Changed
- Converted entire codebase to TypeScript (100% TypeScript)
- Migrated build system from JavaScript to TypeScript (esbuild.js → esbuild.ts)
- Enhanced dropdown menus with modern animations and better UX
- Improved toolbar organization with logical grouping
- Updated README.md with comprehensive documentation

### Improved
- Better dropdown menu styling with smooth animations and hover effects
- Enhanced toolbar button interactions
- Optimized performance for real-time preview
- Better keyboard shortcut integration
- Type-safe build configuration with tsx

## [0.0.2] - 2026-01-14

### Added
- Basic WYSIWYG editor implementation
- Toolbar with essential formatting buttons
- Split-pane view with markdown editor and preview
- Resizable editor panels

### Features
- Basic text formatting (Bold, Italic)
- Heading support (H1-H6)
- Link and image insertion
- Code block support
- List formatting
- Live preview rendering

### Fixed
- Initial editor setup and configuration
- Preview synchronization issues

## [0.0.1] - 2026-01-11

### Added
- Export Markdown to PDF (current file and entire folder)
- Export Markdown to HTML (current file and entire folder)
- Mermaid diagram rendering support in exports
- Translation features (Vietnamese ↔ English ↔ Japanese)
- Automatic browser detection (Edge/Chrome) for PDF generation

### Features
- Maintains folder structure when exporting folders
- Beautiful CSS styling for HTML exports
- Progress indicators for batch exports
- Error handling with user-friendly messages