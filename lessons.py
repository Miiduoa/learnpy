# lessons.py

# This file contains the curriculum for the Python tutor.
# It is a list of dictionaries, where each dictionary represents a lesson.

# I will parse the full list provided by the user later.
# For now, starting with the first few fundamental lessons.

# The order is based on the user's list, read from bottom to top.

LESSONS = [
    {
        "id": "EX1-0",
        "title": "使用 print() 印出訊息",
        "explanation": """
在 Python 中，「函式」(function) 就像一個小工具，可以幫我們完成特定的任務。
`print()` 是您會學到的第一個，也是最有用的函式之一。

它的功能是將您指定的任何文字、數字或其他資料「印」在螢幕上。

若要印出文字，您需要將文字用一對英文的雙引號 `"` 或單引號 `'` 包起來。
這串被包起來的文字，我們稱之為「字串」(string)。

例如，要印出 "Hello, World!" 這段字串，您可以這樣寫：

print(\"Hello, World!\")
""",
        "exercise": "輪到您了！請寫一行程式碼，在螢幕上印出 **Hello, Python!**",
        "hint": "使用 print() 函式，並將 Hello, Python! 這段文字放在括號和引號中。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "Hello, Python!\n"
        }
    },
    {
        "id": "PT1-0",
        "title": "印出多行訊息",
        "explanation": """
您可以連續使用好幾個 `print()` 函式，來印出多行訊息。
程式會由上到下，一次執行一行。

例如：
print(\"第一行\")
print(\"第二行\")

這樣就會在螢幕上看到：
第一行
第二行
""",
        "exercise": "請撰寫程式，在螢幕上分兩行印出以下內容：\n第一行是：Hello, Gemini!\n第二行是：I'm learning Python.",
        "hint": "您需要使用兩個 print() 函式，每一行對應一個。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "Hello, Gemini!\nI'm learning Python.\n"
        }
    },
    {
        "id": "EX1-1",
        "title": "數字與基本運算",
        "explanation": """
`print()` 不僅可以印出文字，也可以印出數字。
印出數字時，不需要加引號。

例如：`print(123)`

您也可以讓 `print()` 直接計算數學式子的結果，然後印出來。
Python 的基本數學運算子 (operators) 跟您在學校學的一樣：
`+` (加)
`-` (減)
`*` (乘)
`/` (除)

例如，要計算 10 + 5 並印出結果：
print(10 + 5)
螢幕上就會顯示 15。
""",
        "exercise": "請寫一行程式碼，計算 123 乘以 456，並將結果印出來。",
        "hint": "乘法是使用 `*` 符號。不需要用引號將數字包起來。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "56088\n"
        }
    },
    {
        "id": "PT1-1",
        "title": "計算並印出多個結果",
        "explanation": """
結合您所學的，我們可以計算多個數學式，並將它們的結果分別印在不同行。

例如，計算 100-1 跟 100-2：
print(100 - 1)
print(100 - 2)

螢幕輸出：
99
98
""",
        "exercise": "請寫兩行程式碼，分別計算並印出以下兩個問題的答案：\n1. 9876 和 1234 的「乘積」(product) 是多少？\n2. 9876 和 1234 的「差」(difference) 是多少？",
        "hint": "您需要寫兩個 `print()`。第一個裡面是 `9876 * 1234`，第二個是 `9876 - 1234`。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "12192744\n8642\n"
        }
    },
    # More lessons will be added here based on the user's list.
]
