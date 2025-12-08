# 部署到 Render 指南

## 前置要求

1. GitHub 帳號
2. Render 帳號（可在 https://render.com 免費註冊）

## 部署步驟

### 1. 在 Render 創建新服務

1. 登入 Render Dashboard
2. 點擊 "New +" → "Web Service"
3. 連接你的 GitHub 倉庫：`https://github.com/Miiduoa/learnpy`
4. 配置如下：
   - **Name**: `python-learning-tutor`（或你喜歡的名稱）
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn web_tutor.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: 選擇 Free 方案

### 2. 環境變數（可選）

目前不需要額外的環境變數，但如果未來需要，可以在 Render Dashboard 的 Environment 區塊添加。

### 3. 部署

點擊 "Create Web Service"，Render 會自動：
1. 從 GitHub 拉取代碼
2. 安裝依賴
3. 啟動服務

### 4. 訪問應用

部署完成後，Render 會提供一個 URL，例如：
`https://python-learning-tutor.onrender.com`

## 注意事項

- Render 免費方案會在 15 分鐘無活動後休眠，首次訪問可能需要幾秒鐘喚醒
- 如果需要保持服務常駐，可以考慮升級到付費方案
- 確保所有依賴都在 `requirements.txt` 中列出

## 故障排除

如果部署失敗，檢查：
1. `requirements.txt` 是否包含所有依賴
2. 啟動命令是否正確
3. Render 日誌中的錯誤訊息

