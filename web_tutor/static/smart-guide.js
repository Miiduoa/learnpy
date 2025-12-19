/**
 * 智能引導系統
 * 為完全不知道如何開始的學生提供分步驟引導
 */

class SmartGuide {
    constructor(lesson, editor) {
        this.lesson = lesson;
        this.editor = editor;
        this.stepIndex = 0;
        this.guideSteps = [];
        this.stuckTimer = null;
        this.lastCodeLength = 0;
        this.stuckTime = 0;
        this.container = null;
        this.isActive = false;
    }
    
    /**
     * 初始化智能引導
     */
    init(container) {
        this.container = container;
        this.generateGuideSteps();
        this.startStuckDetection();
    }
    
    /**
     * 生成引導步驟
     */
    generateGuideSteps() {
        const exercise = this.lesson.exercise || '';
        const explanation = this.lesson.explanation || '';
        
        // 根據題目類型生成不同的引導步驟
        if (exercise.includes('print')) {
            this.guideSteps = this.generatePrintSteps(exercise);
        } else if (exercise.includes('計算') || exercise.includes('×') || exercise.includes('*')) {
            this.guideSteps = this.generateCalculationSteps(exercise);
        } else if (exercise.includes('if') || exercise.includes('判斷')) {
            this.guideSteps = this.generateIfSteps(exercise);
        } else if (exercise.includes('for') || exercise.includes('迴圈') || exercise.includes('循環')) {
            this.guideSteps = this.generateLoopSteps(exercise);
        } else if (exercise.includes('def') || exercise.includes('函數')) {
            this.guideSteps = this.generateFunctionSteps(exercise);
        } else {
            // 通用引導
            this.guideSteps = this.generateGenericSteps(exercise);
        }
    }
    
    /**
     * 生成 print 相關的引導步驟
     */
    generatePrintSteps(exercise) {
        const steps = [];
        
        // 提取要印出的內容
        const textMatch = exercise.match(/印出[：:]\s*[*"]?([^"*\n]+)[*"]?/);
        const text = textMatch ? textMatch[1].trim() : '';
        
        steps.push({
            step: 1,
            title: '第一步：理解題目',
            description: `題目要求您印出：${text || '某些內容'}`,
            hint: '使用 print() 函式可以將內容顯示在螢幕上',
            code: '', // 不給代碼，只給提示
            showCode: false
        });
        
        steps.push({
            step: 2,
            title: '第二步：開始寫程式',
            description: '在編輯器中輸入 print(',
            hint: 'print 後面要加括號 ()。試試看自己寫，如果寫不出來再點「插入程式碼」',
            code: 'print(',
            showCode: true,
            encourage: true // 標記為鼓勵步驟
        });
        
        if (text) {
            steps.push({
                step: 3,
                title: '第三步：加入要印出的內容',
                description: `在括號內輸入要印出的文字，記得用引號包起來`,
                hint: `使用引號包起來：print("${text}")`,
                code: `print("${text}")`,
                showCode: true
            });
        }
        
        return steps;
    }
    
    /**
     * 生成計算相關的引導步驟
     */
    generateCalculationSteps(exercise) {
        const steps = [];
        
        // 提取計算式
        const multMatch = exercise.match(/(\d+)\s*[×*xX]\s*(\d+)/);
        const addMatch = exercise.match(/(\d+)\s*\+\s*(\d+)/);
        const subMatch = exercise.match(/(\d+)\s*-\s*(\d+)/);
        
        if (multMatch) {
            const num1 = multMatch[1];
            const num2 = multMatch[2];
            steps.push({
                step: 1,
                title: '第一步：理解題目',
                description: `題目要求計算 ${num1} × ${num2}`,
                hint: '在 Python 中，乘法使用 * 符號',
                code: '',
                showCode: false
            });
            
            steps.push({
                step: 2,
                title: '第二步：寫計算式',
                description: '使用 print() 來顯示計算結果',
                hint: `print(${num1} * ${num2})`,
                code: `print(${num1} * ${num2})`,
                showCode: true
            });
        }
        
        return steps;
    }
    
    /**
     * 生成 if 判斷的引導步驟
     */
    generateIfSteps(exercise) {
        const steps = [];
        
        steps.push({
            step: 1,
            title: '第一步：理解條件',
            description: '題目要求根據條件進行判斷',
            hint: '使用 if 語句來檢查條件',
            code: '',
            showCode: false
        });
        
        steps.push({
            step: 2,
            title: '第二步：寫 if 語句',
            description: '從 if 開始寫',
            hint: 'if 後面要寫條件，然後加冒號 :',
            code: 'if 條件:',
            showCode: true
        });
        
        steps.push({
            step: 3,
            title: '第三步：寫要執行的動作',
            description: '在 if 下面（記得縮排）寫要執行的程式',
            hint: '使用縮排（4個空格或 Tab）',
            code: 'if 條件:\n    print("結果")',
            showCode: true
        });
        
        return steps;
    }
    
    /**
     * 生成迴圈的引導步驟
     */
    generateLoopSteps(exercise) {
        const steps = [];
        
        steps.push({
            step: 1,
            title: '第一步：理解迴圈',
            description: '題目要求使用迴圈來重複執行某些操作',
            hint: 'for 迴圈可以讓程式重複執行',
            code: '',
            showCode: false
        });
        
        steps.push({
            step: 2,
            title: '第二步：寫 for 迴圈',
            description: '從 for 開始寫',
            hint: 'for i in range(5): 會執行 5 次',
            code: 'for i in range(5):',
            showCode: true
        });
        
        steps.push({
            step: 3,
            title: '第三步：寫迴圈內的程式',
            description: '在迴圈內（記得縮排）寫要重複執行的程式',
            hint: '使用縮排（4個空格或 Tab）',
            code: 'for i in range(5):\n    print(i)',
            showCode: true
        });
        
        return steps;
    }
    
    /**
     * 生成函數的引導步驟
     */
    generateFunctionSteps(exercise) {
        const steps = [];
        
        steps.push({
            step: 1,
            title: '第一步：理解函數',
            description: '題目要求定義一個函數',
            hint: '使用 def 關鍵字來定義函數',
            code: '',
            showCode: false
        });
        
        steps.push({
            step: 2,
            title: '第二步：定義函數',
            description: '從 def 開始寫',
            hint: 'def 函數名稱():',
            code: 'def my_function():',
            showCode: true
        });
        
        return steps;
    }
    
    /**
     * 生成通用引導步驟
     */
    generateGenericSteps(exercise) {
        return [
            {
                step: 1,
                title: '第一步：仔細閱讀題目',
                description: '請仔細閱讀練習題，理解題目要求',
                hint: '看看題目要求您做什麼',
                code: '',
                showCode: false
            },
            {
                step: 2,
                title: '第二步：查看提示',
                description: '如果題目有提示，點擊「提示」按鈕查看',
                hint: '提示會給您一些方向',
                code: '',
                showCode: false
            },
            {
                step: 3,
                title: '第三步：開始嘗試',
                description: '試著寫一些程式碼，即使不完整也沒關係',
                hint: '可以先寫一部分，然後執行看看',
                code: '',
                showCode: false
            }
        ];
    }
    
    /**
     * 開始檢測學生是否卡住
     * 使用漸進式幫助：輕微提示 → 概念引導 → 完整引導
     */
    startStuckDetection() {
        if (!this.editor) return;
        
        let helpLevel = 0; // 0: 無提示, 1: 輕微提示, 2: 概念引導, 3: 完整引導
        
        // 每10秒檢查一次（減少檢查頻率，給學生更多思考時間）
        setInterval(() => {
            const currentCode = this.editor.value;
            const currentLength = currentCode.trim().length;
            
            // 如果代碼長度沒有變化，增加卡住時間
            if (currentLength === this.lastCodeLength && currentLength < 10) {
                this.stuckTime += 10;
                
                // 漸進式幫助
                if (this.stuckTime >= 60 && helpLevel === 0 && !this.isActive) {
                    // 60秒：顯示輕微提示
                    helpLevel = 1;
                    this.showGentleHint();
                } else if (this.stuckTime >= 120 && helpLevel === 1 && !this.isActive) {
                    // 120秒：顯示概念引導
                    helpLevel = 2;
                    this.showConceptGuide();
                } else if (this.stuckTime >= 180 && helpLevel === 2 && !this.isActive) {
                    // 180秒：顯示完整引導按鈕
                    helpLevel = 3;
                    this.showHelpButton();
                }
            } else {
                // 如果學生有輸入，重置
                if (currentLength > this.lastCodeLength) {
                    this.stuckTime = 0;
                    helpLevel = 0;
                    this.hideAllHints();
                }
                this.lastCodeLength = currentLength;
            }
        }, 10000); // 改為每10秒檢查一次
    }
    
    /**
     * 顯示輕微提示（不給程式碼）
     */
    showGentleHint() {
        if (!this.container || this.isActive) return;
        
        const exercise = this.lesson.exercise || '';
        let hintText = '';
        
        if (exercise.includes('print')) {
            hintText = '💡 提示：試試看使用 print() 函式來顯示內容';
        } else if (exercise.includes('計算') || exercise.includes('×') || exercise.includes('*')) {
            hintText = '💡 提示：可以在 print() 裡面直接寫計算式';
        } else if (exercise.includes('if') || exercise.includes('判斷')) {
            hintText = '💡 提示：使用 if 語句來檢查條件';
        } else if (exercise.includes('for') || exercise.includes('迴圈')) {
            hintText = '💡 提示：使用 for 迴圈來重複執行';
        } else {
            hintText = '💡 提示：仔細閱讀題目，試著寫一些程式碼看看';
        }
        
        const hintDiv = document.createElement('div');
        hintDiv.className = 'gentle-hint';
        hintDiv.innerHTML = `
            <div class="gentle-hint-content">
                ${hintText}
                <div class="hint-encouragement">💪 再試試看，即使錯了也沒關係！錯誤是學習的一部分。</div>
            </div>
        `;
        
        // 添加到編輯器容器
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer && !editorContainer.querySelector('.gentle-hint')) {
            editorContainer.appendChild(hintDiv);
            
            // 10秒後淡出
            setTimeout(() => {
                if (hintDiv.parentElement) {
                    hintDiv.style.opacity = '0';
                    setTimeout(() => hintDiv.remove(), 300);
                }
            }, 10000);
        }
    }
    
    /**
     * 顯示概念引導（解釋為什麼，不給程式碼）
     */
    showConceptGuide() {
        if (!this.container || this.isActive) return;
        
        const exercise = this.lesson.exercise || '';
        let conceptText = '';
        
        if (exercise.includes('print')) {
            conceptText = '📚 概念：print() 用來顯示內容，文字需要用引號包起來，例如 print("Hello")';
        } else if (exercise.includes('計算')) {
            conceptText = '📚 概念：可以在 print() 裡面寫計算式，Python 會先計算再顯示結果';
        } else if (exercise.includes('if')) {
            conceptText = '📚 概念：if 用來檢查條件，如果條件成立就執行下面的程式（記得縮排）';
        } else if (exercise.includes('for')) {
            conceptText = '📚 概念：for 迴圈可以重複執行，例如 for i in range(5): 會執行5次';
        }
        
        if (conceptText) {
            const conceptDiv = document.createElement('div');
            conceptDiv.className = 'concept-guide';
            conceptDiv.innerHTML = `
                <div class="concept-guide-content">
                    ${conceptText}
                    <div class="guide-actions">
                        <button class="need-more-help-btn">我還需要更多幫助</button>
                        <button class="dismiss-concept-btn">我知道了，讓我再試試</button>
                    </div>
                </div>
            `;
            
            const editorContainer = document.getElementById('editor-container');
            if (editorContainer && !editorContainer.querySelector('.concept-guide')) {
                editorContainer.appendChild(conceptDiv);
                
                const moreHelpBtn = conceptDiv.querySelector('.need-more-help-btn');
                moreHelpBtn.onclick = () => {
                    conceptDiv.remove();
                    this.showHelpButton();
                };
                
                const dismissBtn = conceptDiv.querySelector('.dismiss-concept-btn');
                dismissBtn.onclick = () => {
                    conceptDiv.remove();
                    this.stuckTime = 0; // 重置，給學生更多時間
                };
            }
        }
    }
    
    /**
     * 隱藏所有提示
     */
    hideAllHints() {
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            const gentleHint = editorContainer.querySelector('.gentle-hint');
            const conceptGuide = editorContainer.querySelector('.concept-guide');
            const helpButton = editorContainer.querySelector('.smart-help-button');
            
            if (gentleHint) gentleHint.remove();
            if (conceptGuide) conceptGuide.remove();
            if (helpButton) helpButton.remove();
        }
    }
    
    /**
     * 顯示幫助按鈕（完整引導）
     */
    showHelpButton() {
        if (!this.container || this.isActive) return;
        
        // 檢查是否已經有幫助按鈕
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer && editorContainer.querySelector('.smart-help-button')) return;
        
        const helpButton = document.createElement('button');
        helpButton.className = 'smart-help-button';
        helpButton.innerHTML = '🤔 需要逐步引導？點擊這裡（建議先自己嘗試）';
        helpButton.onclick = () => {
            // 先確認學生真的需要幫助
            if (confirm('確定需要逐步引導嗎？建議先自己嘗試，這樣學習效果更好。\n\n點擊「確定」開始引導，點擊「取消」再試試看。')) {
                this.startGuide();
                helpButton.remove();
            }
        };
        
        if (editorContainer) {
            editorContainer.appendChild(helpButton);
        }
    }
    
    /**
     * 開始引導
     */
    startGuide() {
        this.isActive = true;
        this.stepIndex = 0;
        if (this.container) {
            this.container.classList.add('active');
        }
        this.showCurrentStep();
    }
    
    /**
     * 顯示當前步驟
     */
    showCurrentStep() {
        if (this.stepIndex >= this.guideSteps.length) {
            this.showCompletion();
            return;
        }
        
        const step = this.guideSteps[this.stepIndex];
        this.renderStep(step);
    }
    
    /**
     * 渲染步驟
     */
    renderStep(step) {
        if (!this.container) return;
        
        // 清除之前的內容
        this.container.innerHTML = '';
        
        const stepCard = document.createElement('div');
        stepCard.className = 'smart-guide-card';
        
        stepCard.innerHTML = `
            <div class="guide-step-header">
                <span class="step-number">步驟 ${step.step}</span>
                <h4 class="step-title">${step.title}</h4>
            </div>
            <div class="step-description">${step.description}</div>
            <div class="step-hint">💡 ${step.hint}</div>
            ${step.encourage ? `
                <div class="step-encouragement">
                    💪 <strong>建議：</strong>先試著自己寫寫看，即使寫錯了也沒關係！錯誤是學習的重要部分。
                </div>
            ` : ''}
            ${step.showCode ? `
                <div class="step-code-preview">
                    <div class="code-label">參考程式碼（如果實在寫不出來再使用）：</div>
                    <pre><code>${this.escapeHtml(step.code)}</code></pre>
                    <div class="code-warning">⚠️ 注意：直接使用參考程式碼可能降低學習效果，建議先自己嘗試</div>
                    <button class="insert-code-btn" data-code="${this.escapeHtml(step.code)}">
                        📋 插入到編輯器（最後手段）
                    </button>
                </div>
            ` : ''}
            <div class="step-actions">
                ${this.stepIndex > 0 ? '<button class="prev-step-btn">← 上一步</button>' : ''}
                <button class="next-step-btn">${this.stepIndex < this.guideSteps.length - 1 ? '下一步 →' : '完成'}</button>
                <button class="close-guide-btn">關閉引導，我自己試試</button>
            </div>
        `;
        
        // 綁定事件
        const nextBtn = stepCard.querySelector('.next-step-btn');
        nextBtn.onclick = () => {
            this.stepIndex++;
            this.showCurrentStep();
        };
        
        const prevBtn = stepCard.querySelector('.prev-step-btn');
        if (prevBtn) {
            prevBtn.onclick = () => {
                this.stepIndex--;
                this.showCurrentStep();
            };
        }
        
        const closeBtn = stepCard.querySelector('.close-guide-btn');
        closeBtn.onclick = () => {
            this.closeGuide();
        };
        
        const insertBtn = stepCard.querySelector('.insert-code-btn');
        if (insertBtn) {
            insertBtn.onclick = () => {
                const code = insertBtn.dataset.code;
                if (this.editor) {
                    this.editor.value = code;
                    this.editor.focus();
                    // 觸發 input 事件以更新行號等
                    this.editor.dispatchEvent(new Event('input'));
                }
            };
        }
        
        this.container.appendChild(stepCard);
    }
    
    /**
     * 顯示完成訊息
     */
    showCompletion() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="smart-guide-card guide-complete">
                <div class="complete-icon">✅</div>
                <h4>引導完成！</h4>
                <p>您已經了解了基本步驟，現在可以嘗試自己完成程式碼了。</p>
                <p>如果還有問題，可以：</p>
                <ul>
                    <li>查看「提示」按鈕</li>
                    <li>查看「範例」程式碼</li>
                    <li>重新開始引導</li>
                </ul>
                <button class="restart-guide-btn">重新開始引導</button>
                <button class="close-guide-btn">關閉</button>
            </div>
        `;
        
        const restartBtn = this.container.querySelector('.restart-guide-btn');
        restartBtn.onclick = () => {
            this.stepIndex = 0;
            this.showCurrentStep();
        };
        
        const closeBtn = this.container.querySelector('.close-guide-btn');
        closeBtn.onclick = () => {
            this.closeGuide();
        };
    }
    
    /**
     * 關閉引導
     */
    closeGuide() {
        this.isActive = false;
        if (this.container) {
            this.container.classList.remove('active');
            this.container.innerHTML = '';
        }
        // 移除幫助按鈕
        const helpButton = document.querySelector('.smart-help-button');
        if (helpButton) {
            helpButton.remove();
        }
    }
    
    /**
     * HTML 轉義
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartGuide;
}

