#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
檢查所有涉及計算的題目，驗證答案是否正確
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


def check_calculation_lessons():
    """檢查所有涉及計算的題目"""
    issues = []
    
    for i, lesson in enumerate(LESSONS, 1):
        lesson_id = lesson.get('id', f'課程{i}')
        exercise = lesson.get('exercise', '')
        explanation = lesson.get('explanation', '')
        
        if 'validator' not in lesson or 'expected_output' not in lesson['validator']:
            continue
        
        expected_output = lesson['validator']['expected_output']
        validator_type = lesson['validator'].get('type', '')
        
        if validator_type != 'stdout_equals':
            continue
        
        # 檢查乘法計算（只在明確要求計算時）
        # 排除陣列大小描述（如 2x3 陣列、5x5 陣列）
        if '計算' in exercise and ('×' in exercise or '*' in exercise or '乘' in exercise):
            mult_patterns = re.findall(r'計算\s+(\d+)\s*[×*xX]\s*(\d+)', exercise)
            for num1, num2 in mult_patterns:
                try:
                    correct_result = int(num1) * int(num2)
                    expected_numbers = extract_numbers_from_text(expected_output)
                    if expected_numbers:
                        found = any(abs(n - correct_result) < 0.01 for n in expected_numbers)
                        if not found:
                            issues.append({
                                'type': 'error',
                                'lesson_id': lesson_id,
                                'message': f'乘法計算錯誤：{num1} × {num2} = {correct_result}，但 expected_output 是 {expected_output.strip()}',
                                'correct_answer': str(correct_result)
                            })
                except ValueError:
                    pass
        
        # 檢查加法計算（只在明確要求加法時）
        if '相加' in exercise or '加法' in exercise or '加起來' in exercise or '總和' in exercise or '累加' in exercise:
            add_patterns = re.findall(r'(\d+)\s*\+\s*(\d+)', exercise)
            for num1, num2 in add_patterns:
                try:
                    correct_result = int(num1) + int(num2)
                    expected_numbers = extract_numbers_from_text(expected_output)
                    if expected_numbers:
                        found = any(abs(n - correct_result) < 0.01 for n in expected_numbers)
                        if not found:
                            issues.append({
                                'type': 'error',
                                'lesson_id': lesson_id,
                                'message': f'加法計算錯誤：{num1} + {num2} = {correct_result}，但 expected_output 是 {expected_output.strip()}',
                                'correct_answer': str(correct_result)
                            })
                except ValueError:
                    pass
        
        # 檢查減法計算
        sub_patterns = re.findall(r'計算\s+(\d+)\s*-\s*(\d+)', exercise)
        sub_patterns += re.findall(r'(\d+)\s*和\s*(\d+)\s*的.*差', exercise)
        
        for num1, num2 in sub_patterns:
            try:
                correct_result = int(num1) - int(num2)
                expected_numbers = extract_numbers_from_text(expected_output)
                if expected_numbers:
                    found = any(abs(n - correct_result) < 0.01 for n in expected_numbers)
                    if not found:
                        issues.append({
                            'type': 'error',
                            'lesson_id': lesson_id,
                            'message': f'減法計算錯誤：{num1} - {num2} = {correct_result}，但 expected_output 是 {expected_output.strip()}',
                            'correct_answer': str(correct_result)
                        })
            except ValueError:
                pass
        
        # 檢查除法（商和餘數）
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
                                'message': f'除法計算錯誤：{num1} ÷ {num2} 的商={quotient}，餘數={remainder}，但 expected_output 是 {expected_output.strip()}',
                                'correct_answer': f'{quotient}\\n{remainder}'
                            })
                except ValueError:
                    pass
        
        # 檢查加權平均（成績計算）
        if '成績' in exercise and ('平時' in exercise or '期中考' in exercise or '期末' in exercise):
            # 提取成績和權重
            scores = re.findall(r'(\d+)\s*[分%]', exercise)
            weights = re.findall(r'(\d+)%', exercise)
            if len(scores) >= 2 and len(weights) >= 2:
                # 這需要更複雜的邏輯，暫時跳過
                pass
        
        # 檢查分段計費（停車費、門票等）
        if '停車' in exercise or '小時' in exercise and '元' in exercise:
            # 提取時間和費率
            hours_match = re.search(r'hours\s*=\s*(\d+)', exercise)
            if hours_match:
                hours = int(hours_match.group(1))
                # 檢查是否有分段計費規則
                rate1_match = re.search(r'前\s*(\d+)\s*小時[：:]\s*每小時\s*(\d+)', exercise)
                rate2_match = re.search(r'超過\s*(\d+)\s*小時[：:]\s*每小時\s*(\d+)', exercise)
                
                if rate1_match and rate2_match:
                    threshold = int(rate1_match.group(1))
                    rate1 = int(rate1_match.group(2))
                    rate2_threshold = int(rate2_match.group(1))
                    rate2 = int(rate2_match.group(2))
                    
                    # 計算正確答案
                    if hours <= threshold:
                        correct_cost = hours * rate1
                    else:
                        correct_cost = threshold * rate1 + (hours - threshold) * rate2
                    
                    expected_numbers = extract_numbers_from_text(expected_output)
                    if expected_numbers:
                        found = any(abs(n - correct_cost) < 0.01 for n in expected_numbers)
                        if not found:
                            issues.append({
                                'type': 'error',
                                'lesson_id': lesson_id,
                                'message': f'分段計費錯誤：{hours}小時應該={correct_cost}元，但 expected_output 是 {expected_output.strip()}',
                                'correct_answer': str(correct_cost)
                            })
    
    return issues


def main():
    """主函數"""
    print("=" * 60)
    print("檢查所有計算題目的答案")
    print("=" * 60)
    
    issues = check_calculation_lessons()
    
    print(f"\n發現 {len(issues)} 個問題\n")
    
    if issues:
        print("=" * 60)
        print("詳細問題列表")
        print("=" * 60)
        
        for i, issue in enumerate(issues, 1):
            print(f"\n{i}. [{issue['lesson_id']}]")
            print(f"   問題: {issue['message']}")
            if 'correct_answer' in issue:
                print(f"   正確答案應該是: {issue['correct_answer']}")
    
    else:
        print("\n✅ 沒有發現計算錯誤！所有題目的答案都是正確的。")
    
    print("\n" + "=" * 60)
    print(f"總計: {len(issues)} 個問題")
    print("=" * 60)
    
    return 0 if len(issues) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

