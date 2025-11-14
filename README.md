Client: views/client/
Admin: views/admin/

## Hướng dẫn cho Sinh viên

### 1. Clone repository về máy
```bash
git clone https://github.com/chithl/jsnangcao_duanxuong_fa25.git
cd jsnangcao_duanxuong_fa25
```

### 2. Checkout branch theo issue được phân công
```bash
# Cập nhật danh sách branch mới nhất
git fetch origin

# Checkout branch theo issue được phân công (ví dụ: 1-[client]-header+footer+home)
git checkout -b <tên-branch> origin/<tên-branch>

# Hoặc nếu branch chưa tồn tại, tạo mới từ main/master
git checkout -b <tên-branch>
```

### 3. Làm việc trên branch
- Thực hiện các thay đổi code theo yêu cầu của issue
- Commit thường xuyên với message rõ ràng:
```bash
git add .
git commit -m "#<số> - <Tên account> - Mô tả ngắn gọn về thay đổi"
# Ví dụ:
git commit -m "#42 - nguyenvana - Thêm header component"
```

### 4. Push code lên remote
```bash
git push origin <tên-branch>
```

### 5. Tạo Pull Request
- Truy cập repository trên GitHub/GitLab
- Tạo Pull Request từ branch của bạn về branch chính
- Gắn link issue vào PR description