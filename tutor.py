# tutor.py

import os
import sys
import subprocess
from io import StringIO

# Import code analyzer for intelligent validation
try:
    from web_tutor.code_analyzer import analyze_code
except ImportError:
    # Fallback for direct import
    import sys
    from pathlib import Path
    analyzer_path = Path(__file__).parent / "web_tutor" / "code_analyzer.py"
    if analyzer_path.exists():
        import importlib.util
        spec = importlib.util.spec_from_file_location("code_analyzer", analyzer_path)
        analyzer_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(analyzer_module)
        analyze_code = analyzer_module.analyze_code
    else:
        analyze_code = None

# We will import the lessons from a separate file
# 優先使用 web_tutor/lessons.py（最完整的課程列表）
try:
    # 先嘗試從 web_tutor 目錄導入（最完整）
    import sys
    from pathlib import Path
    web_lessons_path = Path(__file__).parent / "web_tutor" / "lessons.py"
    if web_lessons_path.exists():
        import importlib.util
        spec = importlib.util.spec_from_file_location("web_lessons", web_lessons_path)
        web_lessons_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(web_lessons_module)
        LESSONS = web_lessons_module.LESSONS
        print(f"✓ 已載入 {len(LESSONS)} 個課程（來自 web_tutor/lessons.py）")
    else:
        # 回退到根目錄的 lessons.py
        from lessons import LESSONS
        print(f"✓ 已載入 {len(LESSONS)} 個課程（來自 lessons.py）")
except ImportError:
    print("錯誤：找不到課程檔案或檔案中未定義 LESSONS。")
    LESSONS = []
except Exception as e:
    print(f"錯誤：載入課程時發生問題：{e}")
    LESSONS = []

# Keep track of user's progress
# In a real application, you'd save/load this from a file.
progress = {
    "current_lesson": 0
}

def clear_screen():
    """Clears the console screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def run_code(code_string):
    """
    Executes a string of Python code and captures its stdout, stderr, and any exceptions.
    Returns a dictionary with 'stdout', 'stderr', and 'error'.
    """
    old_stdout = sys.stdout
    redirected_output = sys.stdout = StringIO()
    error_output = StringIO()
    
    try:
        # Using a restricted globals dict for some safety
        exec(code_string, {'__builtins__': __builtins__})
    except Exception as e:
        error_output.write(str(e))
    finally:
        sys.stdout = old_stdout

    return {
        "stdout": redirected_output.getvalue(),
        "stderr": error_output.getvalue()
    }

def validate_answer(lesson, user_code):
    """
    Validates the user's code against the lesson's validator.
    """
    validator = lesson.get('validator')
    if not validator:
        return True, "這個單元沒有自動驗證。"

    result = run_code(user_code)
    
    # Check for runtime errors first
    if result['stderr']:
        return False, f"您的程式碼產生了錯誤：\n{result['stderr']}"

    # Check code structure requirements first (if any)
    structure_passed = True
    structure_feedback = []
    code_requirements = validator.get("code_requirements", {})
    
    if code_requirements and analyze_code:
        structure_passed, structure_feedback, code_summary = analyze_code(
            user_code, 
            code_requirements
        )
    
    # Check validation type
    validator_type = validator.get('type', 'no_error')
    output_passed = False
    output_message = ""
    
    if validator_type == 'stdout_equals':
        expected = validator['expected_output']
        actual = result['stdout']
        if expected.strip() == actual.strip():
            output_passed = True
            output_message = "做得好！輸出結果完全正確！"
        else:
            output_passed = False
            output_message = f"輸出結果不符。\n預期輸出：\n---\n{expected}\n---\n您的輸出：\n---\n{actual}\n---"
    elif validator_type == 'stdout_contains':
        expected = validator['expected_output']
        actual = result['stdout']
        if expected in actual:
            output_passed = True
            output_message = "輸出包含預期的內容！"
        else:
            output_passed = False
            output_message = f"輸出未包含預期內容。\n預期包含：\n---\n{expected}\n---\n您的輸出：\n---\n{actual}\n---"
    elif validator_type == 'stdout_ends_with':
        expected = validator['expected_output']
        actual = result['stdout']
        if actual.endswith(expected):
            output_passed = True
            output_message = "輸出結尾符合題目要求！"
        else:
            output_passed = False
            output_message = f"輸出結尾不符。\n預期結尾：\n---\n{expected}\n---\n您的輸出結尾：\n---\n{actual[-len(expected)-20:] if len(actual) > len(expected) else actual}\n---"
    elif validator_type == 'stdout_starts_with':
        expected = validator['expected_output']
        actual = result['stdout']
        if actual.startswith(expected):
            output_passed = True
            output_message = "輸出開頭符合題目要求！"
        else:
            output_passed = False
            output_message = f"輸出開頭不符。\n預期開頭：\n---\n{expected}\n---\n您的輸出開頭：\n---\n{actual[:len(expected)+20]}\n---"
    elif validator_type == 'no_error':
        output_passed = True
        output_message = "程式執行成功，沒有錯誤。"
    else:
        output_passed = True
        output_message = "程式執行成功，沒有錯誤。"
    
    # Combine structure and output checks
    is_correct = structure_passed and output_passed
    
    # Build comprehensive message
    if output_passed and structure_passed:
        return True, f"🎉 恭喜！{output_message}"
    elif output_passed and not structure_passed:
        message_parts = ["⚠️ 輸出結果正確，但程式寫法不符合題目要求：\n"]
        message_parts.extend(structure_feedback)
        message_parts.append("\n💡 請修改程式碼以符合題目的要求。")
        return False, "\n".join(message_parts)
    elif not output_passed and structure_passed:
        message_parts = [output_message]
        if structure_feedback:
            message_parts.append("\n📝 程式結構檢查通過。")
        return False, "\n".join(message_parts)
    else:
        message_parts = ["❌ 程式需要改進：\n"]
        message_parts.append("輸出問題：")
        message_parts.append(output_message)
        message_parts.append("\n程式結構問題：")
        message_parts.extend(structure_feedback)
        return False, "\n".join(message_parts)


def run_lesson(lesson):
    """Presents a single lesson to the user and gets their answer."""
    while True:
        clear_screen()
        print(f"========== 單元：{lesson['id']} ==========")
        print(f"主題：{lesson['title']}\n")
        
        print("--- 說明 ---")
        print(lesson['explanation'].strip())
        print("-" * 20)
        
        print("\n--- 練習 ---")
        print(lesson['exercise'].strip())
        print("-" * 20)

        print("\n請在下面輸入您的程式碼。完成後，單獨按一次 Enter 鍵即可提交。")
        print("您可以輸入多行程式碼。\n")

        user_code_lines = []
        while True:
            try:
                line = input()
                if not line: # Stop on the first empty line after some code
                    if user_code_lines:
                        break
                    else: # Allow empty lines at the beginning
                        user_code_lines.append(line)
                else:
                    user_code_lines.append(line)
            except EOFError:
                break
        
        user_code = "\n".join(user_code_lines)
        
        if not user_code.strip():
            print("您沒有輸入任何程式碼。")
            input("按 Enter 鍵重試...")
            continue

        print("\n--- 您的程式碼 ---")
        print(user_code)
        print("-" * 20)
        
        print("\n正在驗證您的答案...")
        is_correct, message = validate_answer(lesson, user_code)
        
        print(message)
        
        if is_correct:
            print("\n🎉 恭喜！您通過了這個單元！ 🎉")
            input("\n按 Enter 鍵繼續下一個單元...")
            return True
        else:
            print("\n🤔 答案不太對喔。再試一次吧！")
            hint = lesson.get('hint', '請仔細閱讀說明和錯誤訊息。')
            print(f"提示：{hint}")
            if input("輸入 's' 跳過此單元，或按 Enter 鍵重試：").lower() == 's':
                return False # User chose to skip

def main():
    """Main function to run the Python tutor."""
    global progress
    
    clear_screen()
    print("======================================")
    print("  歡迎來到互動式 Python 教學系統！")
    print("======================================")
    print("\n本系統將帶您一步步完成程式設計練習。")
    print("請依照每個單元的說明和練習進行作答。")
    input("\n準備好了嗎？按 Enter 鍵開始學習！")

    while progress["current_lesson"] < len(LESSONS):
        lesson_index = progress["current_lesson"]
        current_lesson = LESSONS[lesson_index]
        
        run_lesson(current_lesson)
        
        # Move to the next lesson
        progress["current_lesson"] += 1
        
    print("太棒了！您已經完成了所有目前的課程！")
    print("請期待我們新增更多課程。\n")


if __name__ == "__main__":
    if not LESSONS:
        print("課程內容為空，無法啟動教學系統。\n")
    else:
        main()
