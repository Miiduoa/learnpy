#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
課程生成腳本
這個腳本可以幫助您快速生成新的課程內容
"""

import json
from datetime import datetime

def generate_lesson_template():
    """生成一個新的課程模板"""
    print("=" * 60)
    print("Python 教學系統 - 課程生成器")
    print("=" * 60)
    print()
    
    # 收集課程資訊
    lesson_id = input("請輸入課程 ID (例如: EX12-0): ").strip()
    title = input("請輸入課程標題: ").strip()
    
    print("\n請輸入課程說明（輸入 END 結束）:")
    explanation_lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        explanation_lines.append(line)
    explanation = "\n".join(explanation_lines)
    
    print("\n請輸入練習題描述:")
    exercise = input().strip()
    
    print("\n請輸入提示:")
    hint = input().strip()
    
    print("\n請選擇驗證器類型:")
    print("1. stdout_equals - 完全匹配輸出")
    print("2. stdout_contains - 輸出包含特定文字")
    print("3. stdout_ends_with - 輸出以特定文字結尾")
    print("4. stdout_starts_with - 輸出以特定文字開頭")
    print("5. no_error - 只檢查是否有錯誤")
    print("6. 無驗證器")
    
    validator_choice = input("請選擇 (1-6): ").strip()
    
    validator = None
    if validator_choice == "1":
        print("\n請輸入預期輸出（輸入 END 結束）:")
        expected_lines = []
        while True:
            line = input()
            if line.strip() == "END":
                break
            expected_lines.append(line)
        expected_output = "\n".join(expected_lines)
        if expected_output and not expected_output.endswith("\n"):
            expected_output += "\n"
        validator = {
            "type": "stdout_equals",
            "expected_output": expected_output
        }
    elif validator_choice == "2":
        expected_output = input("請輸入預期包含的文字: ").strip()
        validator = {
            "type": "stdout_contains",
            "expected_output": expected_output
        }
    elif validator_choice == "3":
        expected_output = input("請輸入預期結尾的文字: ").strip()
        validator = {
            "type": "stdout_ends_with",
            "expected_output": expected_output
        }
    elif validator_choice == "4":
        expected_output = input("請輸入預期開頭的文字: ").strip()
        validator = {
            "type": "stdout_starts_with",
            "expected_output": expected_output
        }
    elif validator_choice == "5":
        validator = {
            "type": "no_error"
        }
    
    # Ask about code structure requirements
    if validator:
        print("\n是否需要檢查程式碼結構要求？(y/n): ", end="")
        needs_structure = input().strip().lower() == 'y'
        
        if needs_structure:
            code_requirements = {}
            
            print("\n--- 程式碼結構要求 ---")
            
            # Check for loop requirement
            print("是否需要使用循環？(y/n): ", end="")
            if input().strip().lower() == 'y':
                print("  1. for 循環")
                print("  2. while 循環")
                print("  3. 任意循環")
                loop_choice = input("  請選擇 (1-3): ").strip()
                if loop_choice == "1":
                    code_requirements["requires_loop"] = True
                    code_requirements["loop_type"] = "for"
                elif loop_choice == "2":
                    code_requirements["requires_loop"] = True
                    code_requirements["loop_type"] = "while"
                else:
                    code_requirements["requires_loop"] = True
            
            # Check for function requirement
            print("是否需要定義函數？(y/n): ", end="")
            if input().strip().lower() == 'y':
                code_requirements["requires_function"] = True
                function_name = input("  請輸入函數名稱（留空表示任意函數）: ").strip()
                if function_name:
                    code_requirements["function_name"] = function_name
            
            # Check for if statement requirement
            print("是否需要使用 if 語句？(y/n): ", end="")
            if input().strip().lower() == 'y':
                code_requirements["requires_if"] = True
            
            # Check for hardcode prohibition
            print("是否禁止硬編碼（要求使用循環等靈活方法）？(y/n): ", end="")
            if input().strip().lower() == 'y':
                code_requirements["forbids_hardcode"] = True
            
            # Check for required variables
            print("是否需要使用特定變數？(y/n): ", end="")
            if input().strip().lower() == 'y':
                vars_input = input("  請輸入變數名稱（用逗號分隔）: ").strip()
                if vars_input:
                    code_requirements["requires_variable"] = [v.strip() for v in vars_input.split(",")]
            
            # Check for loop count limits
            print("是否有循環數量限制？(y/n): ", end="")
            if input().strip().lower() == 'y':
                min_loops = input("  最少循環數（留空表示無限制）: ").strip()
                max_loops = input("  最多循環數（留空表示無限制）: ").strip()
                if min_loops:
                    code_requirements["min_loops"] = int(min_loops)
                if max_loops:
                    code_requirements["max_loops"] = int(max_loops)
            
            if code_requirements:
                validator["code_requirements"] = code_requirements
    
    # 生成課程字典
    lesson = {
        "id": lesson_id,
        "title": title,
        "explanation": explanation,
        "exercise": exercise,
        "hint": hint
    }
    
    if validator:
        lesson["validator"] = validator
    
    # 顯示生成的課程
    print("\n" + "=" * 60)
    print("生成的課程內容:")
    print("=" * 60)
    print(json.dumps(lesson, ensure_ascii=False, indent=4))
    print()
    
    # 詢問是否要儲存
    save = input("是否要將此課程加入 lessons.py? (y/n): ").strip().lower()
    if save == 'y':
        return lesson
    else:
        print("課程未儲存。")
        return None

def format_lesson_as_python(lesson):
    """將課程字典格式化為 Python 代碼"""
    lines = ["    {"]
    lines.append(f'        "id": "{lesson["id"]}",')
    lines.append(f'        "title": "{lesson["title"]}",')
    lines.append(f'        "explanation": """')
    # 處理多行說明
    for line in lesson["explanation"].split('\n'):
        lines.append(line)
    lines.append('""",')
    lines.append(f'        "exercise": "{lesson["exercise"]}",')
    lines.append(f'        "hint": "{lesson["hint"]}",')
    
    if "validator" in lesson:
        lines.append('        "validator": {')
        lines.append(f'            "type": "{lesson["validator"]["type"]}",')
        # 處理預期輸出（可能包含換行）
        if "expected_output" in lesson["validator"]:
            expected = lesson["validator"]["expected_output"]
            if '\n' in expected:
                lines.append('            "expected_output": """' + expected + '"""')
            else:
                lines.append(f'            "expected_output": "{expected}"')
        
        # 處理程式碼結構要求
        if "code_requirements" in lesson["validator"]:
            lines.append('            "code_requirements": {')
            req = lesson["validator"]["code_requirements"]
            req_lines = []
            for key, value in req.items():
                if isinstance(value, bool):
                    req_lines.append(f'                "{key}": {str(value).lower()},')
                elif isinstance(value, (int, float)):
                    req_lines.append(f'                "{key}": {value},')
                elif isinstance(value, str):
                    req_lines.append(f'                "{key}": "{value}",')
                elif isinstance(value, list):
                    req_lines.append(f'                "{key}": {value},')
            if req_lines:
                # Remove trailing comma from last line
                req_lines[-1] = req_lines[-1].rstrip(',')
            lines.extend(req_lines)
            lines.append("            }")
        
        lines.append("        }")
    
    lines.append("    }")
    return "\n".join(lines)

def add_lesson_to_file(lesson, filename="lessons.py"):
    """將課程添加到 lessons.py 文件"""
    try:
        # 讀取現有文件
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 找到最後一個 ] 的位置
        last_bracket = content.rfind(']')
        if last_bracket == -1:
            print("錯誤：找不到文件結尾")
            return False
        
        # 生成新的課程代碼
        lesson_code = format_lesson_as_python(lesson)
        
        # 在最後一個 ] 之前插入新課程
        # 檢查最後一個課程後面是否有逗號
        before_bracket = content[:last_bracket].rstrip()
        if not before_bracket.endswith(',') and not before_bracket.endswith('['):
            lesson_code = ",\n" + lesson_code
        
        new_content = content[:last_bracket] + lesson_code + "\n" + content[last_bracket:]
        
        # 寫回文件
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"\n✓ 課程已成功添加到 {filename}")
        return True
        
    except Exception as e:
        print(f"錯誤：{e}")
        import traceback
        traceback.print_exc()
        return False

def generate_python_code():
    """生成可以直接複製的 Python 代碼"""
    lesson = generate_lesson_template()
    if lesson:
        print("\n" + "=" * 60)
        print("Python 代碼（可直接複製到 lessons.py）:")
        print("=" * 60)
        print()
        print(format_lesson_as_python(lesson) + ",")
        print()

def main():
    """主函數"""
    while True:
        print("\n" + "=" * 60)
        print("請選擇操作:")
        print("1. 生成新課程")
        print("2. 生成並自動添加到 lessons.py")
        print("3. 退出")
        print("=" * 60)
        
        choice = input("請選擇 (1-3): ").strip()
        
        if choice == "1":
            generate_python_code()
        elif choice == "2":
            lesson = generate_lesson_template()
            if lesson:
                if add_lesson_to_file(lesson):
                    print("課程已成功添加！")
        elif choice == "3":
            print("再見！")
            break
        else:
            print("無效的選擇，請重試。")

if __name__ == "__main__":
    main()

