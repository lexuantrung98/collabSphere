// src/api/accountApi.ts
import axiosClient from './axiosClient';

export const accountApi = {
  // Hàm kiểm tra sinh viên tồn tại bằng mã số (MSSV)
  getStudentByCode: (code: string) => {
    // Giả sử API của Account Service là /api/accounts/students/{code}
    // Bạn cần sửa đường dẫn này cho khớp với Backend của bạn
    return axiosClient.get(`/accounts/students/${code}`);
  }
};