# 🐍 Python 教學系統

一個互動式的 Python 學習平台，讓您可以在瀏覽器中直接編寫和執行 Python 程式碼。

## ✨ 功能特色

- 📚 **豐富的課程內容**：從基礎到進階，循序漸進的 Python 教學
- 💻 **線上程式碼編輯器**：直接在瀏覽器中編寫和執行 Python 程式碼
- ✅ **即時驗證**：自動檢查您的程式碼是否正確
- 📊 **學習統計**：追蹤您的學習進度和執行次數
- 📜 **程式碼歷史**：自動保存程式碼版本，可隨時恢復
- 🌙 **深色主題**：保護眼睛，適合長時間學習
- 📥 **匯出進度**：備份您的學習資料

## 🚀 快速開始

### 1. 安裝依賴

```bash
pip install fastapi uvicorn
```

### 2. 啟動服務器

#### 方法一：使用啟動腳本（推薦）

```bash
python start_server.py
```

#### 方法二：直接使用 uvicorn

```bash
cd web_tutor
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### 方法三：使用 Python 模組

```bash
python -m uvicorn web_tutor.main:app --reload
```

### 3. 打開瀏覽器

在瀏覽器中訪問：**http://127.0.0.1:8000**

## 📁 專案結構

```
python自學/
├── web_tutor/              # Web 應用主目錄
│   ├── main.py            # FastAPI 服務器主文件
│   ├── lessons.py          # 課程內容
│   ├── generate_lesson.py  # 課程生成工具
│   └── static/            # 靜態文件
│       ├── index.html     # 前端頁面
│       ├── script.js      # 前端邏輯
│       └── style.css      # 樣式文件
├── start_server.py        # 服務器啟動腳本
├── README.md              # 本文件
└── IMPROVEMENTS.md        # 改進記錄
```

## 🎮 使用說明

### 基本操作

1. **選擇課程**：點擊左上角的「📚」按鈕查看課程列表
2. **閱讀說明**：在左側面板閱讀課程說明和練習題
3. **編寫程式碼**：在右側編輯器中編寫您的 Python 程式碼
4. **執行程式碼**：點擊「執行程式碼」按鈕或按 `Ctrl+Enter`
5. **查看結果**：在輸出區域查看執行結果

### 快捷鍵

- `Ctrl+Enter` / `Cmd+Enter` - 執行程式碼
- `Ctrl+L` / `Cmd+L` - 清除程式碼
- `Ctrl+R` / `Cmd+R` - 重置程式碼
- `Ctrl+B` / `Cmd+B` - 顯示/隱藏課程列表
- `Ctrl+Shift+F` / `Cmd+Shift+F` - 格式化程式碼
- `←` / `→` - 切換課程

### 進階功能

- **程式碼歷史**：點擊編輯器上方的「📜」按鈕查看歷史版本
- **學習統計**：點擊頁腳的「📊 學習統計」查看詳細統計
- **匯出進度**：點擊頁腳的「📥 匯出進度」備份學習資料
- **主題切換**：點擊標題欄的「🌙/☀️」切換深色/淺色主題
- **匯入進度 / 重置資料**：在頁腳按鈕匯入 JSON 進度檔，或一鍵清除本地草稿與統計
- **伺服器備援執行**：Pyodide 載入失敗時，可切換到「伺服器 (Beta)」模式繼續執行程式碼（input() 會先詢問輸入值）

## 🔧 故障排除

### Pyodide 載入問題

如果一直顯示「正在載入 Python 執行環境...」，請參考：
- [Pyodide 載入問題排查指南](PYODIDE_LOADING_TROUBLESHOOTING.md)

### 常見問題

1. **服務器無法啟動**
   - 確認已安裝 `fastapi` 和 `uvicorn`
   - 檢查端口 8000 是否被占用

2. **課程無法載入**
   - 確認 `web_tutor/lessons.py` 文件存在
   - 檢查瀏覽器控制台（F12）是否有錯誤

3. **程式碼無法執行**
   - 確認 Pyodide 已成功載入
   - 檢查網絡連接是否正常

## 📝 開發說明

### 添加新課程

1. 使用課程生成工具：
   ```bash
   python web_tutor/generate_lesson.py
   ```

2. 或直接編輯 `web_tutor/lessons.py` 文件

### 修改樣式

編輯 `web_tutor/static/style.css` 文件

### 修改功能

編輯 `web_tutor/static/script.js` 文件

## 🛠️ 技術棧

- **後端**：FastAPI (Python)
- **前端**：Vanilla JavaScript
- **Python 執行**：Pyodide (在瀏覽器中運行 Python)
- **樣式**：CSS3 (自定義設計系統)

## 📄 許可證

本專案僅供學習使用。

## 🤝 貢獻

歡迎提出問題和建議！

## 🌐 部署到 Render

詳細的部署指南請參考：[部署指南](DEPLOY.md)

### 快速部署步驟

1. 在 Render 創建新的 Web Service
2. 連接 GitHub 倉庫：`https://github.com/Miiduoa/learnpy`
3. 設置：
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn web_tutor.main:app --host 0.0.0.0 --port $PORT`
4. 點擊 "Create Web Service" 完成部署

## 📚 相關文檔

- [改進記錄](IMPROVEMENTS.md)
- [Pyodide 載入問題排查](PYODIDE_LOADING_TROUBLESHOOTING.md)
- [部署指南](DEPLOY.md)

---

**享受學習 Python 的樂趣！** 🎉
