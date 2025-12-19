# 智能程式碼驗證系統

## 概述

本系統現在支援更智能的程式碼驗證，不僅檢查輸出結果，還會檢查程式碼的寫法是否符合題目要求。即使輸出結果相同，如果使用了錯誤的程式邏輯（例如硬編碼而非使用循環），系統也會給出引導式的反饋。

## 功能特點

### 1. 程式碼結構檢查

系統使用 AST（抽象語法樹）分析來檢查程式碼結構，可以檢測：

- ✅ 是否使用了循環（for/while）
- ✅ 是否定義了函數
- ✅ 是否使用了 if 語句
- ✅ 是否使用了特定變數
- ✅ 是否禁止硬編碼
- ✅ 循環數量限制
- ✅ 禁止使用特定模組

### 2. 引導式教學反饋

當學生的程式碼不符合要求時，系統會提供：

- ❌ 明確指出問題所在
- 💡 提供改進建議
- 📝 解釋為什麼需要使用特定寫法

## 使用方法

### 在課程中設定程式碼結構要求

在課程的 `validator` 中，可以添加 `code_requirements` 來指定程式碼結構要求：

```python
{
    "id": "EX3-1",
    "title": "使用 for 迴圈",
    "exercise": "請使用 for 迴圈印出 0 到 4",
    "validator": {
        "type": "stdout_equals",
        "expected_output": "0\n1\n2\n3\n4\n",
        "code_requirements": {
            "requires_loop": True,        # 要求使用循環
            "loop_type": "for",           # 指定必須使用 for 循環
            "forbids_hardcode": True      # 禁止硬編碼
        }
    }
}
```

### 可用的程式碼結構要求選項

#### `requires_loop` (bool)
要求使用循環。設為 `True` 時，程式碼必須包含循環。

#### `loop_type` (str, 可選)
指定循環類型：
- `"for"` - 必須使用 for 循環
- `"while"` - 必須使用 while 循環
- 不指定 - 任意循環都可以

#### `requires_function` (bool)
要求定義函數。設為 `True` 時，程式碼必須包含函數定義。

#### `function_name` (str, 可選)
指定函數名稱。如果指定，必須定義該名稱的函數。

#### `requires_if` (bool)
要求使用 if 語句。設為 `True` 時，程式碼必須包含 if 語句。

#### `requires_variable` (list, 可選)
要求使用特定變數。例如：`["i", "result"]` 表示必須使用變數 `i` 和 `result`。

#### `forbids_hardcode` (bool)
禁止硬編碼。設為 `True` 時，系統會檢測是否使用了硬編碼模式（例如多個重複的 print 語句而非使用循環）。

#### `min_loops` (int, 可選)
最少循環數量。例如：`1` 表示至少需要 1 個循環。

#### `max_loops` (int, 可選)
最多循環數量。例如：`2` 表示最多只能有 2 個循環。

#### `forbids_import` (str 或 list, 可選)
禁止使用特定模組。例如：`"math"` 或 `["math", "random"]`。

## 範例

### 範例 1：要求使用 for 循環

```python
{
    "id": "EX3-1",
    "title": "使用 for 迴圈",
    "exercise": "請使用 for 迴圈印出 0 到 4",
    "validator": {
        "type": "stdout_equals",
        "expected_output": "0\n1\n2\n3\n4\n",
        "code_requirements": {
            "requires_loop": True,
            "loop_type": "for",
            "forbids_hardcode": True
        }
    }
}
```

**學生寫法 1（正確）：**
```python
for i in range(5):
    print(i)
```
✅ 通過：使用了 for 循環，輸出正確

**學生寫法 2（錯誤）：**
```python
print(0)
print(1)
print(2)
print(3)
print(4)
```
❌ 不通過：輸出正確，但使用了硬編碼，沒有使用循環

**系統反饋：**
```
⚠️ 輸出結果正確，但程式寫法不符合題目要求：

❌ 此題目要求使用 for 循環，但您的代碼中沒有使用 for 循環。
💡 提示：使用 for 循環可以讓代碼更簡潔，避免重複寫多行相似的代碼。

❌ 檢測到硬編碼的寫法。雖然結果可能正確，但此題目要求使用更靈活的方法（如循環）。
💡 提示：嘗試使用循環來處理重複的操作，這樣代碼更簡潔且易於維護。

💡 請修改程式碼以符合題目的要求。
```

### 範例 2：要求定義函數

```python
{
    "id": "EX5-1",
    "title": "定義函數計算平方",
    "exercise": "請定義一個名為 square 的函數，計算數字的平方",
    "validator": {
        "type": "stdout_equals",
        "expected_output": "25\n",
        "code_requirements": {
            "requires_function": True,
            "function_name": "square"
        }
    }
}
```

### 範例 3：要求使用 if 語句

```python
{
    "id": "EX4-1",
    "title": "條件判斷",
    "exercise": "請使用 if 語句判斷數字是否為正數",
    "validator": {
        "type": "stdout_equals",
        "expected_output": "正數\n",
        "code_requirements": {
            "requires_if": True
        }
    }
}
```

### 範例 4：禁止硬編碼

```python
{
    "id": "EX3-5",
    "title": "使用循環處理多筆資料",
    "exercise": "請使用循環計算 1 到 10 的總和",
    "validator": {
        "type": "stdout_equals",
        "expected_output": "55\n",
        "code_requirements": {
            "requires_loop": True,
            "forbids_hardcode": True
        }
    }
}
```

## 使用課程生成器

使用 `web_tutor/generate_lesson.py` 生成課程時，系統會詢問是否需要檢查程式碼結構要求。按照提示操作即可。

## 技術細節

### 代碼分析器

系統使用 `web_tutor/code_analyzer.py` 模組進行程式碼分析：

- 使用 Python 的 `ast` 模組解析程式碼
- 遍歷 AST 節點來檢查程式碼結構
- 提供詳細的結構檢查和反饋

### 整合點

- `web_tutor/main.py` - Web API 端點整合
- `tutor.py` - 命令行版本整合
- `web_tutor/generate_lesson.py` - 課程生成器支援

## 未來擴展

可以考慮添加：

- 檢查變數命名規範
- 檢查程式碼複雜度
- 檢查是否使用了特定演算法
- 更詳細的程式碼風格檢查




