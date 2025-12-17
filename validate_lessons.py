#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
課程內容驗證腳本
檢查所有課程的內容是否正確、完整
"""

import sys
import re
from pathlib import Path

# 添加路徑以導入課程
sys.path.insert(0, str(Path(__file__).parent / "web_tutor"))
from lessons import LESSONS


class LessonValidator:
    """課程驗證器"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.info = []
    
    def validate_all(self):
        """驗證所有課程"""
        print("=" * 60)
        print("開始驗證所有課程...")
        print("=" * 60)
        print(f"總共有 {len(LESSONS)} 個課程\n")
        
        for i, lesson in enumerate(LESSONS, 1):
            self.validate_lesson(lesson, i)
        
        self.print_summary()
    
    def validate_lesson(self, lesson, index):
        """驗證單個課程"""
        lesson_id = lesson.get('id', f'課程{index}')
        
        # 檢查必需字段
        required_fields = ['id', 'title', 'explanation', 'exercise']
        for field in required_fields:
            if field not in lesson:
                self.errors.append(f"{lesson_id}: 缺少必需字段 '{field}'")
        
        # 檢查字段是否為空
        if 'title' in lesson and not lesson['title'].strip():
            self.errors.append(f"{lesson_id}: title 為空")
        
        if 'explanation' in lesson and not lesson['explanation'].strip():
            self.errors.append(f"{lesson_id}: explanation 為空")
        
        if 'exercise' in lesson and not lesson['exercise'].strip():
            self.errors.append(f"{lesson_id}: exercise 為空")
        
        # 檢查 validator
        if 'validator' not in lesson:
            self.warnings.append(f"{lesson_id}: 沒有 validator（可能是有意設計）")
        else:
            self.validate_validator(lesson_id, lesson['validator'])
        
        # 檢查 hint（可選但建議有）
        if 'hint' not in lesson:
            self.info.append(f"{lesson_id}: 沒有 hint（建議添加）")
        elif not lesson['hint'].strip():
            self.warnings.append(f"{lesson_id}: hint 為空")
    
    def validate_validator(self, lesson_id, validator):
        """驗證驗證器配置"""
        if not isinstance(validator, dict):
            self.errors.append(f"{lesson_id}: validator 不是字典")
            return
        
        # 檢查 validator type
        validator_type = validator.get('type', 'no_error')
        valid_types = ['stdout_equals', 'stdout_contains', 'stdout_ends_with', 
                      'stdout_starts_with', 'no_error']
        
        if validator_type not in valid_types:
            self.errors.append(f"{lesson_id}: 無效的 validator type: {validator_type}")
        
        # 檢查 expected_output
        if validator_type in ['stdout_equals', 'stdout_contains', 'stdout_ends_with', 'stdout_starts_with']:
            if 'expected_output' not in validator:
                self.errors.append(f"{lesson_id}: validator type 為 {validator_type} 但缺少 expected_output")
            elif not isinstance(validator['expected_output'], str):
                self.warnings.append(f"{lesson_id}: expected_output 不是字串")
        
        # 檢查 code_requirements
        if 'code_requirements' in validator:
            self.validate_code_requirements(lesson_id, validator['code_requirements'])
    
    def validate_code_requirements(self, lesson_id, requirements):
        """驗證程式碼結構要求"""
        if not isinstance(requirements, dict):
            self.errors.append(f"{lesson_id}: code_requirements 不是字典")
            return
        
        valid_keys = [
            'requires_loop', 'loop_type', 'requires_function', 'function_name',
            'requires_if', 'requires_variable', 'forbids_hardcode',
            'min_loops', 'max_loops', 'forbids_import'
        ]
        
        for key in requirements:
            if key not in valid_keys:
                self.warnings.append(f"{lesson_id}: code_requirements 中有未知的鍵: {key}")
        
        # 檢查 loop_type
        if 'loop_type' in requirements:
            loop_type = requirements['loop_type']
            if loop_type not in ['for', 'while']:
                self.errors.append(f"{lesson_id}: 無效的 loop_type: {loop_type}")
        
        # 檢查 requires_loop 和 loop_type 的一致性
        if 'loop_type' in requirements and not requirements.get('requires_loop'):
            self.warnings.append(f"{lesson_id}: 指定了 loop_type 但 requires_loop 為 False")
        
        # 檢查 requires_function 和 function_name 的一致性
        if 'function_name' in requirements and not requirements.get('requires_function'):
            self.warnings.append(f"{lesson_id}: 指定了 function_name 但 requires_function 為 False")
        
        # 檢查 requires_variable 是否為列表
        if 'requires_variable' in requirements:
            if not isinstance(requirements['requires_variable'], list):
                self.errors.append(f"{lesson_id}: requires_variable 應該是列表")
        
        # 檢查 min_loops 和 max_loops
        if 'min_loops' in requirements:
            try:
                min_loops = int(requirements['min_loops'])
                if min_loops < 0:
                    self.errors.append(f"{lesson_id}: min_loops 不能為負數")
            except (ValueError, TypeError):
                self.errors.append(f"{lesson_id}: min_loops 不是有效的整數")
        
        if 'max_loops' in requirements:
            try:
                max_loops = int(requirements['max_loops'])
                if max_loops < 0:
                    self.errors.append(f"{lesson_id}: max_loops 不能為負數")
            except (ValueError, TypeError):
                self.errors.append(f"{lesson_id}: max_loops 不是有效的整數")
        
        # 檢查 min_loops 和 max_loops 的邏輯
        if 'min_loops' in requirements and 'max_loops' in requirements:
            try:
                min_loops = int(requirements['min_loops'])
                max_loops = int(requirements['max_loops'])
                if min_loops > max_loops:
                    self.errors.append(f"{lesson_id}: min_loops ({min_loops}) > max_loops ({max_loops})")
            except (ValueError, TypeError):
                pass
    
    def check_content_quality(self, lesson_id, explanation, exercise):
        """檢查內容品質"""
        # 檢查是否有明顯的格式問題
        if explanation:
            # 檢查是否有未閉合的 markdown 格式
            if explanation.count('```') % 2 != 0:
                self.warnings.append(f"{lesson_id}: explanation 中有未閉合的程式碼區塊")
            
            # 檢查是否有明顯的錯誤
            if 'print(' in explanation and 'print(' not in explanation.lower():
                pass  # 這是正常的
        
        if exercise:
            # 檢查練習題是否過短
            if len(exercise.strip()) < 10:
                self.warnings.append(f"{lesson_id}: exercise 可能過短")
    
    def print_summary(self):
        """打印驗證摘要"""
        print("\n" + "=" * 60)
        print("驗證結果摘要")
        print("=" * 60)
        
        if self.errors:
            print(f"\n❌ 錯誤 ({len(self.errors)} 個):")
            for error in self.errors:
                print(f"  - {error}")
        else:
            print("\n✅ 沒有發現錯誤")
        
        if self.warnings:
            print(f"\n⚠️  警告 ({len(self.warnings)} 個):")
            for warning in self.warnings[:20]:  # 只顯示前20個
                print(f"  - {warning}")
            if len(self.warnings) > 20:
                print(f"  ... 還有 {len(self.warnings) - 20} 個警告")
        else:
            print("\n✅ 沒有警告")
        
        if self.info:
            print(f"\nℹ️  資訊 ({len(self.info)} 個):")
            for info in self.info[:10]:  # 只顯示前10個
                print(f"  - {info}")
            if len(self.info) > 10:
                print(f"  ... 還有 {len(self.info) - 10} 個資訊")
        
        print("\n" + "=" * 60)
        print(f"總計: {len(LESSONS)} 個課程")
        print(f"錯誤: {len(self.errors)} 個")
        print(f"警告: {len(self.warnings)} 個")
        print(f"資訊: {len(self.info)} 個")
        print("=" * 60)
        
        # 返回是否有錯誤
        return len(self.errors) == 0


def main():
    """主函數"""
    validator = LessonValidator()
    is_valid = validator.validate_all()
    
    # 額外檢查：檢查課程 ID 是否重複
    print("\n" + "=" * 60)
    print("檢查課程 ID 重複...")
    print("=" * 60)
    
    lesson_ids = {}
    for i, lesson in enumerate(LESSONS):
        lesson_id = lesson.get('id', f'無ID_{i}')
        if lesson_id in lesson_ids:
            print(f"⚠️  發現重複的課程 ID: {lesson_id}")
            print(f"   第 {lesson_ids[lesson_id] + 1} 個課程和第 {i + 1} 個課程")
        else:
            lesson_ids[lesson_id] = i
    
    if len(lesson_ids) == len(LESSONS):
        print("✅ 沒有發現重複的課程 ID")
    
    # 檢查課程順序
    print("\n" + "=" * 60)
    print("檢查課程順序...")
    print("=" * 60)
    
    # 檢查是否有明顯的順序問題（例如 EX3 在 EX1 之前）
    ex_lessons = {}
    for i, lesson in enumerate(LESSONS):
        lesson_id = lesson.get('id', '')
        # 提取課程編號（例如 EX1-0 -> EX1）
        match = re.match(r'([A-Z]+)(\d+)-', lesson_id)
        if match:
            prefix = match.group(1)
            num = int(match.group(2))
            if prefix not in ex_lessons:
                ex_lessons[prefix] = []
            ex_lessons[prefix].append((num, i, lesson_id))
    
    # 檢查每個前綴的順序
    for prefix, lessons in ex_lessons.items():
        lessons.sort(key=lambda x: (x[0], x[1]))  # 按編號和索引排序
        prev_num = None
        for num, idx, lesson_id in lessons:
            if prev_num is not None and num < prev_num:
                print(f"⚠️  {lesson_id} 的編號 ({num}) 小於前一個 ({prev_num})，但位置在後面")
            prev_num = num
    
    print("✅ 課程順序檢查完成")
    
    return 0 if is_valid else 1


if __name__ == "__main__":
    sys.exit(main())



