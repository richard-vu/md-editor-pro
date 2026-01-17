# Change Log

All notable changes to the "md-editor-pro" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.5] - 2026-01-18

### Fixed
- 🐛 Fixed bullet list and numbered list not displaying correctly in WYSIWYG mode
  - Added `list-style-type: disc` for unordered lists
  - Added `list-style-type: decimal` for ordered lists
  - Added `display: list-item` to ensure proper list item rendering

### Improved
- ✨ Enhanced list styling with proper nested list support
  - Unordered lists: disc → circle → square for nested levels
  - Ordered lists: decimal → lower-alpha → lower-roman for nested levels
- 📝 Added task list styling with proper checkbox display
- 🎨 Better visual hierarchy for multi-level lists

## [0.0.4] - 2026-01-16

### Added
- 🎉 **Fullscreen Mode**: New distraction-free WYSIWYG editor without preview pane
  - Perfect for focused writing workflows
  - Access via "MD Editor Pro (Fullscreen)" in "Reopen Editor With..."
  - All formatting toolbar features available
  - Larger editing area with comfortable padding
- 🎨 **Tailwind CSS v4 Integration**: Complete migration to Tailwind CSS
  - Modern utility-first CSS framework
  - Better performance and smaller bundle size
  - Improved maintainability and customization
  - PostCSS build pipeline for CSS processing

### Fixed
- 🐛 Fixed "Required DOM elements not found" error in fullscreen mode
- ⚡ Editor initialization now properly detects fullscreen vs split view mode
- 🎯 Preview rendering only triggers when preview pane exists
- 🔧 Resizer and scroll sync only setup when needed

### Improved
- 🏗️ Split view and fullscreen modes now work seamlessly side-by-side
- 📝 Enhanced editor layout and styling with Tailwind utilities
- 🎭 Better separation of concerns between editor modes
- 💅 Cleaner CSS architecture with component layers

### Technical
- Added `build:css` script for CSS compilation
- Added `watch:css` script for CSS development
- Updated build process to include automatic CSS compilation
- Configured PostCSS with Tailwind CSS v4 plugin
- Added tailwind.config.js for theme customization

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