# Học Tiếng Trung HSK1 💛

Website học tiếng Trung HSK1 dành tặng bạn — có phát âm, từ vựng và trắc nghiệm tương tác.

Made with 💛 by **亮 (Liang)**

## Tính năng

- 📖 **150 từ HSK1** — chữ Hán, pinyin, nghĩa tiếng Việt
- 🔊 **Nghe phát âm** — bấm vào từ để nghe (dùng giọng đọc của trình duyệt)
- 🎤 **Luyện phát âm** — nghe mẫu chậm/nhanh, đọc theo
- ✨ **Trắc nghiệm** — 10 câu hỏi mỗi lần
- ✓ **Theo dõi tiến độ** — đánh dấu từ đã nhớ (lưu trên máy)

## Cách đưa lên GitHub (miễn phí, không cần server)

### Bước 1: Tạo repository trên GitHub

1. Mở [github.com](https://github.com) và đăng nhập
2. Bấm **New repository** (nút xanh)
3. Đặt tên, ví dụ: `hsk1-chinese-learning`
4. Chọn **Public**
5. **Không** tick "Add a README"
6. Bấm **Create repository**

### Bước 2: Upload code lên GitHub

Mở PowerShell hoặc Terminal, chạy lần lượt (thay `TEN-GITHUB` bằng tên GitHub của bạn):

```powershell
cd C:\Users\ADTEK\hsk1-chinese-learning
git add .
git commit -m "feat: add HSK1 Chinese learning website"
git branch -M main
git remote add origin https://github.com/TEN-GITHUB/hsk1-chinese-learning.git
git push -u origin main
```

> Lần đầu push có thể hỏi đăng nhập GitHub — làm theo hướng dẫn trên màn hình.

### Bước 3: Bật GitHub Pages

1. Vào repository trên GitHub
2. **Settings** → **Pages** (menu bên trái)
3. **Source**: chọn **Deploy from a branch**
4. **Branch**: chọn `main` và folder `/ (root)`
5. Bấm **Save**

Đợi 1–2 phút, trang sẽ có địa chỉ:

```
https://TEN-GITHUB.github.io/hsk1-chinese-learning/
```

Gửi link này cho bạn là xong!

## Xem thử trên máy

Mở file `index.html` bằng trình duyệt Chrome hoặc Edge (phát âm hoạt động tốt nhất trên 2 trình duyệt này).

Hoặc chạy server nhỏ:

```powershell
cd C:\Users\ADTEK\hsk1-chinese-learning
python -m http.server 8080
```

Rồi mở: http://localhost:8080

## Cấu trúc

```
hsk1-chinese-learning/
├── index.html          # Trang chính
├── css/style.css       # Giao diện
├── js/
│   ├── vocabulary.js   # 150 từ HSK1
│   └── app.js          # Tương tác & phát âm
└── README.md
```

## Lưu ý

- Phát âm dùng **Web Speech API** của trình duyệt — không cần internet sau khi tải trang (trừ font)
- Tiến độ học lưu trong **localStorage** của trình duyệt
- Trang hoạt động tốt trên điện thoại
