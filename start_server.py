#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python 教學系統 - 服務器啟動腳本
"""

import sys
import os
from pathlib import Path

# 添加 web_tutor 目錄到 Python 路徑
current_dir = Path(__file__).parent
web_tutor_dir = current_dir / "web_tutor"
sys.path.insert(0, str(web_tutor_dir))

def main():
    """啟動 FastAPI 服務器"""
    try:
        import uvicorn
    except ImportError:
        print("❌ 錯誤：未安裝 uvicorn")
        print("\n請執行以下命令安裝：")
        print("  pip install uvicorn")
        sys.exit(1)
    
    # 檢查 main.py 是否存在
    main_file = web_tutor_dir / "main.py"
    if not main_file.exists():
        print(f"❌ 錯誤：找不到 {main_file}")
        sys.exit(1)
    
    print("=" * 60)
    print("🐍 Python 教學系統 - 服務器啟動")
    print("=" * 60)
    print(f"\n📁 工作目錄：{current_dir}")
    print(f"📄 主文件：{main_file}")
    print("\n🚀 正在啟動服務器...")
    print("\n💡 提示：")
    print("  - 服務器將在 http://127.0.0.1:8000 運行")
    print("  - 按 Ctrl+C 停止服務器")
    print("  - 在瀏覽器中打開 http://127.0.0.1:8000 訪問系統")
    print("\n" + "=" * 60 + "\n")
    
    # 啟動服務器
    try:
        uvicorn.run(
            "web_tutor.main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,  # 開發模式：自動重載
            reload_dirs=[str(web_tutor_dir)],  # 監聽此目錄的變化
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n👋 服務器已停止")
    except Exception as e:
        print(f"\n❌ 啟動失敗：{e}")
        sys.exit(1)

if __name__ == "__main__":
    main()




