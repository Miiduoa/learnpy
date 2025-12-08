#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
改進的題目要求與預期輸出匹配驗證
更智能地檢查練習題和預期輸出是否匹配
"""

import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "web_tutor"))
from lessons import LESSONS


def extract_numbers_from_text(text):
    """從文字中提取數字"""
    numbers = re.findall(r'\d+\.?\d*', text)
    return [float(n) if '.' in n else int(n) for n in numbers]


def check_exercise_output_match():
    """檢查練習題和預期輸出是否匹配"""
    issues = []
    
    for i, lesson in enumerate(LESSONS, 1):
        lesson_id = lesson.get('id', f'課程{i}')
        exercise = lesson.get('exercise', '')
        explanation = lesson.get('explanation', '')
        
        if 'validator' not in lesson:
            continue
        
        validator = lesson['validator']
        validator_type = validator.get('type', '')
        
        if 'expected_output' not in validator:
            if validator_type in ['stdout_equals', 'stdout_contains', 'stdout_ends_with', 'stdout_starts_with']:
                issues.append({
                    'type': 'error',
                    'lesson_id': lesson_id,
                    'message': f'驗證器類型為 {validator_type} 但缺少 expected_output'
                })
            continue
        
        expected_output = validator['expected_output']
        
        # 檢查 stdout_equals 的情況
        if validator_type == 'stdout_equals':
            issues.extend(check_stdout_equals_match_improved(lesson_id, exercise, explanation, expected_output))
    
    return issues


def check_stdout_equals_match_improved(lesson_id, exercise, explanation, expected_output):
    """改進的 stdout_equals 匹配檢查"""
    issues = []
    
    expected_clean = expected_output.strip()
    expected_lines = expected_clean.split('\n')
    
    # 1. 檢查計算結果
    # 乘法
    calc_patterns = re.findall(r'計算\s+(\d+)\s*[×*xX]\s*(\d+)', exercise)
    calc_patterns += re.findall(r'(\d+)\s*[×*xX]\s*(\d+)', exercise)
    
    for num1, num2 in calc_patterns:
        try:
            result = int(num1) * int(num2)
            expected_numbers = extract_numbers_from_text(expected_output)
            if expected_numbers:
                # 檢查結果是否在輸出中
                found = any(abs(n - result) < 0.01 for n in expected_numbers)
                if not found:
                    # 檢查是否可能是其他計算（例如累加）
                    # 如果是累加題目，不應該檢查乘法結果
                    if '累加' not in exercise and '總和' not in exercise and 'sum' not in exercise.lower():
                        issues.append({
                            'type': 'error',
                            'lesson_id': lesson_id,
                            'message': f'練習題提到計算 {num1} × {num2} = {result}，但 expected_output 中沒有找到此結果'
                        })
        except ValueError:
            pass
    
    # 2. 檢查加法（只在明確要求加法時）
    if '相加' in exercise or '加法' in exercise or '加起來' in exercise:
        add_patterns = re.findall(r'(\d+)\s*\+\s*(\d+)', exercise)
        for num1, num2 in add_patterns:
            try:
                result = int(num1) + int(num2)
                expected_numbers = extract_numbers_from_text(expected_output)
                if expected_numbers and result not in expected_numbers:
                    found = any(abs(n - result) < 0.01 for n in expected_numbers)
                    if not found:
                        issues.append({
                            'type': 'error',
                            'lesson_id': lesson_id,
                            'message': f'練習題要求計算 {num1} + {num2} = {result}，但 expected_output 中沒有找到'
                        })
            except ValueError:
                pass
    
    # 3. 檢查除法（商和餘數）
    if '商' in exercise and '餘數' in exercise:
        div_patterns = re.findall(r'(\d+)\s*[÷/]\s*(\d+)', exercise)
        for num1, num2 in div_patterns:
            try:
                quotient = int(num1) // int(num2)
                remainder = int(num1) % int(num2)
                expected_numbers = extract_numbers_from_text(expected_output)
                if expected_numbers:
                    has_quotient = any(abs(n - quotient) < 0.01 for n in expected_numbers)
                    has_remainder = any(abs(n - remainder) < 0.01 for n in expected_numbers)
                    if not has_quotient and not has_remainder:
                        issues.append({
                            'type': 'error',
                            'lesson_id': lesson_id,
                            'message': f'練習題要求計算 {num1} ÷ {num2} 的商({quotient})和餘數({remainder})，但 expected_output 中沒有找到'
                        })
            except ValueError:
                pass
    
    # 4. 檢查是否提到要印出特定文字（引號內的）
    # 只檢查明確用引號標記的文字
    quoted_texts = re.findall(r'["""]([^"""]+)["""]', exercise)
    quoted_texts += re.findall(r"[''']([^''']+)[''']", exercise)
    
    for text in quoted_texts:
        text_clean = text.strip()
        if len(text_clean) > 2:  # 只檢查長度大於2的文字
            if text_clean not in expected_clean and text_clean.lower() not in expected_clean.lower():
                # 檢查是否可能是格式化的輸出（例如 "Hello, Python!" 輸出為 Hello, Python!）
                text_no_quotes = text_clean.replace('"', '').replace("'", '')
                if text_no_quotes not in expected_clean:
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求印出 "{text_clean}"，但 expected_output 中沒有找到（可能是格式化輸出）'
                    })
    
    # 5. 檢查是否提到要印出多行
    if '兩行' in exercise or '多行' in exercise or '分兩行' in exercise or '分別在兩行' in exercise:
        line_count = expected_output.count('\n')
        if line_count < 1:
            issues.append({
                'type': 'error',
                'lesson_id': lesson_id,
                'message': '練習題要求印出多行，但 expected_output 只有一行或沒有換行'
            })
    
    # 6. 檢查運算式字串（例如 1+2+3+4+5）
    if '運算式' in exercise or '算式' in exercise:
        # 提取運算式模式
        expr_patterns = re.findall(r'(\d+(?:\+\d+)+)', exercise)
        for expr in expr_patterns:
            # 檢查 expected_output 是否包含這個運算式
            if expr not in expected_clean:
                # 檢查是否可能是換行或其他格式
                expr_clean = expr.replace(' ', '')
                expected_no_spaces = expected_clean.replace(' ', '').replace('\n', '')
                if expr_clean not in expected_no_spaces:
                    issues.append({
                        'type': 'error',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求印出運算式 "{expr}"，但 expected_output 中沒有找到'
                    })
    
    # 7. 檢查變數交換
    if '交換' in exercise and ('變數' in exercise or '值' in exercise):
        # 提取初始值
        init_values = re.findall(r'(\w+)\s*=\s*(\d+)', exercise)
        if len(init_values) >= 2:
            # 檢查 expected_output 是否包含交換後的值
            # 這需要更複雜的邏輯，暫時跳過
            pass
    
    # 8. 檢查條件判斷的結果
    # 如果練習題提到特定條件，檢查 expected_output 是否合理
    if '如果' in exercise or '當' in exercise:
        # 提取條件中的數值
        conditions = re.findall(r'(\d+)', exercise)
        expected_numbers = extract_numbers_from_text(expected_output)
        # 這需要更複雜的邏輯來判斷，暫時跳過
        pass
    
    return issues


def main():
    """主函數"""
    print("=" * 60)
    print("改進的題目要求與預期輸出匹配驗證")
    print("=" * 60)
    
    all_issues = []
    
    # 檢查練習題和預期輸出的匹配
    print("\n檢查練習題與預期輸出是否匹配...")
    issues = check_exercise_output_match()
    all_issues.extend(issues)
    print(f"發現 {len(issues)} 個問題")
    
    # 打印結果
    print("\n" + "=" * 60)
    print("詳細結果")
    print("=" * 60)
    
    errors = [i for i in all_issues if i['type'] == 'error']
    warnings = [i for i in all_issues if i['type'] == 'warning']
    
    if errors:
        print(f"\n❌ 錯誤 ({len(errors)} 個):")
        for issue in errors:
            print(f"  [{issue['lesson_id']}] {issue['message']}")
    
    if warnings:
        print(f"\n⚠️  警告 ({len(warnings)} 個):")
        for issue in warnings[:20]:
            print(f"  [{issue['lesson_id']}] {issue['message']}")
        if len(warnings) > 20:
            print(f"  ... 還有 {len(warnings) - 20} 個警告")
    
    if not all_issues:
        print("\n✅ 沒有發現問題！所有題目要求與預期輸出都匹配。")
    
    print("\n" + "=" * 60)
    print(f"總計: {len(all_issues)} 個問題")
    print(f"  - 錯誤: {len(errors)} 個")
    print(f"  - 警告: {len(warnings)} 個")
    print("=" * 60)
    
    return 0 if len(errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

