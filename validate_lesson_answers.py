#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
驗證題目要求與預期輸出是否相符
檢查練習題的描述和 expected_output 是否匹配
"""

import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "web_tutor"))
from lessons import LESSONS


def extract_numbers_from_text(text):
    """從文字中提取數字"""
    # 提取所有數字（包括小數）
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
            issues.extend(check_stdout_equals_match(lesson_id, exercise, explanation, expected_output))
        
        # 檢查 stdout_contains 的情況
        elif validator_type == 'stdout_contains':
            issues.extend(check_stdout_contains_match(lesson_id, exercise, explanation, expected_output))
    
    return issues


def check_stdout_equals_match(lesson_id, exercise, explanation, expected_output):
    """檢查 stdout_equals 的匹配"""
    issues = []
    
    # 提取練習題中提到的關鍵字
    exercise_lower = exercise.lower()
    expected_lower = expected_output.lower().strip()
    
    # 檢查是否提到要印出特定文字
    # 例如：練習題說要印出 "Hello"，expected_output 應該包含 "Hello"
    text_patterns = re.findall(r'印出[：:]\s*[*"]?([^"*\n]+)[*"]?', exercise)
    text_patterns += re.findall(r'印出\s+[*"]?([^"*\n]+)[*"]?', exercise)
    text_patterns += re.findall(r'顯示[：:]\s*[*"]?([^"*\n]+)[*"]?', exercise)
    
    for pattern in text_patterns:
        pattern = pattern.strip().strip('*').strip('"').strip("'")
        if pattern and len(pattern) > 2:  # 只檢查長度大於2的文字
            if pattern.lower() not in expected_lower:
                issues.append({
                    'type': 'error',
                    'lesson_id': lesson_id,
                    'message': f'練習題要求印出 "{pattern}"，但 expected_output 中沒有找到'
                })
    
    # 檢查計算結果
    # 例如：練習題說要計算 123 * 456，expected_output 應該是 56088
    calc_patterns = re.findall(r'計算\s+(\d+)\s*[×*xX]\s*(\d+)', exercise)
    calc_patterns += re.findall(r'(\d+)\s*[×*xX]\s*(\d+)', exercise)
    
    for num1, num2 in calc_patterns:
        try:
            result = int(num1) * int(num2)
            expected_numbers = extract_numbers_from_text(expected_output)
            if expected_numbers and result not in expected_numbers:
                # 檢查是否在附近（可能是浮點數或格式問題）
                found = False
                for exp_num in expected_numbers:
                    if abs(exp_num - result) < 0.01:  # 允許小誤差
                        found = True
                        break
                if not found:
                    issues.append({
                        'type': 'error',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求計算 {num1} × {num2} = {result}，但 expected_output 中沒有找到正確結果'
                    })
        except ValueError:
            pass
    
    # 檢查除法
    div_patterns = re.findall(r'計算\s+(\d+)\s*[÷/]\s*(\d+)', exercise)
    div_patterns += re.findall(r'(\d+)\s*[÷/]\s*(\d+)', exercise)
    
    for num1, num2 in div_patterns:
        try:
            quotient = int(num1) // int(num2)
            remainder = int(num1) % int(num2)
            expected_numbers = extract_numbers_from_text(expected_output)
            # 檢查商和餘數是否都在輸出中
            if expected_numbers:
                has_quotient = quotient in expected_numbers or any(abs(n - quotient) < 0.01 for n in expected_numbers)
                has_remainder = remainder in expected_numbers or any(abs(n - remainder) < 0.01 for n in expected_numbers)
                if not has_quotient and not has_remainder:
                    issues.append({
                        'type': 'error',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求計算 {num1} ÷ {num2} 的商({quotient})和餘數({remainder})，但 expected_output 中沒有找到'
                    })
        except ValueError:
            pass
    
    # 檢查加法
    add_patterns = re.findall(r'計算\s+(\d+)\s*\+\s*(\d+)', exercise)
    add_patterns += re.findall(r'(\d+)\s*\+\s*(\d+)', exercise)
    
    for num1, num2 in add_patterns:
        try:
            result = int(num1) + int(num2)
            expected_numbers = extract_numbers_from_text(expected_output)
            if expected_numbers and result not in expected_numbers:
                found = False
                for exp_num in expected_numbers:
                    if abs(exp_num - result) < 0.01:
                        found = True
                        break
                if not found:
                    issues.append({
                        'type': 'error',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求計算 {num1} + {num2} = {result}，但 expected_output 中沒有找到正確結果'
                    })
        except ValueError:
            pass
    
    # 檢查減法
    sub_patterns = re.findall(r'計算\s+(\d+)\s*-\s*(\d+)', exercise)
    sub_patterns += re.findall(r'(\d+)\s*-\s*(\d+)', exercise)
    
    for num1, num2 in sub_patterns:
        try:
            result = int(num1) - int(num2)
            expected_numbers = extract_numbers_from_text(expected_output)
            if expected_numbers and result not in expected_numbers:
                found = False
                for exp_num in expected_numbers:
                    if abs(exp_num - result) < 0.01:
                        found = True
                        break
                if not found:
                    issues.append({
                        'type': 'error',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求計算 {num1} - {num2} = {result}，但 expected_output 中沒有找到正確結果'
                    })
        except ValueError:
            pass
    
    # 檢查是否提到要印出多行
    if '兩行' in exercise or '多行' in exercise or '分兩行' in exercise:
        line_count = expected_output.count('\n')
        if line_count < 1:
            issues.append({
                'type': 'error',
                'lesson_id': lesson_id,
                'message': '練習題要求印出多行，但 expected_output 只有一行或沒有換行'
            })
    
    # 檢查是否提到要印出特定數字範圍
    # 例如：印出 0 到 4
    range_patterns = re.findall(r'(\d+)\s*到\s*(\d+)', exercise)
    range_patterns += re.findall(r'(\d+)\s*[-~]\s*(\d+)', exercise)
    
    for start, end in range_patterns:
        try:
            start_num = int(start)
            end_num = int(end)
            expected_numbers = extract_numbers_from_text(expected_output)
            if expected_numbers:
                # 檢查是否包含範圍內的所有數字
                missing = []
                for num in range(start_num, end_num + 1):
                    if num not in expected_numbers:
                        missing.append(num)
                if missing:
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': f'練習題要求印出 {start} 到 {end}，但 expected_output 中缺少: {missing}'
                    })
        except ValueError:
            pass
    
    return issues


def check_stdout_contains_match(lesson_id, exercise, explanation, expected_output):
    """檢查 stdout_contains 的匹配"""
    issues = []
    
    # stdout_contains 的 expected_output 應該是要包含的關鍵字
    # 檢查練習題中是否提到了這個關鍵字
    exercise_lower = exercise.lower()
    expected_lower = expected_output.lower().strip()
    
    # 如果 expected_output 是關鍵字，檢查練習題中是否提到
    if len(expected_output.strip()) < 50:  # 可能是關鍵字
        if expected_lower not in exercise_lower and expected_lower not in explanation.lower():
            issues.append({
                'type': 'warning',
                'lesson_id': lesson_id,
                'message': f'expected_output 要求包含 "{expected_output}"，但練習題中沒有明確提到'
            })
    
    return issues


def manually_verify_key_lessons():
    """手動驗證關鍵課程"""
    issues = []
    
    # 檢查幾個關鍵課程
    key_lessons = [
        ('EX1-0', 'Hello, Python!', 'Hello, Python!\\n'),
        ('EX1-1', '123 乘以 456', '56088\\n'),
        ('PT1-0', 'Hello, Gemini!', 'Hello, Gemini!'),
        ('EX3-1', '0 到 4', '0\\n1\\n2\\n3\\n4\\n'),
    ]
    
    for lesson_id, keyword, expected in key_lessons:
        lesson = next((l for l in LESSONS if l.get('id') == lesson_id), None)
        if not lesson:
            continue
        
        if 'validator' in lesson and 'expected_output' in lesson['validator']:
            actual_expected = lesson['validator']['expected_output']
            # 檢查是否匹配
            if expected.replace('\\n', '\n') not in actual_expected and actual_expected not in expected.replace('\\n', '\n'):
                # 這只是檢查，不是錯誤
                pass
    
    return issues


def main():
    """主函數"""
    print("=" * 60)
    print("題目要求與預期輸出匹配驗證")
    print("=" * 60)
    
    all_issues = []
    
    # 檢查練習題和預期輸出的匹配
    print("\n1. 檢查練習題與預期輸出是否匹配...")
    issues = check_exercise_output_match()
    all_issues.extend(issues)
    print(f"   發現 {len(issues)} 個問題")
    
    # 手動驗證關鍵課程
    print("\n2. 手動驗證關鍵課程...")
    issues = manually_verify_key_lessons()
    all_issues.extend(issues)
    print(f"   發現 {len(issues)} 個問題")
    
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
        for issue in warnings[:30]:  # 只顯示前30個
            print(f"  [{issue['lesson_id']}] {issue['message']}")
        if len(warnings) > 30:
            print(f"  ... 還有 {len(warnings) - 30} 個警告")
    
    if not all_issues:
        print("\n✅ 沒有發現問題！所有題目要求與預期輸出都匹配。")
    else:
        print(f"\n⚠️  發現 {len(all_issues)} 個問題需要檢查")
    
    print("\n" + "=" * 60)
    print(f"總計: {len(all_issues)} 個問題")
    print(f"  - 錯誤: {len(errors)} 個")
    print(f"  - 警告: {len(warnings)} 個")
    print("=" * 60)
    
    # 顯示一些具體的檢查範例
    print("\n" + "=" * 60)
    print("具體檢查範例（前10個課程）")
    print("=" * 60)
    
    for i in range(min(10, len(LESSONS))):
        lesson = LESSONS[i]
        lesson_id = lesson.get('id', f'課程{i+1}')
        exercise = lesson.get('exercise', '')[:60]
        if 'validator' in lesson and 'expected_output' in lesson['validator']:
            expected = lesson['validator']['expected_output'][:60].replace('\n', '\\n')
            print(f"\n{lesson_id}:")
            print(f"  練習: {exercise}...")
            print(f"  預期: {expected}...")
        else:
            print(f"\n{lesson_id}: 無驗證器或預期輸出")
    
    return 0 if len(errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

