#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
課程內容深度驗證
檢查課程內容的合理性和一致性
"""

import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "web_tutor"))
from lessons import LESSONS


def check_content_consistency():
    """檢查內容一致性"""
    issues = []
    
    for i, lesson in enumerate(LESSONS, 1):
        lesson_id = lesson.get('id', f'課程{i}')
        
        # 檢查 exercise 和 expected_output 的一致性
        if 'validator' in lesson and 'expected_output' in lesson['validator']:
            exercise = lesson.get('exercise', '')
            expected = lesson['validator']['expected_output']
            
            # 檢查 exercise 中提到的內容是否與 expected_output 匹配
            # 例如：如果 exercise 說要印出 "Hello"，expected_output 應該包含 "Hello"
            if '印出' in exercise or 'print' in exercise.lower():
                # 提取要印出的內容
                # 簡單檢查：如果 exercise 提到特定文字，expected_output 應該包含
                pass  # 這個檢查比較複雜，暫時跳過
        
        # 檢查 code_requirements 是否與課程內容匹配
        if 'validator' in lesson and 'code_requirements' in lesson['validator']:
            req = lesson['validator']['code_requirements']
            explanation = lesson.get('explanation', '')
            exercise = lesson.get('exercise', '')
            
            # 如果要求使用循環，但課程說明中沒有提到循環
            if req.get('requires_loop'):
                if '迴圈' not in explanation and '循環' not in explanation and 'loop' not in explanation.lower():
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': '要求使用循環，但說明中沒有提到循環'
                    })
            
            # 如果要求使用函數，但課程說明中沒有提到函數
            if req.get('requires_function'):
                if '函數' not in explanation and 'function' not in explanation.lower() and 'def' not in explanation:
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': '要求定義函數，但說明中沒有提到函數'
                    })
        
        # 檢查 hint 是否與 exercise 相關
        if 'hint' in lesson and 'exercise' in lesson:
            hint = lesson['hint']
            exercise = lesson['exercise']
            
            # 如果 hint 和 exercise 完全一樣，可能沒有幫助
            if hint.strip() == exercise.strip():
                issues.append({
                    'type': 'info',
                    'lesson_id': lesson_id,
                    'message': 'hint 與 exercise 完全相同，可能沒有提供額外幫助'
                })
    
    return issues


def check_specific_lessons():
    """檢查特定課程的內容"""
    issues = []
    
    # 檢查第一單元（應該是最基礎的）
    first_lesson = LESSONS[0] if LESSONS else None
    if first_lesson:
        lesson_id = first_lesson.get('id', '')
        
        # 第一單元不應該要求使用循環
        if 'validator' in first_lesson and 'code_requirements' in first_lesson['validator']:
            req = first_lesson['validator'].get('code_requirements', {})
            if req.get('requires_loop'):
                issues.append({
                    'type': 'error',
                    'lesson_id': lesson_id,
                    'message': '第一單元不應該要求使用循環（這是基礎課程）'
                })
    
    # 檢查每個課程的 expected_output 格式
    for i, lesson in enumerate(LESSONS, 1):
        lesson_id = lesson.get('id', f'課程{i}')
        
        if 'validator' in lesson and 'expected_output' in lesson['validator']:
            expected = lesson['validator']['expected_output']
            
            # 檢查 expected_output 是否以換行符結尾（通常應該有）
            validator_type = lesson['validator'].get('type', '')
            if validator_type == 'stdout_equals':
                # stdout_equals 通常應該以換行符結尾（因為 print() 會自動換行）
                if expected and not expected.endswith('\n'):
                    # 但這不是錯誤，只是檢查
                    pass
    
    return issues


def check_lesson_progression():
    """檢查課程進度是否合理"""
    issues = []
    
    # 檢查基礎概念是否在進階概念之前
    concepts_introduced = {}
    
    for i, lesson in enumerate(LESSONS, 1):
        lesson_id = lesson.get('id', f'課程{i}')
        explanation = lesson.get('explanation', '').lower()
        
        # 追蹤概念引入
        if 'for' in explanation or '迴圈' in explanation or '循環' in explanation:
            if 'for_loop' not in concepts_introduced:
                concepts_introduced['for_loop'] = (i, lesson_id)
        
        if 'while' in explanation or 'while 迴圈' in explanation or 'while 循環' in explanation:
            if 'while_loop' not in concepts_introduced:
                concepts_introduced['while_loop'] = (i, lesson_id)
        
        if 'def ' in explanation or '函數' in explanation:
            if 'function' not in concepts_introduced:
                concepts_introduced['function'] = (i, lesson_id)
        
        if 'if ' in explanation or '條件' in explanation:
            if 'if_statement' not in concepts_introduced:
                concepts_introduced['if_statement'] = (i, lesson_id)
        
        # 檢查是否在使用概念之前就要求使用
        if 'validator' in lesson and 'code_requirements' in lesson['validator']:
            req = lesson['validator']['code_requirements']
            
            if req.get('requires_loop') and req.get('loop_type') == 'for':
                if 'for_loop' not in concepts_introduced:
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': '要求使用 for 循環，但之前的課程中沒有介紹 for 循環'
                    })
            
            if req.get('requires_function'):
                if 'function' not in concepts_introduced:
                    issues.append({
                        'type': 'warning',
                        'lesson_id': lesson_id,
                        'message': '要求定義函數，但之前的課程中沒有介紹函數'
                    })
    
    return issues


def main():
    """主函數"""
    print("=" * 60)
    print("課程內容深度驗證")
    print("=" * 60)
    
    all_issues = []
    
    # 檢查內容一致性
    print("\n1. 檢查內容一致性...")
    issues = check_content_consistency()
    all_issues.extend(issues)
    print(f"   發現 {len(issues)} 個問題")
    
    # 檢查特定課程
    print("\n2. 檢查特定課程...")
    issues = check_specific_lessons()
    all_issues.extend(issues)
    print(f"   發現 {len(issues)} 個問題")
    
    # 檢查課程進度
    print("\n3. 檢查課程進度...")
    issues = check_lesson_progression()
    all_issues.extend(issues)
    print(f"   發現 {len(issues)} 個問題")
    
    # 打印結果
    print("\n" + "=" * 60)
    print("詳細結果")
    print("=" * 60)
    
    errors = [i for i in all_issues if i['type'] == 'error']
    warnings = [i for i in all_issues if i['type'] == 'warning']
    infos = [i for i in all_issues if i['type'] == 'info']
    
    if errors:
        print(f"\n❌ 錯誤 ({len(errors)} 個):")
        for issue in errors:
            print(f"  [{issue['lesson_id']}] {issue['message']}")
    
    if warnings:
        print(f"\n⚠️  警告 ({len(warnings)} 個):")
        for issue in warnings[:20]:  # 只顯示前20個
            print(f"  [{issue['lesson_id']}] {issue['message']}")
        if len(warnings) > 20:
            print(f"  ... 還有 {len(warnings) - 20} 個警告")
    
    if infos:
        print(f"\nℹ️  資訊 ({len(infos)} 個):")
        for issue in infos[:10]:  # 只顯示前10個
            print(f"  [{issue['lesson_id']}] {issue['message']}")
        if len(infos) > 10:
            print(f"  ... 還有 {len(infos) - 10} 個資訊")
    
    if not all_issues:
        print("\n✅ 沒有發現問題！所有課程內容看起來都很合理。")
    
    print("\n" + "=" * 60)
    print(f"總計: {len(all_issues)} 個問題")
    print(f"  - 錯誤: {len(errors)} 個")
    print(f"  - 警告: {len(warnings)} 個")
    print(f"  - 資訊: {len(infos)} 個")
    print("=" * 60)
    
    return 0 if len(errors) == 0 else 1


if __name__ == "__main__":
    sys.exit(main())




