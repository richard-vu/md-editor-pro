# Commands

Thư mục này chứa tất cả các command handlers cho VS Code extension.

## Cấu trúc

- **translate.ts** - Các lệnh dịch thuật (tự động nhận diện ngôn ngữ nguồn)
  - translateText_command - Hiển thị menu chọn ngôn ngữ đích
  - translateToEnglish - Dịch sang tiếng Anh
  - translateToVietnamese - Dịch sang tiếng Việt
  - translateToJapanese - Dịch sang tiếng Nhật

- **index.ts** - Export tất cả commands để sử dụng trong extension.ts

## Quy tắc

- Mỗi command handler chịu trách nhiệm:
  - Validate đầu vào (editor, document, selection)
  - Gọi business logic từ thư mục `core`
  - Hiển thị thông báo cho người dùng
  - Xử lý lỗi
