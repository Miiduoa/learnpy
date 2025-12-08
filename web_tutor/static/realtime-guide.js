/**
 * 實時引導系統
 * 在用戶輸入過程中提供智能引導和提示
 */

class RealtimeGuide {
    constructor(lesson = null) {
        this.lesson = lesson;
        this.codeRequirements = {};
        this.typingTimer = null;
        this.lastCode = '';
        this.guideLevel = 'moderate'; // 'minimal', 'moderate', 'helpful'
        this.hintDelay = 2000; // 2秒後顯示提示
        this.suggestionContainer = null;
        
        if (lesson && lesson.validator) {
            this.codeRequirements = lesson.validator.code_requirements || {};
        }
    }
    
    /**
     * 初始化引導系統
     */
    init(editorElement, suggestionContainer) {
        this.editor = editorElement;
        this.suggestionContainer = suggestionContainer;
        this.setupEventListeners();
    }
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        if (!this.editor) return;
        
        let typingTimeout;
        let lastTypingTime = Date.now();
        
        this.editor.addEventListener('input', (e) => {
            const now = Date.now();
            const code = this.editor.value;
            const cursorPos = this.getCursorPosition();
            
            // 清除之前的計時器
            clearTimeout(typingTimeout);
            
            // 如果停止輸入一段時間，提供引導
            typingTimeout = setTimeout(() => {
                this.provideGuidance(code, cursorPos);
            }, this.hintDelay);
            
            // 實時語法檢查（輕量級）
            this.checkSyntaxRealtime(code, cursorPos);
            
            this.lastCode = code;
            lastTypingTime = now;
        });
        
            // 當游標移動時，更新提示（只在有課程要求時）
        this.editor.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // 只在有課程要求時才更新上下文提示
                if (this.codeRequirements && Object.keys(this.codeRequirements).length > 0) {
                    const code = this.editor.value;
                    const cursorPos = this.getCursorPosition();
                    this.updateContextualHint(code, cursorPos);
                }
            }
        });
    }
    
    /**
     * 獲取游標位置
     */
    getCursorPosition() {
        if (!this.editor) return { line: 1, col: 1 };
        
        const text = this.editor.value;
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        
        return {
            line: lines.length,
            col: lines[lines.length - 1].length + 1
        };
    }
    
    /**
     * 實時語法檢查（輕量級）
     */
    checkSyntaxRealtime(code, cursorPos) {
        if (!code.trim()) return;
        
        // 簡單的語法檢查
        const suggestions = [];
        
        // 檢查常見錯誤
        const lines = code.split('\n');
        const currentLine = lines[cursorPos.line - 1] || '';
        
        // 檢查縮排問題
        if (currentLine.trim()) {
            const prevLine = lines[cursorPos.line - 2];
            if (prevLine && prevLine.trim().endsWith(':') && 
                !currentLine.match(/^\s+/)) {
                suggestions.push({
                    type: 'indentation',
                    message: '💡 上一行以冒號結尾，這一行需要縮排',
                    severity: 'info'
                });
            }
        }
        
        // 檢查常見拼寫錯誤
        const typos = this.checkTypos(currentLine);
        suggestions.push(...typos);
        
        this.showSuggestions(suggestions, 'realtime');
    }
    
    /**
     * 檢查拼寫錯誤
     */
    checkTypos(line) {
        const suggestions = [];
        const commonMistakes = {
            'prnt': 'print',
            'prin': 'print',
            'rng': 'range',
            'rge': 'range',
            'fr ': 'for ',
            'whle': 'while',
            'whil': 'while'
        };
        
        for (const [mistake, correct] of Object.entries(commonMistakes)) {
            if (line.toLowerCase().includes(mistake) && 
                !line.toLowerCase().includes(correct)) {
                suggestions.push({
                    type: 'typo',
                    message: `💡 是否想輸入 '${correct}'？`,
                    severity: 'hint'
                });
                break;
            }
        }
        
        return suggestions;
    }
    
    /**
     * 提供引導
     */
    provideGuidance(code, cursorPos) {
        if (!code.trim() || code.length < 10) return;
        
        // 如果課程沒有 code_requirements，就不提供結構性引導
        if (!this.codeRequirements || Object.keys(this.codeRequirements).length === 0) {
            return;
        }
        
        const suggestions = [];
        const hints = [];
        const warnings = [];
        
        // 根據課程要求提供引導
        if (this.codeRequirements.requires_loop) {
            const hasLoop = this.hasLoop(code);
            if (!hasLoop) {
                const loopType = this.codeRequirements.loop_type;
                if (loopType === 'for') {
                    hints.push({
                        type: 'missing_loop',
                        message: '💡 提示：此題目要求使用 for 循環',
                        suggestion: '嘗試使用：for i in range(...):',
                        severity: 'info'
                    });
                } else if (loopType === 'while') {
                    hints.push({
                        type: 'missing_loop',
                        message: '💡 提示：此題目要求使用 while 循環',
                        suggestion: '嘗試使用：while 條件:',
                        severity: 'info'
                    });
                } else {
                    hints.push({
                        type: 'missing_loop',
                        message: '💡 提示：此題目要求使用循環',
                        suggestion: '可以使用 for 或 while 循環',
                        severity: 'info'
                    });
                }
            }
        }
        
        // 檢查硬編碼
        if (this.codeRequirements.forbids_hardcode) {
            if (this.detectHardcode(code)) {
                warnings.push({
                    type: 'hardcode',
                    message: '⚠️ 檢測到可能的硬編碼寫法',
                    suggestion: '考慮使用循環來簡化代碼',
                    severity: 'warning'
                });
            }
        }
        
        // 檢查函數
        if (this.codeRequirements.requires_function) {
            if (!code.includes('def ')) {
                const funcName = this.codeRequirements.function_name;
                hints.push({
                    type: 'missing_function',
                    message: funcName 
                        ? `💡 提示：需要定義名為 '${funcName}' 的函數`
                        : '💡 提示：此題目要求定義函數',
                    suggestion: funcName 
                        ? `def ${funcName}():`
                        : '使用 def 函數名稱(): 來定義函數',
                    severity: 'info'
                });
            }
        }
        
        // 檢查 if 語句
        if (this.codeRequirements.requires_if) {
            if (!code.includes('if ')) {
                hints.push({
                    type: 'missing_if',
                    message: '💡 提示：此題目要求使用 if 語句',
                    suggestion: '使用 if 條件: 來進行條件判斷',
                    severity: 'info'
                });
            }
        }
        
        // 根據幫助級別過濾提示
        const filteredHints = this.filterByGuideLevel(hints);
        
        this.showSuggestions([...warnings, ...filteredHints], 'guidance');
    }
    
    /**
     * 更新上下文提示
     */
    updateContextualHint(code, cursorPos) {
        // 只在有課程要求時提供上下文提示，避免在不該提示的時候提示
        if (!this.codeRequirements || Object.keys(this.codeRequirements).length === 0) {
            return;
        }
        
        const lines = code.split('\n');
        const currentLine = lines[cursorPos.line - 1] || '';
        
        let hint = null;
        
        // 如果課程要求使用 for 循環，且正在輸入 for
        if (this.codeRequirements.requires_loop && 
            (this.codeRequirements.loop_type === 'for' || !this.codeRequirements.loop_type)) {
            if (currentLine.includes('for') && 
                !currentLine.includes('in') && 
                !currentLine.includes('range')) {
                hint = {
                    type: 'contextual',
                    message: '💡 提示：for 循環通常搭配 range() 使用',
                    example: 'for i in range(5):',
                    severity: 'hint'
                };
            }
        }
        
        // 如果課程要求定義函數，且正在輸入函數定義
        if (this.codeRequirements.requires_function) {
            if (currentLine.includes('def') && !currentLine.includes(':')) {
                hint = {
                    type: 'contextual',
                    message: '💡 提示：函數定義需要以冒號 : 結尾',
                    severity: 'hint'
                };
            }
        }
        
        // 如果課程要求使用 if 語句，且正在輸入 if
        if (this.codeRequirements.requires_if) {
            if (currentLine.includes('if') && 
                 !currentLine.includes(':') && 
                 !currentLine.trim().endsWith(':')) {
                hint = {
                    type: 'contextual',
                    message: '💡 提示：if 語句需要以冒號 : 結尾',
                    severity: 'hint'
                };
            }
        }
        
        if (hint) {
            this.showSuggestions([hint], 'contextual');
        }
    }
    
    /**
     * 檢查是否有循環
     */
    hasLoop(code) {
        return /for\s+\w+\s+in/.test(code) || /while\s+/.test(code);
    }
    
    /**
     * 檢測硬編碼
     * 只在課程明確禁止硬編碼時才檢測
     */
    detectHardcode(code) {
        // 如果課程沒有禁止硬編碼的要求，就不檢測
        if (!this.codeRequirements || !this.codeRequirements.forbids_hardcode) {
            return false;
        }
        
        const printMatches = code.match(/print\(/g);
        const printCount = printMatches ? printMatches.length : 0;
        return printCount > 3 && !this.hasLoop(code);
    }
    
    /**
     * 根據幫助級別過濾提示
     */
    filterByGuideLevel(hints) {
        if (this.guideLevel === 'minimal') {
            // 只顯示關鍵提示
            return hints.filter(h => h.severity === 'warning' || h.type === 'missing_loop');
        } else if (this.guideLevel === 'moderate') {
            // 顯示重要提示
            return hints.filter(h => h.severity !== 'hint');
        } else {
            // 顯示所有提示
            return hints;
        }
    }
    
    /**
     * 顯示建議
     */
    showSuggestions(suggestions, type = 'general') {
        if (!this.suggestionContainer || suggestions.length === 0) return;
        
        // 根據類型決定是否顯示
        if (type === 'realtime' && this.guideLevel === 'minimal') {
            return; // 最小幫助模式下不顯示實時提示
        }
        
        // 創建提示元素
        const container = document.createElement('div');
        container.className = `realtime-guide ${type}`;
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = `guide-item guide-${suggestion.severity || 'info'}`;
            
            const message = document.createElement('div');
            message.className = 'guide-message';
            message.textContent = suggestion.message;
            item.appendChild(message);
            
            if (suggestion.suggestion) {
                const suggestionText = document.createElement('div');
                suggestionText.className = 'guide-suggestion';
                suggestionText.textContent = suggestion.suggestion;
                item.appendChild(suggestionText);
            }
            
            if (suggestion.example) {
                const example = document.createElement('code');
                example.className = 'guide-example';
                example.textContent = suggestion.example;
                item.appendChild(example);
            }
            
            container.appendChild(item);
        });
        
        // 更新容器
        this.suggestionContainer.innerHTML = '';
        this.suggestionContainer.appendChild(container);
        
        // 自動隱藏（除了警告）
        if (type !== 'guidance' || suggestions.every(s => s.severity !== 'warning')) {
            setTimeout(() => {
                if (container.parentElement) {
                    container.style.opacity = '0';
                    setTimeout(() => {
                        if (container.parentElement) {
                            container.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
    }
    
    /**
     * 設置幫助級別
     */
    setGuideLevel(level) {
        this.guideLevel = level;
        // 可以根據級別調整延遲時間
        if (level === 'minimal') {
            this.hintDelay = 5000; // 5秒
        } else if (level === 'moderate') {
            this.hintDelay = 2000; // 2秒
        } else {
            this.hintDelay = 1000; // 1秒
        }
    }
    
    /**
     * 清除所有提示
     */
    clear() {
        if (this.suggestionContainer) {
            this.suggestionContainer.innerHTML = '';
        }
    }
}

// 導出供全局使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeGuide;
}

