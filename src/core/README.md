# Core

Thư mục này chứa business logic và các chức năng cốt lõi của extension.

## Cấu trúc

- **translator.ts** - Logic dịch thuật sử dụng Google Translate API
  - translateText() - Hàm dịch văn bản với auto-detect source language

- **pdfExporter.ts** - Logic xuất file PDF từ Markdown
  - exportPdfFromCurrentFile() - Xuất file hiện tại
  - exportPdfFromFolder() - Xuất toàn bộ thư mục
  - Sử dụng puppeteer và markdown-it

- **htmlExporter.ts** - Logic xuất file HTML từ Markdown
  - exportHtmlFromCurrentFile() - Xuất file hiện tại
  - exportHtmlFromFolder() - Xuất toàn bộ thư mục
  - Sử dụng markdown-it với styling

## Quy tắc

- Các module này không nên import vscode API trực tiếp (trừ types)
- Tập trung vào business logic, không quan tâm đến UI
- Có thể tái sử dụng cho các commands khác nhau
