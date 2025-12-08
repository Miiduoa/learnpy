#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
實時引導系統
用於在用戶輸入過程中提供智能引導和提示
"""

import ast
import re
from typing import Dict, List, Tuple, Optional, Any


class RealtimeGuide:
    """實時引導系統，提供輸入過程中的智能提示"""
    
    def __init__(self, lesson: Optional[Dict[str, Any]] = None):
        """
        初始化實時引導系統
        
        Args:
            lesson: 當前課程信息，包含驗證器要求
        """
        self.lesson = lesson
        self.code_requirements = {}
        if lesson and 'validator' in lesson:
            self.code_requirements = lesson['validator'].get('code_requirements', {})
    
    def check_syntax(self, code: str) -> Tuple[bool, Optional[str], Optional[int]]:
        """
        檢查語法錯誤
        
        Returns:
            (是否有語法錯誤, 錯誤訊息, 錯誤行號)
        """
        try:
            ast.parse(code)
            return False, None, None
        except SyntaxError as e:
            return True, e.msg, e.lineno
        except Exception as e:
            return True, str(e), None
    
    def analyze_partial_code(self, code: str, cursor_line: int, cursor_col: int) -> Dict[str, Any]:
        """
        分析部分代碼，提供實時引導
        
        Args:
            code: 當前代碼
            cursor_line: 游標所在行（從1開始）
            cursor_col: 游標所在列（從1開始）
        
        Returns:
            包含引導信息的字典
        """
        suggestions = []
        warnings = []
        hints = []
        
        lines = code.split('\n')
        current_line = lines[cursor_line - 1] if cursor_line <= len(lines) else ""
        
        # 1. 檢查語法錯誤
        has_syntax_error, error_msg, error_line = self.check_syntax(code)
        if has_syntax_error and error_line:
            if error_line == cursor_line:
                suggestions.append({
                    "type": "syntax_error",
                    "message": f"語法錯誤：{error_msg}",
                    "line": error_line,
                    "severity": "error"
                })
        
        # 2. 根據課程要求提供引導
        if self.code_requirements:
            # 檢查是否需要循環
            if self.code_requirements.get("requires_loop", False):
                if not self._has_loop_in_code(code):
                    loop_type = self.code_requirements.get("loop_type", "")
                    if loop_type == "for":
                        if "for" not in code.lower():
                            hints.append({
                                "type": "missing_loop",
                                "message": "💡 提示：此題目要求使用 for 循環",
                                "suggestion": "嘗試使用：for i in range(...):",
                                "severity": "info"
                            })
                    elif loop_type == "while":
                        if "while" not in code.lower():
                            hints.append({
                                "type": "missing_loop",
                                "message": "💡 提示：此題目要求使用 while 循環",
                                "suggestion": "嘗試使用：while 條件:",
                                "severity": "info"
                            })
                    else:
                        if "for" not in code.lower() and "while" not in code.lower():
                            hints.append({
                                "type": "missing_loop",
                                "message": "💡 提示：此題目要求使用循環",
                                "suggestion": "可以使用 for 或 while 循環",
                                "severity": "info"
                            })
            
            # 檢查是否禁止硬編碼
            if self.code_requirements.get("forbids_hardcode", False):
                if self._detect_hardcode(code):
                    warnings.append({
                        "type": "hardcode_detected",
                        "message": "⚠️ 檢測到可能的硬編碼寫法",
                        "suggestion": "考慮使用循環來簡化代碼",
                        "severity": "warning"
                    })
            
            # 檢查是否需要函數
            if self.code_requirements.get("requires_function", False):
                if "def " not in code:
                    function_name = self.code_requirements.get("function_name", "")
                    if function_name:
                        hints.append({
                            "type": "missing_function",
                            "message": f"💡 提示：需要定義名為 '{function_name}' 的函數",
                            "suggestion": f"def {function_name}():",
                            "severity": "info"
                        })
                    else:
                        hints.append({
                            "type": "missing_function",
                            "message": "💡 提示：此題目要求定義函數",
                            "suggestion": "使用 def 函數名稱(): 來定義函數",
                            "severity": "info"
                        })
            
            # 檢查是否需要 if 語句
            if self.code_requirements.get("requires_if", False):
                if "if " not in code:
                    hints.append({
                        "type": "missing_if",
                        "message": "💡 提示：此題目要求使用 if 語句",
                        "suggestion": "使用 if 條件: 來進行條件判斷",
                        "severity": "info"
                    })
        
        # 3. 檢查常見錯誤模式
        common_errors = self._check_common_errors(code, current_line, cursor_line)
        suggestions.extend(common_errors)
        
        return {
            "suggestions": suggestions,
            "warnings": warnings,
            "hints": hints,
            "has_syntax_error": has_syntax_error
        }
    
    def _has_loop_in_code(self, code: str) -> bool:
        """檢查代碼中是否有循環"""
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.For, ast.While)):
                    return True
            return False
        except:
            return False
    
    def _detect_hardcode(self, code: str) -> bool:
        """檢測硬編碼模式"""
        lines = code.split('\n')
        print_count = sum(1 for line in lines if 'print(' in line)
        
        # 如果有多個 print 且沒有循環，可能是硬編碼
        if print_count > 3 and not self._has_loop_in_code(code):
            return True
        
        return False
    
    def _check_common_errors(self, code: str, current_line: str, cursor_line: int) -> List[Dict[str, Any]]:
        """檢查常見錯誤"""
        suggestions = []
        
        # 檢查縮排問題
        if current_line.strip() and not current_line.startswith(' ') and not current_line.startswith('\t'):
            # 檢查上一行是否以冒號結尾（需要縮排）
            lines = code.split('\n')
            if cursor_line > 1:
                prev_line = lines[cursor_line - 2].strip()
                if prev_line.endswith(':'):
                    suggestions.append({
                        "type": "indentation",
                        "message": "💡 提示：上一行以冒號結尾，這一行需要縮排",
                        "suggestion": "按 Tab 或輸入 4 個空格",
                        "severity": "info",
                        "line": cursor_line
                    })
        
        # 檢查常見的拼寫錯誤
        common_mistakes = {
            "prnt": "print",
            "prin": "print",
            "rng": "range",
            "rge": "range",
            "fr": "for",
            "whle": "while",
            "whil": "while",
            "if ": "if ",
            "el": "else",
            "els": "else",
            "elif": "elif"
        }
        
        for mistake, correct in common_mistakes.items():
            if mistake in current_line.lower() and correct not in current_line.lower():
                # 檢查是否可能是拼寫錯誤
                if re.search(rf'\b{mistake}\b', current_line, re.IGNORECASE):
                    suggestions.append({
                        "type": "typo",
                        "message": f"💡 是否想輸入 '{correct}'？",
                        "suggestion": f"將 '{mistake}' 改為 '{correct}'",
                        "severity": "hint",
                        "line": cursor_line
                    })
                    break
        
        return suggestions
    
    def get_contextual_suggestion(self, code: str, cursor_line: int, cursor_col: int) -> Optional[str]:
        """
        根據上下文提供建議
        
        Returns:
            建議文字或 None
        """
        lines = code.split('\n')
        if cursor_line > len(lines):
            return None
        
        current_line = lines[cursor_line - 1]
        
        # 如果正在輸入 for 循環
        if "for" in current_line and "in" not in current_line and "range" not in current_line:
            return "💡 提示：for 循環通常搭配 range() 使用，例如：for i in range(5):"
        
        # 如果正在輸入函數定義
        if "def" in current_line and ":" not in current_line:
            return "💡 提示：函數定義需要以冒號 : 結尾"
        
        # 如果正在輸入 if 語句
        if "if" in current_line and ":" not in current_line and ":" not in current_line[-3:]:
            return "💡 提示：if 語句需要以冒號 : 結尾"
        
        return None
    
    def should_show_hint(self, code: str, time_typing: float = 0) -> bool:
        """
        判斷是否應該顯示提示
        
        Args:
            code: 當前代碼
            time_typing: 輸入時間（秒）
        
        Returns:
            是否應該顯示提示
        """
        # 如果代碼很短，不顯示提示（讓學習者先思考）
        if len(code.strip()) < 10:
            return False
        
        # 如果輸入時間超過 5 秒還沒有進展，顯示提示
        if time_typing > 5:
            return True
        
        # 如果有語法錯誤，顯示提示
        has_error, _, _ = self.check_syntax(code)
        if has_error:
            return True
        
        return False


def create_guide_for_lesson(lesson: Dict[str, Any]) -> RealtimeGuide:
    """為課程創建引導系統"""
    return RealtimeGuide(lesson)

