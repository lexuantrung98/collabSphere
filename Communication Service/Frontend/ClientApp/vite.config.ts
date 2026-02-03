import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 👇 THÊM ĐOẠN CẤU HÌNH NÀY ĐỂ CHẠY VIDEO CALL 👇
  define: {
    // Fix lỗi thư viện cũ tìm biến "global" (Vite dùng "window")
    global: 'window',
    // Fix lỗi thư viện tìm biến "process.env"
    'process.env': {},
  },
  resolve: {
    alias: {
      // Chuyển hướng các module Node.js sang phiên bản trình duyệt
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
    },
  },
})