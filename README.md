# Học Tiếng Trung HSK1 💛

Website học tiếng Trung HSK1 dành tặng bạn — có phát âm, từ vựng và trắc nghiệm tương tác.

Made with 💛 by **亮 (Liang)**

## Tính năng

- 📖 **150 từ HSK1** — chữ Hán, pinyin, nghĩa tiếng Việt
- 📝 **Học câu HSK1 theo bài** — chia theo toàn bộ bài học, mỗi bài một nhóm câu
- 🎲 **Luyện câu ngẫu nhiên** — trắc nghiệm nghĩa tiếng Việt cho câu HSK1
- 🔤 **Bảng pinyin phân loại唇音** — phụ âm/韵母 chia theo nhóm môi (双唇, 唇齿, 圆唇, 不圆唇), bấm để nghe (MP3 chuẩn)
- 🔊 **Nghe phát âm** — bấm vào từ để nghe (dùng giọng đọc của trình duyệt)
- 🎤 **Luyện phát âm** — nghe mẫu chậm/nhanh, đọc theo
- ✨ **Trắc nghiệm** — 10 câu hỏi mỗi lần
- ✓ **Theo dõi tiến độ** — đánh dấu từ đã nhớ (lưu trên máy)

## Cách đưa lên GitHub (miễn phí, không cần server)

Website này là **static site 100%** (HTML/CSS/JS + localStorage), nên chỉ cần GitHub Pages, không cần VPS hay backend.

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
git remote add origin https://github.com/ALiangPang/hsk1-chinese-learning.git
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
https://ALiangPang.github.io/hsk1-chinese-learning/
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
├── audio/pinyin/       # MP3 phát âm pinyin (39 file)
├── js/
│   ├── vocabulary.js   # 150 từ HSK1
│   ├── pinyin.js       # Dữ liệu phụ âm / vần / thanh
│   ├── sentences.js    # Câu HSK1 theo bài học
│   └── app.js          # Tương tác & phát âm
├── scripts/
│   └── build-pinyin-audio.mjs  # Tải MP3 từ audio-cmn
└── README.md
```

### Tạo lại file âm thanh pinyin

```powershell
node scripts/build-pinyin-audio.mjs
```

Nguồn âm thanh pinyin: [mp3-chinese-pinyin-sound](https://github.com/davinfifield/mp3-chinese-pinyin-sound)（专用拼音音节录音，非汉字读音）; 备用 [audio-cmn syllabs](https://github.com/hugolpz/audio-cmn).

## Lưu ý

- **Pinyin**: dùng bản ghi **âm tiết pinyin** cục bộ (`audio/pinyin/`) — không phải đọc chữ Hán
- Phát âm từ vựng dùng **Web Speech API** của trình duyệt — không cần internet sau khi tải trang (trừ font)
- Tiến độ học từ/câu và kết quả luyện tập lưu trong **localStorage** của trình duyệt
- Trang hoạt động tốt trên điện thoại
