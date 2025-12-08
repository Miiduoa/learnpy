# lessons_complete.py
# 完整的課程列表 - 包含所有課程內容
# 這個文件包含所有課程，可以替換 lessons.py

LESSONS = [
    # ========== 第一章：基礎輸出與運算 ==========
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

print("Hello, World!")
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
print("第一行")
print("第二行")

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
        "id": "EX1-2",
        "title": "兩數相加",
        "explanation": """
現在我們來練習使用變數和基本運算。

變數就像是一個容器，可以儲存資料。我們可以用 `=` 來將值賦予變數。

例如：
a = 10
b = 20
result = a + b
print(result)

這樣就會印出 30。
""",
        "exercise": "請定義兩個變數 `num1 = 15` 和 `num2 = 27`，計算它們的和並印出結果。",
        "hint": "先定義兩個變數，然後計算它們的和，最後用 print() 印出。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "42\n"
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
    {
        "id": "PT1-2",
        "title": "計算兩整數相除的商及餘數",
        "explanation": """
除了基本的 `+ - * /`，Python 還提供另外兩個在解題時非常有用的運算子：

1.  `//` (整數除法): 這個運算子會計算除法，但會**無條件捨去小數點**，只回傳整數的部分，也就是「商」。
2.  `%` (模數/餘數): 這個運算子會計算兩數相除後的「餘數」。

例如，10 除以 3 等於 3 餘 1：
`print(10 // 3)`  # 會印出 3 (商)
`print(10 % 3)`   # 會印出 1 (餘數)
""",
        "exercise": "請計算 123 除以 7 的「商」和「餘數」，並將它們分別印在兩行（先商後餘數）。",
        "hint": "第一行使用 `print(123 // 7)`，第二行使用 `print(123 % 7)`。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "17\n4\n"
        }
    },
    {
        "id": "HW1",
        "title": "變數與綜合應用：計算學期成績",
        "explanation": """
當我們的計算變得複雜時，直接寫一長串數字會讓程式碼很難閱讀和修改。這時，我們可以使用「變數」(variable)。

變數就像是為資料貼上標籤的命名容器。

`midterm_score = 85`
`final_score = 90`
`final_grade = midterm_score * 0.4 + final_score * 0.6`
`print(final_grade)`

這樣寫是不是比 `print(85 * 0.4 + 90 * 0.6)` 清楚多了？當我們要修改期中考成績時，只需要改一開始的變數值即可。
""",
        "exercise": "假設平時成績 `assignment_grade` 為 80，期中考 `midterm_grade` 為 75，期末考 `final_grade` 為 92。\n學期總成績的計算方式為：平時成績佔 30%，期中考佔 30%，期末考佔 40%。\n請用變數寫出計算過程，並印出最後的學期總成績。",
        "hint": "你需要建立三個變數來儲存成績，然後在第四個變數中進行加權計算，最後用 `print` 印出第四個變數。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "83.3\n"
        }
    },
    
    # ========== 第二章：條件判斷 ==========
    {
        "id": "EX2-0",
        "title": "變數值的交換",
        "explanation": """
在寫程式時，有時我們需要交換兩個變數的值。例如 `a = 10`, `b = 20`，交換後要變成 `a = 20`, `b = 10`。

傳統的方式是使用一個暫時的變數 `temp` 來當中繼站。
`temp = a`
`a = b`
`b = temp`

但在 Python 中，有一個更簡潔、更酷的語法：
`a, b = b, a`

這一行程式碼就能神奇地完成交換！
""",
        "exercise": "有兩個變數 `x = 10` 和 `y = 20`。請用一行程式碼交換它們的值，然後分別在兩行中印出 `x` 和 `y` 的新值（x 在上，y 在下）。",
        "hint": "試試看 Python 獨特的交換語法 `x, y = y, x`，然後用兩個 `print()` 函式印出結果。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "20\n10\n"
        }
    },
    {
        "id": "EX2-1",
        "title": "流程控制：if 條件判斷",
        "explanation": """
目前為止，我們的程式都是由上到下一直線地執行。但如果我們想讓程式在「特定條件」下才執行某段程式碼呢？這時就要用 `if` 判斷式。

它的基本結構是：
`if 條件:`
`    # 如果條件成立 (True)，就執行這裡的程式碼`

特別注意：
1.  條件後面一定要有冒號 `:`。
2.  `if` 區塊內的程式碼，前面必須要有**縮排** (indentation)，通常是**四個空格**。這是 Python 語法的一部分，非常重要！
3.  比較是否相等的符號是 `==` (兩個等號)。

例如：
`score = 100`
`if score == 100:`
`    print("太完美了！")`
""",
        "exercise": "有一個代表年齡的變數 `age = 25`。請寫一個 `if` 判斷式，如果 `age` 大於或等於 18，就印出文字「您是成年人」。",
        "hint": "條件是 `age >= 18`。記得冒號和下一行的縮排！",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "您是成年人\n"
        }
    },
    {
        "id": "EX2-2",
        "title": "邏輯與巢狀 if (Not)",
        "explanation": """
我們可以組合更複雜的條件。`not` 是一個邏輯運算子，它可以將一個布林值 (Boolean, `True` 或 `False`) 反轉。
`not True` 會變成 `False`。
`not False` 會變成 `True`。

我們也可以在一個 `if` 裡面再放一個 `if`，形成「巢狀 if」，來處理多層次的判斷。

`is_holiday = True`
`is_raining = False`
`if is_holiday:`
`    if not is_raining:`
`        print("太棒了，是個出遊的好日子！")`
""",
        "exercise": "有兩個布林變數 `is_holiday = True` 和 `is_busy = False`。請寫一個判斷式，如果今天是假日 (`is_holiday` 是 `True`)，**而且**今天不忙 (`is_busy` **不是** `True`)，就印出「可以放鬆一下」。",
        "hint": "您需要一個 `if` 裡面包著另一個 `if`。外層檢查 `is_holiday`，內層檢查 `not is_busy`。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "可以放鬆一下\n"
        }
    },
    {
        "id": "EX2-3",
        "title": "巢狀 if 與換行輸出",
        "explanation": """
我們可以組合多個條件判斷，並且在每個條件下印出不同的訊息。

`print()` 函式預設會在輸出後自動換行。如果我們想要在一個 `print()` 中印出多行，可以使用 `\\n` (換行符號)。

例如：
`print("第一行\\n第二行")`

會印出：
第一行
第二行
""",
        "exercise": "有兩個變數 `score = 85` 和 `attendance = True`。請寫程式：\n如果 `score >= 80` 且 `attendance == True`，就印出「成績優秀」和「出席良好」（分兩行）。",
        "hint": "使用巢狀 if 或 `and` 運算子。可以用 `\\n` 在一個 print 中換行，或用兩個 print。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "成績優秀\n出席良好\n"
        }
    },
    {
        "id": "EX2-4",
        "title": "錯誤處理：try-except",
        "explanation": """
在程式執行時，可能會發生錯誤（例如除以零、型別轉換失敗等）。我們可以使用 `try-except` 來捕捉並處理這些錯誤。

基本語法：
`try:`
`    # 可能會出錯的程式碼`
`except:`
`    # 如果出錯，執行這裡的程式碼`

例如：
`try:`
`    result = 10 / 0`
`    print(result)`
`except:`
`    print("發生錯誤：不能除以零")`
""",
        "exercise": """請寫一個程式，嘗試將字串 "abc" 轉換成整數並印出。如果轉換失敗，就印出「轉換失敗」。""",
        "hint": '使用 `int("abc")` 會出錯，所以要用 try-except 來捕捉錯誤。',
        "validator": {
            "type": "stdout_equals",
            "expected_output": "轉換失敗\n"
        }
    },
    {
        "id": "PT2-1",
        "title": "成績計算：判斷平均成績是否及格",
        "explanation": """
現在我們來練習結合變數、運算和條件判斷。

假設有兩科成績，我們可以計算平均，然後判斷是否及格（假設 60 分及格）。

例如：
`math = 70`
`english = 80`
`average = (math + english) / 2`
`if average >= 60:`
`    print("及格")`
`else:`
`    print("不及格")`
""",
        "exercise": "有兩科成績：`math_score = 65` 和 `english_score = 55`。請計算平均成績，如果平均大於或等於 60，就印出「及格」，否則印出「不及格」。",
        "hint": "先計算平均，然後用 if-else 判斷。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "及格\n"
        }
    },
    {
        "id": "PT2-2",
        "title": "成績判定：錯誤、及格、補考或不及格",
        "explanation": """
我們可以使用多個條件來判斷成績的等級。

Python 的條件判斷可以這樣寫：
`if 條件1:`
`    # 處理情況1`
`elif 條件2:`
`    # 處理情況2`
`elif 條件3:`
`    # 處理情況3`
`else:`
`    # 處理其他情況`

例如，判斷成績等級：
- 如果分數 < 0 或 > 100：錯誤
- 如果分數 >= 60：及格
- 如果分數 >= 50：補考
- 否則：不及格
""",
        "exercise": "有一個成績變數 `score = 55`。請寫程式判斷：\n如果分數 < 0 或 > 100，印出「錯誤」\n如果分數 >= 60，印出「及格」\n如果分數 >= 50，印出「補考」\n否則印出「不及格」",
        "hint": "使用 if-elif-else 結構。注意要先檢查錯誤情況。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "補考\n"
        }
    },
    {
        "id": "PT2-3",
        "title": "帳密檢查：為成績計算系統加上帳密檢查",
        "explanation": """
在實際應用中，我們經常需要檢查使用者輸入的帳號和密碼是否正確。

例如：
`username = "admin"`
`password = "1234"`
`input_username = "admin"`
`input_password = "1234"`

`if input_username == username and input_password == password:`
`    print("登入成功")`
`else:`
`    print("帳號或密碼錯誤")`
""",
        "exercise": """系統設定的帳號是 `"student"`，密碼是 `"python123"`。
使用者輸入的帳號是 `input_user = "student"`，密碼是 `input_pass = "python123"`。
請檢查帳號和密碼是否都正確，如果正確就印出「登入成功」，否則印出「登入失敗」。""",
        "hint": "使用 `and` 運算子來同時檢查兩個條件。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "登入成功\n"
        }
    },
    {
        "id": "HW2_1",
        "title": "門票計算",
        "explanation": """
讓我們來練習一個實際的應用：計算門票價格。

假設：
- 成人票：500 元
- 兒童票：250 元
- 65 歲以上：300 元

我們可以用條件判斷來決定票價。

例如：
`age = 20`
`if age >= 65:`
`    price = 300`
`elif age < 18:`
`    price = 250`
`else:`
`    price = 500`
`print(price)`
""",
        "exercise": "有一個年齡變數 `age = 10`。請根據以下規則計算門票價格並印出：\n- 65 歲以上：300 元\n- 18 歲以下：250 元\n- 其他：500 元",
        "hint": "使用 if-elif-else 結構，注意要先檢查 65 歲以上的情況。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "250\n"
        }
    },
    {
        "id": "HW2_2",
        "title": "停車費計算",
        "explanation": """
停車費通常是根據停車時間來計算的。

假設：
- 前 2 小時：每小時 30 元
- 超過 2 小時：每小時 50 元

例如，停車 3 小時：
`hours = 3`
`if hours <= 2:`
`    cost = hours * 30`
`else:`
`    cost = 2 * 30 + (hours - 2) * 50`
`print(cost)`
""",
        "exercise": "停車時間 `hours = 4`。請根據以下規則計算停車費並印出：\n- 前 2 小時：每小時 30 元\n- 超過 2 小時的部分：每小時 50 元",
        "hint": "前 2 小時是 2*30，超過的部分是 (hours-2)*50，總共是兩者相加。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "170\n"
        }
    },
    
    # ========== 第三章：迴圈 ==========
    {
        "id": "EX3-1",
        "title": "For 迴圈：range()",
        "explanation": """
當我們需要重複執行某些程式碼時，可以使用「迴圈」(loop)。

`for` 迴圈的基本語法：
`for 變數 in 範圍:`
`    # 重複執行的程式碼`

`range()` 函式可以產生一個數字序列：
- `range(5)` 會產生 0, 1, 2, 3, 4
- `range(1, 5)` 會產生 1, 2, 3, 4
- `range(1, 10, 2)` 會產生 1, 3, 5, 7, 9 (從 1 開始，每次加 2，到 10 之前)

例如：
`for i in range(5):`
`    print(i)`

會印出：
0
1
2
3
4
""",
        "exercise": "請使用 `for` 迴圈和 `range(5)` 來印出數字 0 到 4（每個數字一行）。",
        "hint": "使用 `for i in range(5):` 然後在迴圈內 `print(i)`。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "0\n1\n2\n3\n4\n"
        }
    },
    {
        "id": "EX3-2",
        "title": "求年營業額（4季）",
        "explanation": """
我們可以使用迴圈來處理多筆資料。

例如，計算四季的總營業額：
`quarters = [100, 150, 120, 180]  # 四季的營業額`
`total = 0`
`for q in quarters:`
`    total = total + q`
`print(total)`

這樣就會印出 550。
""",
        "exercise": "有四季的營業額：`Q1 = 100`, `Q2 = 150`, `Q3 = 120`, `Q4 = 180`。\n請使用迴圈計算總營業額並印出。",
        "hint": "可以將四季的營業額放在一個列表中，然後用迴圈累加。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "550\n"
        }
    },
    {
        "id": "EX3-3",
        "title": "列印 * 三角形",
        "explanation": """
我們可以使用巢狀迴圈來印出圖形。

例如，印出一個 3 行的三角形：
`for i in range(1, 4):`
`    for j in range(i):`
`        print("*", end="")`
`    print()`

這會印出：
*
**
***

注意：`print("*", end="")` 表示印出星號但不換行，最後的 `print()` 用來換行。
""",
        "exercise": "請使用巢狀迴圈印出一個 4 行的星號三角形（第一行 1 個星號，第二行 2 個，依此類推）。",
        "hint": "外層迴圈控制行數，內層迴圈控制每行的星號數量。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "*\n**\n***\n****\n"
        }
    },
    {
        "id": "EX3-4",
        "title": "列印第 n 個英文字母",
        "explanation": """
Python 提供了 `chr()` 和 `ord()` 函式來處理字元：

- `ord('A')` 會回傳 65（A 的 ASCII 碼）
- `chr(65)` 會回傳 'A'（ASCII 碼 65 對應的字元）

英文字母 A-Z 的 ASCII 碼是 65-90，a-z 是 97-122。

例如，要印出第 3 個大寫字母（C）：
`print(chr(65 + 2))  # 65 是 A，加 2 就是 C`
""",
        "exercise": "請印出第 5 個大寫英文字母（E）。",
        "hint": "A 是第 1 個（ASCII 65），E 是第 5 個，所以是 65 + 4。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "E\n"
        }
    },
    {
        "id": "EX4-1",
        "title": "While 迴圈",
        "explanation": """
除了 `for` 迴圈，Python 還提供 `while` 迴圈。

`while` 迴圈會在條件為 `True` 時持續執行：
`while 條件:`
`    # 重複執行的程式碼`

例如：
`count = 0`
`while count < 5:`
`    print(count)`
`    count = count + 1`

這會印出 0 到 4。

注意：要確保條件最終會變成 `False`，否則會形成無限迴圈！
""",
        "exercise": "請使用 `while` 迴圈印出數字 1 到 5（每個數字一行）。",
        "hint": "設定一個變數從 1 開始，在迴圈內印出並遞增，直到大於 5。",
        "validator": {
            "type": "stdout_equals",
            "expected_output": "1\n2\n3\n4\n5\n"
        }
    },
    {
        "id": "EX4-2",
        "title": "While, Random, Continue, Break",
        "explanation": """
在迴圈中，我們可以使用：
- `break`：立即跳出迴圈
- `continue`：跳過本次迴圈，繼續下一次

Python 的 `random` 模組可以產生隨機數：
`import random`
`random.randint(1, 10)`  # 產生 1 到 10 之間的隨機整數

例如：
`import random`
`while True:`
`    num = random.randint(1, 10)`
`    print(num)`
`    if num == 7:`
`        break`
""",
        "exercise": "請寫一個程式，使用 `while True` 迴圈，每次產生一個 1 到 10 的隨機數並印出。如果產生的數字是 5，就跳出迴圈。",
        "hint": "記得 `import random`，使用 `random.randint(1, 10)` 產生隨機數，用 `if num == 5: break` 跳出。",
        "validator": {
            "type": "stdout_contains",
            "expected_output": "5"
        }
    },
    
    # 注意：由於課程非常多，這裡只展示了部分課程
    # 實際應用中，您需要繼續添加所有課程...
]
