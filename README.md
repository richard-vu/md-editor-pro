# MD Editor Pro
A powerful Markdown editor for VS Code with WYSIWYG editing, advanced export capabilities, and translation features

---

## ✨ Features

### 📝 WYSIWYG Markdown Editor
- **Visual editing interface** with toolbar for formatting
- **Two editing modes**:
  - **Split View**: Live preview alongside your Markdown source
  - **Fullscreen Mode**: Distraction-free editor without preview
- **Rich formatting options**: headings, bold, italic, strikethrough, highlight
- **Code blocks** with inline code and fenced code blocks
- **Lists**: bullet lists, numbered lists, and task lists (checkboxes)
- **Insert elements**: links, images, and tables
- **Quotes**: blockquote support
- **Emoji picker** with categorized emojis (smileys, hearts, gestures, symbols)
- **Mermaid diagram** rendering in real-time (in split view mode)

### 📄 Export to PDF
- **Export current file to PDF**: Convert the current Markdown file to PDF and save it in the same directory
- **Export folder to PDF**: Export all Markdown files from a folder (including subfolders) to PDF with custom output location
- **Professional styling**: Beautiful PDF output with proper formatting
- **Mermaid diagrams**: Automatically rendered in PDF exports

### 🌐 Export to HTML
- **Export current file to HTML**: Convert the current Markdown file to HTML with beautiful styling
- **Export folder to HTML**: Export all Markdown files from a folder (including subfolders) to HTML with custom output location
- **Responsive design**: Mobile-friendly HTML output
- **Mermaid diagrams**: Automatically rendered in HTML exports

### 🎨 Mermaid Diagram Support
- Automatically renders Mermaid diagrams in WYSIWYG editor, PDF, and HTML exports
- Supports all Mermaid diagram types:
  - Flowcharts
  - Sequence diagrams
  - Class diagrams
  - State diagrams
  - Gantt charts
  - Pie charts
  - And more...

### 🌍 Translation Features
- **Multi-language support**:
  - Vietnamese ↔ English
  - Vietnamese ↔ Japanese  
  - English ↔ Japanese
- **Context-aware**: Works with selected text in Markdown files
- **Quick access**: Available in WYSIWYG editor toolbar

---

## 🚀 Getting Started

### Installation

1. Open VS Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
3. Type `ext install luong-vu.md-editor-pro`
4. Press Enter

Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=luong-vu.md-editor-pro)

### Requirements

- **Microsoft Edge or Google Chrome** (required for PDF export)
- **Internet connection** (for Mermaid rendering in exports)

---

## 📖 Usage

### WYSIWYG Editor

MD Editor Pro offers two WYSIWYG editing modes to suit your workflow:

#### Split View Mode (with Live Preview)

1. **Open a Markdown file** (`.md`)
2. **Right-click** on the editor tab
3. Select **"Reopen Editor With..."**
4. Choose **"MD Editor Pro (WYSIWYG)"**

This mode provides a split-pane view with:
- Left: Markdown editor with toolbar
- Right: Live preview of rendered content
- Resizable panes for customized layout
- Real-time Mermaid diagram rendering

#### Fullscreen Mode (Distraction-Free)

1. **Open a Markdown file** (`.md`)
2. **Right-click** on the editor tab
3. Select **"Reopen Editor With..."**
4. Choose **"MD Editor Pro (Fullscreen)"**

This mode provides a fullscreen editor with:
- No preview pane for maximum focus
- Full toolbar with all formatting options
- Larger editing area
- Perfect for writing-focused workflows

**Set as Default Editor:**
- Right-click any `.md` file in Explorer
- Select **"Open With..."**
- Choose **"MD Editor Pro (WYSIWYG)"** or **"MD Editor Pro (Fullscreen)"**
- Check **"Set as default"**

#### Toolbar Features

The WYSIWYG editor provides a rich toolbar with:

**Text Formatting:**
- **Headings** (H1-H6) - Dropdown menu
- **Bold** (Ctrl+B) - `**text**`
- **Italic** (Ctrl+I) - `*text*`
- **Strikethrough** - `~~text~~`
- **Highlight** - `==text==`

**Code & Quotes:**
- **Inline Code** - `` `code` ``
- **Code Block** - Multi-line code with syntax highlighting
- **Quote** - Blockquote formatting

**Lists:**
- **Bullet List** - Unordered list
- **Numbered List** - Ordered list
- **Task List** - Checkbox list

**Insert Elements:**
- **Link** (Ctrl+K) - Insert hyperlinks
- **Image** - Insert images
- **Table** - Insert formatted tables

**Tools:**
- **Emoji Picker** - Insert emojis with visual picker
- **Export PDF** - Quick export to PDF
- **Translate** - Multi-language translation

### Export Commands

Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS) to open the Command Palette, then:

#### PDF Export
- **MD Editor Pro: Export PDF (Current File)** - Export current file to PDF
- **MD Editor Pro: Export PDF (Folder)** - Export entire folder to PDF with custom output location

#### HTML Export
- **MD Editor Pro: Export HTML (Current File)** - Export current file to HTML
- **MD Editor Pro: Export HTML (Folder)** - Export entire folder to HTML with custom output location

### Translation Commands

Select text in a Markdown file, then use Command Palette to access:

- **MD Editor Pro: Translate (Select Language)** - Choose language pair interactively
- **MD Editor Pro: Translate to English** - Quick translate to English
- **MD Editor Pro: Translate to Vietnamese** - Quick translate to Vietnamese
- **MD Editor Pro: Translate to Japanese** - Quick translate to Japanese

Or use the **Translate button** in the WYSIWYG editor toolbar for quick access.

---

## ⚙️ Configuration

This extension works out of the box with no configuration required.

### Future Settings (Coming Soon)
- Custom PDF styling
- Default export locations
- Editor theme customization
- Custom emoji collections

---

## 🐛 Known Issues

- PDF export requires Microsoft Edge or Google Chrome to be installed
- Mermaid diagrams require internet connection for rendering
- Large files may experience slight delays in live preview

Report issues on [GitHub Issues](https://github.com/richard-vu/md-editor-pro/issues)

---

## 🗺️ Roadmap

- [ ] Custom PDF templates
- [ ] Export to DOCX format
- [ ] Collaborative editing features
- [ ] More export options (LaTeX, AsciiDoc)
- [ ] Enhanced table editor
- [ ] Custom emoji support
- [ ] Dark/Light theme toggle for exports
- [ ] Math equation editor

---

## 📝 Release Notes

### Version 0.0.4 (Current)

**New Features:**
- 🎉 **Fullscreen Mode** - Distraction-free WYSIWYG editor without preview pane
- 🎨 **Tailwind CSS v4** - Complete migration to modern utility-first CSS framework
- 📱 **Dual Editor Modes** - Choose between split view or fullscreen based on your workflow

**Improvements:**
- 🐛 Fixed DOM element detection issues in different editor modes
- ⚡ Optimized editor initialization and performance
- 💅 Enhanced styling with Tailwind utility classes
- 🏗️ Better CSS architecture with component layers
- 🔧 Improved build process with PostCSS pipeline

### Version 0.0.3

**New Features:**
- ✨ WYSIWYG Markdown editor with rich toolbar
- 🎨 Enhanced UI with modern dropdown menus
- 😊 Emoji picker with 64+ categorized emojis
- ✅ Task list support with checkboxes
- 🔢 Ordered and unordered list formatting
- 💬 Quote and code block support
- 🖊️ Strikethrough and highlight text formatting
- 🔗 Quick link and image insertion
- 📊 Table insertion
- 🌓 VS Code theme integration
- 📱 Resizable split-pane editor
- ⚡ Real-time preview with Mermaid support

**Improvements:**
- Converted entire codebase to TypeScript
- Enhanced build system with tsx
- Improved dropdown menu animations
- Better toolbar organization
- Optimized performance

### Version 0.0.1

Initial release:
- PDF and HTML export features
- Mermaid diagram support
- Translation capabilities for Vietnamese, English, and Japanese

---

## 💡 Tips & Tricks

1. **Quick formatting**: Use keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)
2. **Emoji search**: Hover over emojis in the picker to see their names
3. **Choose your mode**: 
   - Use **Split View** for content that needs live preview (diagrams, tables)
   - Use **Fullscreen** for focused writing without distractions
4. **Split view resizing**: Drag the resizer between editor and preview to adjust sizes
5. **Export shortcut**: Use the toolbar export button for quick PDF generation
6. **Task lists**: Use `- [ ]` for unchecked and `- [x]` for checked items

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown parser
- [Mermaid](https://mermaid.js.org/) - Diagram and flowchart generation
- [Puppeteer](https://pptr.dev/) - Headless browser for PDF generation
- VS Code team for the excellent extension API

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/richard-vu/md-editor-pro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/richard-vu/md-editor-pro/discussions)
- **Email**: [Contact Us](mailto:support@example.com)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/richard-vu">Luong Vu</a>
</p>

<p align="center">
  <strong>⭐ If you like this extension, please star it on <a href="https://github.com/richard-vu/md-editor-pro">GitHub</a>!</strong>
</p>
