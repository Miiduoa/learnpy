#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能代碼分析器
用於檢查代碼結構、編程模式和邏輯正確性
"""

import ast
import re
from typing import Dict, List, Tuple, Optional, Any


class CodeAnalyzer:
    """分析Python代碼的結構和模式"""
    
    def __init__(self, code: str):
        """
        初始化代碼分析器
        
        Args:
            code: 要分析的Python代碼字符串
        """
        self.code = code
        self.tree = None
        self.errors = []
        self.warnings = []
        
        try:
            self.tree = ast.parse(code)
        except SyntaxError as e:
            self.errors.append(f"語法錯誤：{e.msg} (第 {e.lineno} 行)")
        except Exception as e:
            self.errors.append(f"解析錯誤：{str(e)}")
    
    def has_loop(self, loop_type: Optional[str] = None) -> bool:
        """
        檢查代碼中是否包含循環
        
        Args:
            loop_type: 可選，指定循環類型 ('for', 'while', 或 None 表示任意)
        
        Returns:
            如果找到指定類型的循環則返回 True
        """
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if loop_type == 'for' and isinstance(node, ast.For):
                return True
            elif loop_type == 'while' and isinstance(node, ast.While):
                return True
            elif loop_type is None and (isinstance(node, (ast.For, ast.While))):
                return True
        
        return False
    
    def has_function_definition(self, function_name: Optional[str] = None) -> bool:
        """
        檢查代碼中是否包含函數定義
        
        Args:
            function_name: 可選，指定函數名稱
        
        Returns:
            如果找到指定函數則返回 True
        """
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                if function_name is None:
                    return True
                elif node.name == function_name:
                    return True
        
        return False
    
    def has_if_statement(self) -> bool:
        """檢查代碼中是否包含 if 語句"""
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.If):
                return True
        
        return False
    
    def has_list_comprehension(self) -> bool:
        """檢查代碼中是否包含列表推導式"""
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.ListComp):
                return True
        
        return False
    
    def has_variable(self, var_name: str) -> bool:
        """
        檢查代碼中是否使用指定的變數
        
        Args:
            var_name: 變數名稱
        
        Returns:
            如果找到變數則返回 True
        """
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Name) and node.id == var_name:
                return True
        
        return False
    
    def count_loops(self) -> int:
        """計算代碼中循環的數量"""
        if not self.tree:
            return 0
        
        count = 0
        for node in ast.walk(self.tree):
            if isinstance(node, (ast.For, ast.While)):
                count += 1
        
        return count
    
    def count_functions(self) -> int:
        """計算代碼中函數定義的數量"""
        if not self.tree:
            return 0
        
        count = 0
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                count += 1
        
        return count
    
    def get_function_names(self) -> List[str]:
        """獲取所有定義的函數名稱"""
        if not self.tree:
            return []
        
        names = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                names.append(node.name)
        
        return names
    
    def has_hardcoded_values(self, pattern: Optional[str] = None) -> bool:
        """
        檢查代碼中是否包含硬編碼的值（例如多個重複的 print 語句）
        
        Args:
            pattern: 可選的正則表達式模式，用於匹配特定的硬編碼模式
        
        Returns:
            如果檢測到硬編碼模式則返回 True
        """
        if not self.tree:
            return False
        
        # 計算 print 語句的數量
        print_count = 0
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id == 'print':
                    print_count += 1
        
        # 如果有多個 print 語句且沒有循環，可能是硬編碼
        if print_count > 3 and not self.has_loop():
            return True
        
        # 檢查是否有重複的數字字面量（可能是硬編碼）
        numbers = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                numbers.append(node.value)
        
        # 如果有很多重複的數字，可能是硬編碼
        if len(numbers) > 5 and len(set(numbers)) < len(numbers) * 0.5:
            return True
        
        return False
    
    def has_import(self, module_name: Optional[str] = None) -> bool:
        """
        檢查代碼中是否包含 import 語句
        
        Args:
            module_name: 可選，指定模組名稱
        
        Returns:
            如果找到 import 則返回 True
        """
        if not self.tree:
            return False
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.Import):
                if module_name is None:
                    return True
                for alias in node.names:
                    if alias.name == module_name:
                        return True
            elif isinstance(node, ast.ImportFrom):
                if module_name is None:
                    return True
                if node.module == module_name:
                    return True
        
        return False
    
    def check_code_structure(self, requirements: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        根據要求檢查代碼結構
        
        Args:
            requirements: 包含檢查要求的字典，例如：
                {
                    "requires_loop": True,
                    "loop_type": "for",  # 可選
                    "requires_function": True,
                    "function_name": "calculate",  # 可選
                    "forbids_hardcode": True,
                    "requires_if": True,
                    "requires_variable": ["i", "result"],  # 可選
                    "max_loops": 2,  # 可選
                    "min_loops": 1,  # 可選
                }
        
        Returns:
            (是否通過, 反饋訊息列表)
        """
        feedback = []
        passed = True
        
        if not self.tree:
            return False, ["無法解析代碼，請檢查語法錯誤。"]
        
        # 檢查是否需要循環
        if requirements.get("requires_loop", False):
            loop_type = requirements.get("loop_type")
            if not self.has_loop(loop_type):
                passed = False
                if loop_type == "for":
                    feedback.append("❌ 此題目要求使用 for 循環，但您的代碼中沒有使用 for 循環。")
                    feedback.append("💡 提示：使用 for 循環可以讓代碼更簡潔，避免重複寫多行相似的代碼。")
                elif loop_type == "while":
                    feedback.append("❌ 此題目要求使用 while 循環，但您的代碼中沒有使用 while 循環。")
                    feedback.append("💡 提示：while 循環適合在條件滿足時重複執行。")
                else:
                    feedback.append("❌ 此題目要求使用循環（for 或 while），但您的代碼中沒有使用循環。")
                    feedback.append("💡 提示：使用循環可以讓代碼更簡潔，避免重複寫多行相似的代碼。")
        
        # 檢查是否禁止硬編碼
        if requirements.get("forbids_hardcode", False):
            if self.has_hardcoded_values():
                passed = False
                feedback.append("❌ 檢測到硬編碼的寫法。雖然結果可能正確，但此題目要求使用更靈活的方法（如循環）。")
                feedback.append("💡 提示：嘗試使用循環來處理重複的操作，這樣代碼更簡潔且易於維護。")
        
        # 檢查是否需要函數
        if requirements.get("requires_function", False):
            function_name = requirements.get("function_name")
            if not self.has_function_definition(function_name):
                passed = False
                if function_name:
                    feedback.append(f"❌ 此題目要求定義名為 '{function_name}' 的函數，但您的代碼中沒有找到。")
                else:
                    feedback.append("❌ 此題目要求定義函數，但您的代碼中沒有函數定義。")
                feedback.append("💡 提示：使用 def 關鍵字定義函數，例如：def my_function():")
        
        # 檢查是否需要 if 語句
        if requirements.get("requires_if", False):
            if not self.has_if_statement():
                passed = False
                feedback.append("❌ 此題目要求使用 if 語句進行條件判斷，但您的代碼中沒有使用。")
                feedback.append("💡 提示：使用 if 語句可以根據條件執行不同的代碼。")
        
        # 檢查是否需要特定變數
        required_vars = requirements.get("requires_variable", [])
        if required_vars:
            missing_vars = []
            for var in required_vars:
                if not self.has_variable(var):
                    missing_vars.append(var)
            if missing_vars:
                passed = False
                feedback.append(f"❌ 此題目要求使用變數：{', '.join(missing_vars)}，但您的代碼中沒有找到。")
                feedback.append("💡 提示：使用變數可以儲存和重用數據。")
        
        # 檢查循環數量限制
        if "max_loops" in requirements:
            loop_count = self.count_loops()
            if loop_count > requirements["max_loops"]:
                passed = False
                feedback.append(f"❌ 此題目要求最多使用 {requirements['max_loops']} 個循環，但您的代碼中有 {loop_count} 個。")
        
        if "min_loops" in requirements:
            loop_count = self.count_loops()
            if loop_count < requirements["min_loops"]:
                passed = False
                feedback.append(f"❌ 此題目要求至少使用 {requirements['min_loops']} 個循環，但您的代碼中只有 {loop_count} 個。")
        
        # 檢查是否禁止使用某些功能
        if "forbids_import" in requirements:
            forbidden_imports = requirements["forbids_import"]
            if isinstance(forbidden_imports, str):
                forbidden_imports = [forbidden_imports]
            for module in forbidden_imports:
                if self.has_import(module):
                    passed = False
                    feedback.append(f"❌ 此題目不允許使用 {module} 模組，但您的代碼中使用了。")
        
        return passed, feedback
    
    def get_code_summary(self) -> Dict[str, Any]:
        """
        獲取代碼結構摘要
        
        Returns:
            包含代碼結構信息的字典
        """
        if not self.tree:
            return {
                "valid": False,
                "errors": self.errors
            }
        
        return {
            "valid": True,
            "has_loop": self.has_loop(),
            "has_for_loop": self.has_loop("for"),
            "has_while_loop": self.has_loop("while"),
            "has_function": self.has_function_definition(),
            "has_if": self.has_if_statement(),
            "has_list_comprehension": self.has_list_comprehension(),
            "loop_count": self.count_loops(),
            "function_count": self.count_functions(),
            "function_names": self.get_function_names(),
            "has_hardcode": self.has_hardcoded_values(),
            "errors": self.errors,
            "warnings": self.warnings
        }


def analyze_code(code: str, requirements: Optional[Dict[str, Any]] = None) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    分析代碼並檢查是否符合要求
    
    Args:
        code: 要分析的Python代碼
        requirements: 可選的檢查要求字典
    
    Returns:
        (是否通過結構檢查, 反饋訊息列表, 代碼摘要)
    """
    analyzer = CodeAnalyzer(code)
    summary = analyzer.get_code_summary()
    
    if requirements:
        passed, feedback = analyzer.check_code_structure(requirements)
        return passed, feedback, summary
    else:
        return True, [], summary


