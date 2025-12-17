document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const lessonTitle = document.getElementById('lesson-title');
    const lessonExplanation = document.getElementById('lesson-explanation');
    const lessonExercise = document.getElementById('lesson-exercise');
    const lessonHint = document.getElementById('lesson-hint');
    const codeEditor = document.getElementById('code-editor');
    const runButton = document.getElementById('run-button');
    const outputConsole = document.getElementById('output-console');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const lessonCounter = document.getElementById('lesson-counter');
    const lessonBadge = document.getElementById('lesson-badge');
    const progressFill = document.getElementById('progress-fill');
    const loadingOverlay = document.getElementById('loading-overlay');
    const runLoading = document.getElementById('run-loading');
    const toggleHint = document.getElementById('toggle-hint');
    const clearButton = document.getElementById('clear-button');
    const clearOutput = document.getElementById('clear-output');
    const lineNumbers = document.getElementById('line-numbers');
    const envStatus = document.getElementById('env-status');
    const envStatusValue = document.getElementById('env-status-value');
    const draftStatus = document.getElementById('draft-status');
    const draftStatusValue = document.getElementById('draft-status-value');
    const lessonProgressLabel = document.getElementById('lesson-progress-label');
    const focusModeToggle = document.getElementById('focus-mode-toggle');
    // jumpToEditor 在後面定義為函數，這裡不需要重複聲明

    // --- DOM Elements for Input ---
    const inputContainer = document.getElementById('input-container');
    const userInput = document.getElementById('user-input');
    const inputPrompt = document.getElementById('input-prompt');
    const submitInput = document.getElementById('submit-input');

    // --- DOM Elements for Sidebar ---
    const sidebar = document.getElementById('lesson-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const lessonList = document.getElementById('lesson-list');
    const lessonSearch = document.getElementById('lesson-search');
    const lessonCount = document.getElementById('lesson-count');
    const compareOutput = document.getElementById('compare-output');
    const expectedOutput = document.getElementById('expected-output');
    const actualOutput = document.getElementById('actual-output');
    const outputComparison = document.getElementById('output-comparison');
    const completionRate = document.getElementById('completion-rate');
    const toggleExplanation = document.getElementById('toggle-explanation');
    const showExample = document.getElementById('show-example');
    const exampleCode = document.getElementById('example-code');
    const exampleCodeContent = document.getElementById('example-code-content');
    const copyExample = document.getElementById('copy-example');
    const resetButton = document.getElementById('reset-button');
    const lessonStatus = document.getElementById('lesson-status');
    const errorDetails = document.getElementById('error-details');
    const errorContent = document.getElementById('error-content');
    const completionBadge = document.getElementById('completion-badge');
    const completionText = document.getElementById('completion-text');
    const lessonCounterHeader = document.getElementById('lesson-counter-header');
    const completionRateHeader = document.getElementById('completion-rate-header');
    const nextStepText = document.getElementById('next-step-text');
    const nextStepButton = document.getElementById('next-step-button');
    const nextStepHint = document.getElementById('next-step-hint');
    const runFloating = document.getElementById('run-floating');
    const floatingActions = document.getElementById('floating-actions');
    const floatingJump = document.getElementById('floating-jump');
    const expectedOutputCard = document.getElementById('expected-output-card');
    const expectedOutputPreview = document.getElementById('expected-output-preview');
    const completionCriteria = document.getElementById('completion-criteria');
    const themeToggle = document.getElementById('theme-toggle');
    const formatButton = document.getElementById('format-button');
    const historyButton = document.getElementById('history-button');
    const exportProgressButton = document.getElementById('export-progress');
    const importProgressButton = document.getElementById('import-progress');
    const importFileInput = document.getElementById('import-file');
    const resetDataButton = document.getElementById('reset-data');
    const showStats = document.getElementById('show-stats');
    const modePyodide = document.getElementById('mode-pyodide');
    const modeServer = document.getElementById('mode-server');
    const runModeTip = document.getElementById('run-mode-tip');
    const workflowSteps = {
        read: document.querySelector('.workflow-step[data-step="read"]'),
        build: document.querySelector('.workflow-step[data-step="build"]'),
        verify: document.querySelector('.workflow-step[data-step="verify"]')
    };

    // --- App State ---
    let lessons = [];
    let currentLessonIndex = 0;
    let pyodide = null;
    let pyodideReady = false;
    let pyodideLoadingPromise = null;
    let pyodideFailed = false;
    let inputResolver = null;
    let hintVisible = false;
    let completedLessons = new Set();
    let lastResult = null;
    let lessonDrafts = {};
    let draftSaveTimeout = null;
    let nextStepTarget = null;
    let codeHistory = {}; // Store code history for each lesson
    let learningStats = {}; // Store learning statistics
    let executionMode = 'pyodide'; // pyodide | server
    let realtimeGuide = null; // Realtime guide system
    let smartGuide = null; // Smart guide system for stuck students

    // --- Loading Overlay Management ---
    const loadingStatus = document.getElementById('loading-status');
    const diagnosticBtn = document.getElementById('diagnostic-btn');

    function showLoading(text = '正在載入...') {
        if (loadingOverlay) {
            const loadingText = loadingOverlay.querySelector('.loading-text');
            if (loadingText) loadingText.textContent = text;
            loadingOverlay.classList.remove('hidden');
        }
    }

    function hideLoading() {
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 300);
        }
    }

    function updateLoadingStatus(message) {
        if (loadingStatus) {
            loadingStatus.textContent = message;
        }
    }

    // --- Diagnostic Tool ---
    async function runDiagnostics() {
        if (!loadingStatus) return;

        const results = [];
        loadingStatus.innerHTML = '🔍 正在診斷...<br>';

        // Test 1: Check network connectivity
        loadingStatus.innerHTML += '1. 檢查網絡連接...<br>';
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            results.push('✓ 網絡連接正常');
            loadingStatus.innerHTML += '   ✓ 網絡連接正常<br>';
        } catch (e) {
            results.push('✗ 網絡連接異常');
            loadingStatus.innerHTML += '   ✗ 網絡連接異常<br>';
        }

        // Test 2: Check CDN accessibility
        loadingStatus.innerHTML += '2. 檢查 CDN 可訪問性...<br>';
        const cdns = [
            'https://cdn.jsdelivr.net',
            'https://unpkg.com'
        ];

        for (const cdn of cdns) {
            try {
                const testUrl = `${cdn}/pyodide/v0.24.1/full/pyodide.js`;
                const response = await fetch(testUrl, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                results.push(`✓ ${cdn} 可訪問`);
                loadingStatus.innerHTML += `   ✓ ${cdn} 可訪問<br>`;
                break;
            } catch (e) {
                results.push(`✗ ${cdn} 無法訪問`);
                loadingStatus.innerHTML += `   ✗ ${cdn} 無法訪問<br>`;
            }
        }

        // Test 3: Check if loadPyodide is defined
        loadingStatus.innerHTML += '3. 檢查 Pyodide 腳本...<br>';
        if (typeof loadPyodide !== 'undefined') {
            results.push('✓ Pyodide 腳本已載入');
            loadingStatus.innerHTML += '   ✓ Pyodide 腳本已載入<br>';
        } else {
            results.push('✗ Pyodide 腳本未載入');
            loadingStatus.innerHTML += '   ✗ Pyodide 腳本未載入<br>';
        }

        // Test 4: Check Pyodide instance
        loadingStatus.innerHTML += '4. 檢查 Pyodide 實例...<br>';
        if (pyodide) {
            results.push('✓ Pyodide 實例存在');
            loadingStatus.innerHTML += '   ✓ Pyodide 實例存在<br>';
        } else {
            results.push('✗ Pyodide 實例不存在');
            loadingStatus.innerHTML += '   ✗ Pyodide 實例不存在<br>';
        }

        // Summary
        loadingStatus.innerHTML += '<br><strong>診斷完成</strong><br>';
        loadingStatus.innerHTML += results.join('<br>');

        // Add recommendations
        const hasNetworkIssue = results.some(r => r.includes('網絡') && r.startsWith('✗'));
        const hasCDNIssue = results.some(r => r.includes('CDN') && r.startsWith('✗'));

        if (hasNetworkIssue || hasCDNIssue) {
            loadingStatus.innerHTML += '<br><br><strong>💡 建議：</strong><br>';
            loadingStatus.innerHTML += '1. 檢查網絡連接<br>';
            loadingStatus.innerHTML += '2. 嘗試使用 VPN<br>';
            loadingStatus.innerHTML += '3. 檢查防火牆設置<br>';
            loadingStatus.innerHTML += '4. 嘗試刷新頁面<br>';
        }

        // Add retry button
        if (!pyodideReady) {
            const retryBtn = document.createElement('button');
            retryBtn.textContent = '🔄 強制重試載入';
            retryBtn.className = 'diagnostic-button';
            retryBtn.style.marginTop = '10px';
            retryBtn.onclick = () => {
                pyodideFailed = false;
                pyodideLoadingPromise = null;
                pyodide = null;
                pyodideReady = false;
                updateLoadingStatus('正在重新載入...');
                initializePyodide({ background: false });
            };
            if (loadingStatus.parentElement) {
                const existingRetry = loadingStatus.parentElement.querySelector('.force-retry-btn');
                if (existingRetry) existingRetry.remove();
                retryBtn.classList.add('force-retry-btn');
                loadingStatus.parentElement.appendChild(retryBtn);
            }
        }
    }

    if (diagnosticBtn) {
        diagnosticBtn.addEventListener('click', runDiagnostics);
    }

    // --- Status Helpers ---
    function setEnvState(state, label) {
        if (envStatus) envStatus.dataset.state = state;
        if (envStatusValue && label) envStatusValue.textContent = label;
    }

    function setDraftState(state) {
        if (draftStatus) draftStatus.dataset.state = state;
        if (draftStatusValue) {
            const labels = {
                empty: '尚未輸入',
                dirty: '草稿未儲存',
                saved: '已自動保存',
                restored: '已載入草稿',
                error: '無法保存'
            };
            draftStatusValue.textContent = labels[state] || state;
        }
    }

    function getDefaultRunModeTip(mode) {
        return mode === 'server'
            ? '伺服器模式 - Pyodide 無法使用時的備援，input() 會預先詢問'
            : '本地 (Pyodide) - 支援互動輸入與即時提示';
    }

    function setExecutionMode(mode, options = {}) {
        if (!['pyodide', 'server'].includes(mode)) return;
        executionMode = mode;
        const tipText = options.tip || getDefaultRunModeTip(mode);
        if (modePyodide) {
            modePyodide.classList.toggle('active', mode === 'pyodide');
            modePyodide.setAttribute('aria-pressed', mode === 'pyodide');
        }
        if (modeServer) {
            modeServer.classList.toggle('active', mode === 'server');
            modeServer.setAttribute('aria-pressed', mode === 'server');
        }
        if (runModeTip) runModeTip.textContent = tipText;

        if (options.auto && mode === 'server') {
            if (outputConsole) {
                outputConsole.textContent = `⚠️ ${options.reason || '本地執行環境不可用，已自動切換到伺服器模式。'}\n${tipText}`;
                outputConsole.className = 'error';
            }
        }
    }

    // Default run mode UI state
    setExecutionMode('pyodide');

    function updateLessonProgressLabel() {
        if (!lessonProgressLabel) return;
        if (lessons.length === 0) {
            lessonProgressLabel.textContent = '尚未載入';
            return;
        }
        lessonProgressLabel.textContent = `單元 ${currentLessonIndex + 1} / ${lessons.length}`;
    }

    function markWorkflowStep(step, state, text) {
        const indicator = workflowSteps[step];
        if (!indicator) return;
        const statusMap = {
            done: 'completed',
            active: 'active',
            pending: 'pending',
            alert: 'alert'
        };
        const mappedStatus = statusMap[state] || 'pending';
        indicator.dataset.status = mappedStatus;
        if (text) {
            indicator.title = text;
        }
    }

    function setNextStep(targetId, copy, hint) {
        nextStepTarget = targetId;
        if (nextStepText && copy) nextStepText.textContent = copy;
        if (nextStepHint) nextStepHint.textContent = hint || '';
    }

    function updateWorkflowState() {
        const hasCode = codeEditor ? codeEditor.value.trim().length > 0 : false;
        const hasRun = lastResult !== null;
        const isCorrect = lastResult?.is_correct;
        const hasError = Boolean(lastResult?.stderr);

        markWorkflowStep('read', hasCode || hasRun ? 'done' : 'active', hasCode || hasRun ? '已確認需求' : '閱讀題目與練習');
        if (hasCode) {
            markWorkflowStep('build', 'active', '撰寫中 · 草稿自動保存');
        } else {
            markWorkflowStep('build', 'pending', '尚未輸入');
        }

        if (isCorrect) {
            markWorkflowStep('verify', 'done', '輸出符合預期');
        } else if (hasRun) {
            markWorkflowStep('verify', hasError ? 'alert' : 'active', hasError ? '請修正錯誤後再試' : '檢查輸出與提示');
        } else {
            markWorkflowStep('verify', 'pending', '等待執行');
        }

        if (!hasCode && !hasRun) {
            setNextStep('lesson-explanation', '先閱讀課程說明，確認輸入/輸出需求。', '左側說明區');
        } else if (hasCode && !hasRun) {
            setNextStep('run-button', '執行你的程式碼並觀察輸出。', 'Ctrl+Enter 快捷鍵');
        } else if (hasRun && !isCorrect) {
            const targetId = hasError ? 'error-details' : 'output-section';
            const copy = hasError ? '查看錯誤詳情，修正程式後再次執行。' : '對比輸出與預期，微調後再跑一次。';
            const hint = hasError ? '下方「錯誤詳情」' : '點 🔍 對比輸出';
            setNextStep(targetId, copy, hint);
        } else if (isCorrect) {
            const hasNext = nextButton && !nextButton.disabled;
            const targetId = hasNext ? 'next-button' : 'lesson-sidebar';
            const copy = hasNext ? '完成本單元，可以前往下一題。' : '完成本單元，回到課程列表或再練一次。';
            const hint = hasNext ? '→ 下一單元' : '開啟課程列表';
            setNextStep(targetId, copy, hint);
        }
    }

    // 初始化狀態
    setEnvState('loading', '準備中');
    setDraftState('empty');

    // --- Line Numbers for Editor ---
    function updateLineNumbers() {
        if (!lineNumbers || !codeEditor) return;
        const lines = codeEditor.value.split('\n').length;
        const lineNumbersHTML = Array.from({ length: Math.max(lines, 15) }, (_, i) => i + 1)
            .map(num => `<div>${num}</div>`)
            .join('');
        lineNumbers.innerHTML = lineNumbersHTML;
    }

    codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        setDraftState('dirty');
        updateWorkflowState();
        scheduleDraftSave();
    });
    codeEditor.addEventListener('scroll', () => {
        if (lineNumbers) {
            lineNumbers.scrollTop = codeEditor.scrollTop;
        }
    });

    // --- Pyodide Initialization ---
    async function initializePyodide(options = {}) {
        const { background = false } = options;

        if (pyodideReady) {
            setEnvState('ready', '就緒 · 可執行');
            return true;
        }
        if (pyodideLoadingPromise) return pyodideLoadingPromise;

        pyodideLoadingPromise = (async () => {
            try {
                setEnvState('loading', '正在載入執行環境...');
                if (!background) showLoading('正在載入 Python 執行環境...');
                outputConsole.textContent = '正在載入 Python 執行環境...';
                console.log('Starting Pyodide load...');

                // Load Pyodide script if not already loaded
                if (typeof loadPyodide === 'undefined') {
                    console.log('[PYODIDE] 腳本未找到，開始動態載入...');
                    updateLoadingStatus('步驟 1/3: 載入 Pyodide 腳本...');
                    try {
                        await loadPyodideScript();
                        updateLoadingStatus('步驟 1/3: ✓ 腳本載入成功');
                        console.log('[PYODIDE] ✓ 腳本載入成功');
                    } catch (scriptError) {
                        console.error('[PYODIDE] 腳本載入失敗:', scriptError);
                        updateLoadingStatus(`步驟 1/3: ✗ 腳本載入失敗: ${scriptError.message}`);
                        throw new Error(`無法載入 Pyodide 腳本：${scriptError.message}\n\n請檢查：\n1. 網絡連接是否正常\n2. 瀏覽器是否阻止了外部腳本\n3. 嘗試刷新頁面或使用 VPN`);
                    }
                } else {
                    console.log('[PYODIDE] 腳本已存在');
                    updateLoadingStatus('步驟 1/3: ✓ 腳本已存在');
                }

                // Add timeout for Pyodide loading (60 seconds - increased for slow networks)
                const loadTimeout = new Promise((_, reject) => {
                    setTimeout(() => {
                        const errorMsg = '載入超時（60秒）：Pyodide 載入時間過長。\n\n可能原因：\n1. 網絡連接速度較慢\n2. CDN 無法訪問\n3. 防火牆阻止了外部資源\n\n💡 解決方案：\n1. 檢查網絡連接\n2. 嘗試使用 VPN\n3. 點擊「🔍 診斷問題」按鈕查看詳細信息\n4. 如果問題持續，請刷新頁面重試';
                        updateLoadingStatus('✗ 載入超時！請點擊「診斷問題」查看詳情');
                        reject(new Error(errorMsg));
                    }, 60000); // 60 seconds timeout (increased from 45)
                });

                // Show progress updates
                updateLoadingStatus('步驟 2/3: 初始化 Pyodide 環境...');
                let progressInterval;
                let elapsedSeconds = 0;
                progressInterval = setInterval(() => {
                    elapsedSeconds += 5;
                    if (elapsedSeconds <= 45) {
                        const remaining = 45 - elapsedSeconds;
                        if (!background && outputConsole) {
                            outputConsole.textContent = `正在載入 Python 執行環境... (已等待 ${elapsedSeconds} 秒，剩餘約 ${remaining} 秒)`;
                        }
                        if (envStatusValue) {
                            envStatusValue.textContent = `載入中... (${elapsedSeconds}s)`;
                        }
                        if (loadingStatus) {
                            loadingStatus.innerHTML = `步驟 2/3: 初始化 Pyodide 環境...<br>已等待 ${elapsedSeconds} 秒，剩餘約 ${remaining} 秒`;
                        }
                    }
                }, 5000);

                try {
                    // Try multiple CDN URLs for Pyodide
                    const pyodideUrls = [
                        'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
                        'https://unpkg.com/pyodide@0.24.1/full/',
                        'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
                        'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'
                    ];

                    let pyodideLoaded = false;
                    let lastPyodideError = null;

                    for (let i = 0; i < pyodideUrls.length && !pyodideLoaded; i++) {
                        const indexURL = pyodideUrls[i];
                        try {
                            console.log(`[PYODIDE] 嘗試從 ${indexURL} 初始化 Pyodide... (${i + 1}/${pyodideUrls.length})`);
                            if (outputConsole) {
                                outputConsole.textContent = `正在初始化 Pyodide... (來源 ${i + 1}/${pyodideUrls.length})\n這可能需要 30-60 秒，請耐心等待...`;
                            }
                            if (loadingStatus) {
                                loadingStatus.innerHTML = `步驟 2/3: 初始化 Pyodide 環境...<br>嘗試來源 ${i + 1}/${pyodideUrls.length}: ${indexURL}<br>這可能需要 30-60 秒，請耐心等待...`;
                            }

                            // Create a timeout for this specific URL attempt (30 seconds)
                            const urlTimeout = new Promise((_, reject) => {
                                setTimeout(() => {
                                    reject(new Error(`來源 ${i + 1} 初始化超時（30秒）`));
                                }, 30000);
                            });

                            // Race between loading, URL timeout, and overall timeout
                            pyodide = await Promise.race([
                                loadPyodide({ indexURL }),
                                urlTimeout,
                                loadTimeout
                            ]);

                            pyodideLoaded = true;
                            console.log(`[PYODIDE] ✓ 成功從 ${indexURL} 初始化`);
                            if (loadingStatus) {
                                loadingStatus.innerHTML = `步驟 2/3: ✓ 成功從來源 ${i + 1} 初始化`;
                            }

                            // Clear progress interval on success
                            if (progressInterval) clearInterval(progressInterval);
                            break;
                        } catch (err) {
                            lastPyodideError = err;
                            console.error(`[PYODIDE] 從 ${indexURL} 初始化失敗:`, err);

                            if (loadingStatus) {
                                loadingStatus.innerHTML = `步驟 2/3: ✗ 來源 ${i + 1} 失敗: ${err.message}<br>嘗試下一個來源...`;
                            }

                            if (i < pyodideUrls.length - 1) {
                                if (outputConsole) {
                                    outputConsole.textContent = `來源 ${i + 1} 失敗，嘗試下一個來源...\n錯誤: ${err.message}`;
                                }
                                // Wait a bit before trying next URL
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            } else {
                                // Last URL failed
                                if (loadingStatus) {
                                    loadingStatus.innerHTML = `步驟 2/3: ✗ 所有來源都失敗了<br>最後錯誤: ${err.message}`;
                                }
                            }
                        }
                    }

                    if (!pyodideLoaded) {
                        throw lastPyodideError || new Error('所有 Pyodide CDN 來源都無法訪問');
                    }
                } catch (err) {
                    // Clear progress interval on error
                    if (progressInterval) clearInterval(progressInterval);
                    throw err;
                }

                console.log('[PYODIDE] Pyodide 載入完成，開始設置環境...');
                updateLoadingStatus('步驟 3/3: 設置 Python 環境...');

                // Set up stdout/stderr capture
                pyodide.runPython(`
import sys
from io import StringIO

class Capturing(list):
    def __enter__(self):
        self._stdout = sys.stdout
        self._stderr = sys.stderr
        sys.stdout = self._stringio_stdout = StringIO()
        sys.stderr = self._stringio_stderr = StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio_stdout.getvalue().splitlines())
        self.stderr = self._stringio_stderr.getvalue()
        sys.stdout = self._stdout
        sys.stderr = self._stderr
                `);

                // Initialize input state for async input handling
                window._currentInputResolver = null;

                // Set up custom input() function for Pyodide
                try {
                    const getInputAsync = (promptText) => {
                        console.log('[INPUT] getInputAsync called with:', promptText);

                        const promptStr = String(promptText || "請輸入：");

                        if (!inputContainer) {
                            console.error('[INPUT] ERROR: inputContainer not found!');
                            return Promise.resolve("");
                        }

                        // Scroll input container into view
                        try {
                            inputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        } catch (e) {
                            console.warn('[INPUT] scrollIntoView failed:', e);
                        }

                        // Show input container with animation
                        inputPrompt.textContent = promptStr;
                        inputContainer.style.display = 'block';
                        inputContainer.style.opacity = '0';
                        inputContainer.style.transform = 'translateY(-10px)';

                        // Force reflow for animation
                        void inputContainer.offsetHeight;

                        // Animate in
                        inputContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        inputContainer.style.opacity = '1';
                        inputContainer.style.transform = 'translateY(0)';

                        userInput.value = '';

                        // Focus input field
                        setTimeout(() => {
                            try {
                                userInput.focus();
                            } catch (e) {
                                console.warn('[INPUT] Focus failed:', e);
                            }
                        }, 100);

                        // Create a promise that will be resolved when user submits
                        return new Promise((resolve) => {
                            window._currentInputResolver = resolve;

                            // Set timeout to prevent infinite waiting
                            setTimeout(() => {
                                if (window._currentInputResolver === resolve) {
                                    console.warn('[INPUT] Input timeout after 5 minutes');
                                    window._currentInputResolver = null;
                                    inputContainer.style.display = 'none';
                                    resolve("");
                                }
                            }, 300000); // 5 minutes timeout
                        });
                    };

                    // Expose async version to Python
                    pyodide.globals.set('_js_get_input_async', getInputAsync);
                    console.log('[INPUT] _js_get_input_async function set in globals');

                    // Set up input() function in Python
                    pyodide.runPython(`
import builtins

js_get_input_async = _js_get_input_async

async def _async_input(prompt_text=""):
    """Async implementation of input() that works with runPythonAsync."""
    try:
        prompt_str = str(prompt_text) if prompt_text else ""
        result = await js_get_input_async(prompt_str)
        if result is None:
            return ""
        return str(result)
    except Exception as e:
        import sys
        print(f"Input error: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc()
        return ""

builtins.input = _async_input
                    `);
                    console.log('[INPUT] Custom input() function set up successfully');
                } catch (inputError) {
                    console.error('[INPUT] Failed to set up input() function:', inputError);
                    // Fallback: return empty string if setup fails
                    try {
                        pyodide.runPython(`
import builtins
def _fallback_input(prompt_text=""):
    return ""
builtins.input = _fallback_input
                        `);
                        console.log('[INPUT] Fallback input() function set up');
                    } catch (fallbackError) {
                        console.error('[INPUT] Failed to set up fallback input():', fallbackError);
                    }
                }

                pyodideReady = true;
                pyodideFailed = false;
                setEnvState('ready', '就緒 · 可執行');
                outputConsole.textContent = '✅ Python 執行環境已就緒！';
                outputConsole.className = '';
                updateLoadingStatus('✓ 所有步驟完成！');
                console.log('[PYODIDE] ✓ 初始化成功');
                return true;
            } catch (error) {
                console.error('[PYODIDE] 載入失敗:', error);
                const errorMessage = error.message || '未知錯誤';

                // Create a more helpful error message
                let detailedError = `❌ 載入 Python 執行環境失敗\n\n錯誤詳情：${errorMessage}\n\n`;

                if (errorMessage.includes('超時') || errorMessage.includes('timeout')) {
                    detailedError += `💡 這可能是網絡連接問題：\n`;
                    detailedError += `1. 檢查您的網絡連接是否正常\n`;
                    detailedError += `2. 如果使用 VPN，請嘗試切換節點\n`;
                    detailedError += `3. 檢查防火牆是否阻止了 CDN 訪問\n`;
                    detailedError += `4. 嘗試刷新頁面 (F5 或 Ctrl+R)\n`;
                    detailedError += `5. 如果問題持續，請稍後再試（CDN 可能暫時無法訪問）\n\n`;
                } else if (errorMessage.includes('CDN') || errorMessage.includes('無法訪問')) {
                    detailedError += `💡 CDN 無法訪問的解決方案：\n`;
                    detailedError += `1. 檢查網絡連接\n`;
                    detailedError += `2. 嘗試使用 VPN 或代理\n`;
                    detailedError += `3. 檢查瀏覽器是否阻止了外部資源\n`;
                    detailedError += `4. 查看瀏覽器控制台 (F12) 獲取更多信息\n\n`;
                } else {
                    detailedError += `💡 一般解決方案：\n`;
                    detailedError += `1. 檢查網絡連接是否正常\n`;
                    detailedError += `2. 嘗試刷新頁面 (F5 或 Ctrl+R)\n`;
                    detailedError += `3. 檢查瀏覽器控制台 (F12) 查看詳細錯誤\n`;
                    detailedError += `4. 清除瀏覽器緩存後重試\n`;
                    detailedError += `5. 如果問題持續，請稍後再試\n\n`;
                }

                detailedError += `📝 技術信息：\n`;
                detailedError += `- 嘗試了多個 CDN 來源\n`;
                detailedError += `- 載入超時時間：45 秒\n`;
                detailedError += `- 如果問題持續，可能是網絡環境限制\n`;

                if (outputConsole) {
                    outputConsole.textContent = detailedError;
                    outputConsole.className = 'error';
                }

                pyodideReady = false;
                pyodideFailed = true;
                pyodide = null;
                setEnvState('error', '載入失敗');
                setExecutionMode('server', { auto: true, reason: 'Pyodide 載入失敗，已自動切換到伺服器模式。' });

                // Show error in loading overlay if visible
                if (!background && loadingOverlay) {
                    const loadingText = loadingOverlay.querySelector('.loading-text');
                    if (loadingText) {
                        loadingText.textContent = `載入失敗：${errorMessage.split('\n')[0]}`;
                        loadingText.style.color = 'var(--error-color)';
                    }
                }

                // Add retry button
                if (outputConsole && outputConsole.parentElement) {
                    // Remove existing retry button if any
                    const existingRetry = outputConsole.parentElement.querySelector('.retry-python-button');
                    if (existingRetry) {
                        existingRetry.remove();
                    }

                    const retryButton = document.createElement('button');
                    retryButton.className = 'retry-python-button primary-button';
                    retryButton.textContent = '🔄 重試載入 Pyodide';
                    retryButton.style.marginTop = '10px';
                    retryButton.onclick = () => {
                        retryButton.remove();
                        outputConsole.textContent = '正在重新載入 Pyodide...';
                        outputConsole.className = '';
                        setEnvState('loading', '重新載入中...');
                        pyodideFailed = false;
                        pyodideLoadingPromise = null;
                        initializePyodide({ background: false });
                    };
                    outputConsole.parentElement.appendChild(retryButton);
                }

                return false;
            } finally {
                if (!background) {
                    // Delay hiding to show error message if any
                    setTimeout(() => {
                        hideLoading();
                    }, 2000);
                }
                pyodideLoadingPromise = null;
            }
        })();

        return pyodideLoadingPromise;
    }

    async function preparePyodideBackground() {
        if (pyodideReady || pyodideLoadingPromise) {
            return pyodideReady;
        }
        if (pyodideFailed) {
            console.log('Pyodide previously failed, skipping background load');
            return false;
        }

        try {
            const result = await initializePyodide({ background: true });
            return result;
        } catch (err) {
            console.error('Background Pyodide load failed:', err);
            pyodideFailed = true;
            setEnvState('error', '載入失敗');
            setExecutionMode('server', { auto: true, reason: '背景載入失敗，改用伺服器模式執行。' });
            return false;
        }
    }

    async function ensurePyodideReady() {
        if (pyodideReady) return true;

        // Check if we're already loading
        if (pyodideLoadingPromise) {
            outputConsole.textContent = '⏳ Python 執行環境正在載入中，請稍候...';
            outputConsole.className = '';
            try {
                const result = await pyodideLoadingPromise;
                return result;
            } catch (err) {
                outputConsole.textContent = `❌ Python 執行環境載入失敗：${err.message}\n\n請點擊「🔄 重試載入」按鈕重試。`;
                outputConsole.className = 'error';
                return false;
            }
        }

        // Check if previously failed
        if (pyodideFailed) {
            outputConsole.textContent = '❌ Python 執行環境之前載入失敗。\n\n請點擊「🔄 重試載入」按鈕重試，或刷新頁面。';
            outputConsole.className = 'error';
            setExecutionMode('server', { auto: true, reason: '本地環境不可用，請改用伺服器模式或稍後重試。' });
            return false;
        }

        outputConsole.textContent = '⏳ 正在準備 Python 執行環境...';
        outputConsole.className = '';
        const ready = await initializePyodide();
        if (!ready) {
            outputConsole.textContent = '❌ Python 執行環境載入失敗，請確認網絡後再試一次。\n\n💡 如果問題持續，請：\n1. 檢查網絡連接\n2. 嘗試刷新頁面\n3. 查看瀏覽器控制台 (F12)';
            outputConsole.className = 'error';
        }
        return ready;
    }

    // --- Progress Management ---
    function loadProgress() {
        try {
            const saved = localStorage.getItem('python_tutor_progress');
            if (saved) {
                const data = JSON.parse(saved);
                completedLessons = new Set(data.completedLessons || []);
                if (data.currentLessonIndex !== undefined && data.currentLessonIndex < lessons.length) {
                    currentLessonIndex = data.currentLessonIndex;
                }
            }
        } catch (e) {
            console.warn('Failed to load progress:', e);
        }
    }

    function saveProgress() {
        try {
            const data = {
                currentLessonIndex,
                completedLessons: Array.from(completedLessons),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('python_tutor_progress', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    }

    function normalizeLessonIndex(index) {
        if (!lessons || lessons.length === 0) return 0;
        if (Number.isNaN(index) || index < 0) return 0;
        if (index >= lessons.length) return lessons.length - 1;
        return index;
    }

    async function importProgressFromFile(file) {
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data || typeof data !== 'object') {
                throw new Error('檔案格式不正確，請確認是由系統匯出的 JSON 檔。');
            }

            const { progress, statistics, codeHistory: importedHistory, drafts } = data;
            if (!progress || !Array.isArray(progress.completedLessons)) {
                throw new Error('檔案缺少 progress.completedLessons，無法匯入。');
            }

            completedLessons = new Set(progress.completedLessons);
            const importedIndex = Number(progress.currentLessonIndex ?? 0);
            currentLessonIndex = normalizeLessonIndex(Number.isNaN(importedIndex) ? 0 : importedIndex);
            learningStats = statistics || {};
            codeHistory = importedHistory || {};
            lessonDrafts = drafts || {};

            saveProgress();
            saveLearningStats();
            saveCodeHistory();
            saveDrafts();

            renderLessonList(lessonSearch ? lessonSearch.value : '');
            updateCompletionRate();
            if (lessons.length > 0) {
                loadLesson(currentLessonIndex);
            }

            if (outputConsole) {
                outputConsole.textContent = '✅ 已成功匯入進度與草稿，可繼續學習。';
                outputConsole.className = '';
            }
        } catch (e) {
            console.error('匯入進度失敗：', e);
            alert(`匯入失敗：${e.message || e}`);
        } finally {
            if (importFileInput) {
                importFileInput.value = '';
            }
        }
    }

    function resetLocalData() {
        const confirmed = confirm('確定要清除本地的草稿、歷史、統計與進度嗎？此動作無法復原。');
        if (!confirmed) return;

        completedLessons = new Set();
        lessonDrafts = {};
        codeHistory = {};
        learningStats = {};
        currentLessonIndex = 0;

        try {
            localStorage.removeItem('python_tutor_progress');
            localStorage.removeItem('python_tutor_drafts');
            localStorage.removeItem('python_tutor_code_history');
            localStorage.removeItem('python_tutor_learning_stats');
        } catch (e) {
            console.warn('清除 localStorage 失敗：', e);
        }

        saveProgress();
        saveDrafts();
        saveCodeHistory();
        saveLearningStats();
        updateCompletionRate();
        if (lessons.length > 0) {
            loadLesson(0);
        }
        renderLessonList(lessonSearch ? lessonSearch.value : '');

        if (outputConsole) {
            outputConsole.textContent = '🧹 已清除本地資料，重新開始！';
            outputConsole.className = '';
        }
    }

    function updateCompletionRate() {
        if (lessons.length === 0) return;
        const rate = Math.round((completedLessons.size / lessons.length) * 100);
        if (completionRate) {
            completionRate.textContent = `完成度：${rate}%`;
        }
        if (completionText) {
            completionText.textContent = `完成度：${rate}%`;
        }
        if (completionRateHeader) {
            completionRateHeader.textContent = `完成度：${rate}%`;
        }
        if (completionBadge) {
            if (rate > 0) {
                completionBadge.style.display = 'flex';
            } else {
                completionBadge.style.display = 'none';
            }
        }
        updateProgressMarkers();
    }

    // --- Workflow Step Management ---
    function updateProgressMarkers() {
        const markersContainer = document.getElementById('progress-markers');
        if (!markersContainer || lessons.length === 0) return;

        const markerCount = Math.min(lessons.length, 20); // 最多顯示 20 個標記
        markersContainer.innerHTML = '';
        const completionRatio = lessons.length ? completedLessons.size / lessons.length : 0;
        const activeRatio = lessons.length ? (currentLessonIndex + 1) / lessons.length : 0;

        for (let i = 0; i < markerCount; i++) {
            const marker = document.createElement('div');
            marker.className = 'progress-marker';
            const markerPosition = (i + 1) / markerCount;
            if (markerPosition <= completionRatio && completionRatio > 0) {
                marker.classList.add('is-complete');
            } else if (markerPosition <= activeRatio) {
                marker.classList.add('is-active');
            }
            markersContainer.appendChild(marker);
        }
    }

    // --- Draft Management ---
    function loadDrafts() {
        try {
            const saved = localStorage.getItem('python_tutor_drafts');
            if (saved) {
                lessonDrafts = JSON.parse(saved) || {};
            }
        } catch (e) {
            console.warn('Failed to load drafts:', e);
            lessonDrafts = {};
        }
    }

    function saveDrafts() {
        try {
            localStorage.setItem('python_tutor_drafts', JSON.stringify(lessonDrafts));
        } catch (e) {
            console.warn('Failed to save drafts:', e);
            setDraftState('error');
        }
    }

    // --- Code History Management ---
    function loadCodeHistory() {
        try {
            const saved = localStorage.getItem('python_tutor_code_history');
            if (saved) {
                codeHistory = JSON.parse(saved) || {};
            }
        } catch (e) {
            console.warn('Failed to load code history:', e);
            codeHistory = {};
        }
    }

    function saveCodeHistory() {
        try {
            localStorage.setItem('python_tutor_code_history', JSON.stringify(codeHistory));
        } catch (e) {
            console.warn('Failed to save code history:', e);
        }
    }

    // --- Learning Statistics Management ---
    function loadLearningStats() {
        try {
            const saved = localStorage.getItem('python_tutor_learning_stats');
            if (saved) {
                learningStats = JSON.parse(saved) || {};
            }
        } catch (e) {
            console.warn('Failed to load learning stats:', e);
            learningStats = {};
        }
    }

    function saveLearningStats() {
        try {
            localStorage.setItem('python_tutor_learning_stats', JSON.stringify(learningStats));
        } catch (e) {
            console.warn('Failed to save learning stats:', e);
        }
    }

    function updateLearningStats(lessonId, isCorrect, executionTime, hasError) {
        if (!lessonId) return;

        if (!learningStats[lessonId]) {
            learningStats[lessonId] = {
                total_executions: 0,
                successful_executions: 0,
                failed_executions: 0,
                error_count: 0,
                total_time: 0,
                average_time: 0,
                first_success_time: null,
                last_attempt: null
            };
        }

        const stats = learningStats[lessonId];
        stats.total_executions++;
        stats.last_attempt = new Date().toISOString();

        if (hasError) {
            stats.error_count++;
            stats.failed_executions++;
        } else if (isCorrect) {
            stats.successful_executions++;
            if (!stats.first_success_time) {
                stats.first_success_time = new Date().toISOString();
            }
        } else {
            stats.failed_executions++;
        }

        stats.total_time += executionTime;
        stats.average_time = Math.round(stats.total_time / stats.total_executions);

        saveLearningStats();
    }

    function getCodeHistoryForLesson(lessonId) {
        return codeHistory[lessonId] || [];
    }

    function restoreCodeFromHistory(lessonId, historyIndex) {
        const history = getCodeHistoryForLesson(lessonId);
        if (historyIndex >= 0 && historyIndex < history.length) {
            return history[historyIndex].code;
        }
        return null;
    }

    function saveDraftForLesson(lessonId, code) {
        if (!lessonId) return;
        if (code && code.trim() !== '') {
            lessonDrafts[lessonId] = code;
            setDraftState('saved');
        } else {
            delete lessonDrafts[lessonId];
            setDraftState('empty');
        }
        updateWorkflowState();
        saveDrafts();
    }

    function restoreDraft(lessonId) {
        return lessonDrafts[lessonId] || '';
    }

    function scheduleDraftSave() {
        const lesson = lessons[currentLessonIndex];
        if (!lesson || !codeEditor) return;
        if (draftSaveTimeout) clearTimeout(draftSaveTimeout);
        draftSaveTimeout = setTimeout(() => {
            saveDraftForLesson(lesson.id, codeEditor.value);
        }, 300);
    }

    // --- Sidebar Management ---
    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('active');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // --- Workspace Toggles ---
    if (focusModeToggle) {
        focusModeToggle.addEventListener('click', () => {
            const isFocus = document.body.classList.toggle('focus-mode');
            const span = focusModeToggle.querySelector('span');
            if (span) {
                span.textContent = isFocus ? '退出專注模式' : '專注模式';
            } else {
                focusModeToggle.textContent = isFocus ? '退出專注模式' : '專注模式';
            }
            focusModeToggle.setAttribute('aria-pressed', isFocus ? 'true' : 'false');
            focusModeToggle.title = isFocus ? '退出專注模式，恢復完整介面' : '縮短頁面、專注練習';
        });
    }

    // --- Jump to Editor ---
    const jumpToEditorBtn = document.getElementById('jump-to-editor');
    const pinExerciseBtn = document.getElementById('pin-exercise');
    let exercisePinned = localStorage.getItem('exercisePinned') === 'true';

    function jumpToEditor() {
        if (codeEditor) {
            // 先滚动到编辑器容器
            const editorContainer = document.getElementById('editor-container');
            if (editorContainer) {
                editorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // 稍微延迟一下，让滚动完成
                setTimeout(() => {
                    codeEditor.focus();
                    // 如果编辑器在视窗外，再次滚动
                    const rect = codeEditor.getBoundingClientRect();
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        codeEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else {
                codeEditor.focus();
            }
        }
    }

    if (jumpToEditorBtn) {
        jumpToEditorBtn.addEventListener('click', jumpToEditor);
    }

    // Toggle pin exercise
    if (pinExerciseBtn) {
        // 恢复固定状态
        const exerciseSection = document.querySelector('.exercise-section');
        if (exerciseSection && exercisePinned) {
            exerciseSection.classList.add('pinned');
            pinExerciseBtn.innerHTML = '<span>📌</span><span>取消固定</span>';
            pinExerciseBtn.title = '取消固定練習題';
            pinExerciseBtn.classList.add('active');
        }

        pinExerciseBtn.addEventListener('click', () => {
            exercisePinned = !exercisePinned;
            const exerciseSection = document.querySelector('.exercise-section');
            if (exerciseSection) {
                if (exercisePinned) {
                    exerciseSection.classList.add('pinned');
                    pinExerciseBtn.innerHTML = '<span>📌</span><span>取消固定</span>';
                    pinExerciseBtn.title = '取消固定練習題';
                    pinExerciseBtn.classList.add('active');
                    localStorage.setItem('exercisePinned', 'true');
                } else {
                    exerciseSection.classList.remove('pinned');
                    pinExerciseBtn.innerHTML = '<span>📌</span><span>固定</span>';
                    pinExerciseBtn.title = '固定練習題（讓它始終可見）';
                    pinExerciseBtn.classList.remove('active');
                    localStorage.setItem('exercisePinned', 'false');
                }
            }
        });
    }

    // 確保所有 jump-to-editor 元素都綁定事件
    const allJumpButtons = document.querySelectorAll('#jump-to-editor');
    allJumpButtons.forEach(btn => {
        if (btn !== jumpToEditorBtn) {
            btn.addEventListener('click', jumpToEditor);
        }
    });

    function isElementMostlyVisible(element, visibilityRatio = 0.6) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        if (rect.width === 0 || rect.height === 0) return false;
        const visibleX = Math.max(0, Math.min(rect.right, viewWidth) - Math.max(rect.left, 0));
        const visibleY = Math.max(0, Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0));
        const visibleArea = visibleX * visibleY;
        const totalArea = rect.width * rect.height;
        return totalArea > 0 ? (visibleArea / totalArea) >= visibilityRatio : false;
    }

    function syncFloatingActions() {
        if (!floatingActions) return;
        const isMobile = window.innerWidth <= 900;
        const runVisible = runButton ? isElementMostlyVisible(runButton, 0.75) : true;
        const editorVisible = codeEditor ? isElementMostlyVisible(codeEditor, 0.35) : false;
        const shouldShow = isMobile || !runVisible || !editorVisible;
        floatingActions.classList.toggle('visible', shouldShow);
    }

    if (floatingJump) {
        floatingJump.addEventListener('click', jumpToEditor);
    }

    window.addEventListener('scroll', syncFloatingActions);
    window.addEventListener('resize', syncFloatingActions);
    syncFloatingActions();

    function scrollToTarget(targetId) {
        if (!targetId) return;
        if (targetId === 'lesson-sidebar') {
            openSidebar();
            return;
        }
        const target = document.getElementById(targetId) || document.querySelector(`.${targetId}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (targetId === 'code-editor' && codeEditor) codeEditor.focus();
            if (targetId === 'run-button' && runButton) runButton.focus();
        }
    }

    if (nextStepButton) {
        nextStepButton.addEventListener('click', () => {
            scrollToTarget(nextStepTarget);
        });
    }

    // --- Execution Mode Toggle ---
    if (modePyodide) {
        modePyodide.addEventListener('click', () => {
            setExecutionMode('pyodide', { tip: getDefaultRunModeTip('pyodide') });
        });
    }

    if (modeServer) {
        modeServer.addEventListener('click', () => {
            setExecutionMode('server', { tip: getDefaultRunModeTip('server') });
        });
    }

    // --- Lesson List Rendering ---
    function renderLessonList(filter = '') {
        if (!lessonList) {
            console.error('[LESSON LIST] lessonList element not found');
            return;
        }

        // Update lesson count
        if (lessonCount) {
            if (!lessons || lessons.length === 0) {
                lessonCount.textContent = '載入中...';
            } else {
                const filteredCount = filter ? lessons.filter(lesson => {
                    if (!lesson || !lesson.id || !lesson.title) return false;
                    const searchTerm = filter.toLowerCase();
                    return lesson.title.toLowerCase().includes(searchTerm) ||
                        lesson.id.toLowerCase().includes(searchTerm);
                }).length : lessons.length;
                lessonCount.textContent = filter
                    ? `找到 ${filteredCount} / ${lessons.length} 個課程`
                    : `共 ${lessons.length} 個課程`;
            }
        }

        // Check if lessons are loaded
        if (!lessons || lessons.length === 0) {
            lessonList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.7);">
                    <p>📚 尚未載入課程</p>
                    <p style="font-size: 0.875rem; margin-top: 10px;">請等待課程載入完成...</p>
                </div>
            `;
            return;
        }

        const filtered = lessons.filter(lesson => {
            if (!lesson || !lesson.id || !lesson.title) {
                console.warn('[LESSON LIST] Invalid lesson found:', lesson);
                return false;
            }
            if (!filter) return true;
            const searchTerm = filter.toLowerCase();
            return lesson.title.toLowerCase().includes(searchTerm) ||
                lesson.id.toLowerCase().includes(searchTerm);
        });

        if (filtered.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.style.cssText = 'padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.7);';
            noResultsDiv.innerHTML = `
                <p>🔍 沒有找到符合的課程</p>
                <p style="font-size: 0.875rem; margin-top: 10px;">請嘗試其他搜尋關鍵字</p>
            `;

            const clearButton = document.createElement('button');
            clearButton.textContent = '清除搜尋';
            clearButton.style.cssText = 'margin-top: 10px; padding: 6px 12px; background: rgba(59, 130, 246, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); border-radius: 6px; color: white; cursor: pointer;';
            clearButton.onclick = () => {
                if (lessonSearch) {
                    lessonSearch.value = '';
                    renderLessonList('');
                }
            };
            noResultsDiv.appendChild(clearButton);

            lessonList.innerHTML = '';
            lessonList.appendChild(noResultsDiv);
            return;
        }

        try {
            lessonList.innerHTML = filtered.map((lesson, index) => {
                const originalIndex = lessons.indexOf(lesson);
                if (originalIndex === -1) {
                    console.warn('[LESSON LIST] Lesson not found in original array:', lesson.id);
                    return '';
                }
                const isActive = originalIndex === currentLessonIndex;
                const isCompleted = completedLessons.has(lesson.id);

                // Escape HTML to prevent XSS
                const escapeHtml = (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };

                return `
                    <div class="lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                         data-index="${originalIndex}"
                         title="${escapeHtml(lesson.title)}">
                        <span class="lesson-item-id">${escapeHtml(lesson.id)}</span>
                        <span class="lesson-item-title">${escapeHtml(lesson.title)}</span>
                    </div>
                `;
            }).filter(html => html !== '').join('');

            // Add click handlers
            lessonList.querySelectorAll('.lesson-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    if (!isNaN(index) && index >= 0 && index < lessons.length) {
                        loadLesson(index);
                        closeSidebar();
                    } else {
                        console.error('[LESSON LIST] Invalid index:', index);
                    }
                });
            });

            console.log(`[LESSON LIST] Rendered ${filtered.length} lessons (filter: "${filter}")`);
        } catch (error) {
            console.error('[LESSON LIST] Error rendering lesson list:', error);
            lessonList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: rgba(239, 68, 68, 0.8);">
                    <p>❌ 渲染課程列表時發生錯誤</p>
                    <p style="font-size: 0.875rem; margin-top: 10px;">${error.message}</p>
                </div>
            `;
        }
    }

    if (lessonSearch) {
        lessonSearch.addEventListener('input', (e) => {
            renderLessonList(e.target.value);
        });
    }

    // --- Initialization ---
    async function initializeApp() {
        try {
            showLoading('正在載入課程內容...');
            const lessonsResponse = await fetch('/api/lessons');

            if (!lessonsResponse.ok) {
                const errorData = await lessonsResponse.json().catch(() => ({}));
                const errorMessage = errorData.detail || `載入課程失敗（狀態碼：${lessonsResponse.status}）`;
                throw new Error(errorMessage);
            }

            lessons = await lessonsResponse.json();

            if (!Array.isArray(lessons)) {
                throw new Error('課程數據格式錯誤：預期為陣列格式。');
            }

            if (lessons.length > 0) {
                console.log(`✓ 成功載入 ${lessons.length} 個課程`);

                // Validate lessons data
                const validLessons = lessons.filter(lesson => {
                    if (!lesson || !lesson.id || !lesson.title) {
                        console.warn('Invalid lesson found:', lesson);
                        return false;
                    }
                    return true;
                });

                if (validLessons.length !== lessons.length) {
                    console.warn(`警告：${lessons.length - validLessons.length} 個無效課程已過濾`);
                    lessons = validLessons;
                }

                if (lessons.length === 0) {
                    throw new Error('沒有有效的課程數據');
                }

                // Ensure currentLessonIndex is valid
                if (currentLessonIndex >= lessons.length) {
                    currentLessonIndex = 0;
                }

                loadProgress();
                loadDrafts();
                loadCodeHistory();
                loadLearningStats();
                renderLessonList();
                loadLesson(currentLessonIndex);
                updateCompletionRate();
                updateProgressMarkers();
                if (!pyodideReady) {
                    outputConsole.textContent = '⏳ Python 執行環境正在背景載入，完成後即可執行程式碼。\n\n💡 提示：如果載入時間過長，請檢查網絡連接。';
                    setEnvState('loading', '正在載入...');

                    // Add a loading progress indicator
                    let loadingProgress = 0;
                    const progressInterval = setInterval(() => {
                        loadingProgress += 5;
                        if (loadingProgress <= 100 && !pyodideReady) {
                            if (outputConsole && !outputConsole.textContent.includes('失敗')) {
                                outputConsole.textContent = `⏳ Python 執行環境正在載入... (${loadingProgress}%)\n\n💡 提示：首次載入可能需要 30-60 秒，請耐心等待。\n如果超過 2 分鐘仍未完成，請檢查網絡連接。`;
                            }
                        }
                    }, 3000);

                    // Start loading Pyodide in background with timeout handling
                    preparePyodideBackground().then(success => {
                        clearInterval(progressInterval);
                        if (success && pyodideReady) {
                            if (outputConsole) {
                                outputConsole.textContent = '✅ Python 執行環境已就緒！可以開始執行程式碼了。';
                                outputConsole.className = '';
                            }
                        }
                    }).catch(err => {
                        clearInterval(progressInterval);
                        console.error('Background Pyodide initialization failed:', err);
                        setEnvState('error', '載入失敗');
                        const errorMsg = err.message || '未知錯誤';
                        outputConsole.textContent = `❌ Python 執行環境載入失敗：${errorMsg}\n\n💡 解決方案：\n1. 檢查網絡連接\n2. 刷新頁面重試 (F5)\n3. 查看瀏覽器控制台 (F12) 獲取詳細錯誤\n4. 如果問題持續，可能是 CDN 無法訪問\n5. 嘗試使用 VPN 或切換網絡環境`;
                        outputConsole.className = 'error';

                        // Add retry button
                        const existingRetry = outputConsole.parentElement?.querySelector('.retry-python-button');
                        if (!existingRetry) {
                            const retryButton = document.createElement('button');
                            retryButton.textContent = '🔄 重試載入';
                            retryButton.className = 'retry-python-button primary-button';
                            retryButton.style.marginTop = '10px';
                            retryButton.onclick = () => {
                                retryButton.remove();
                                outputConsole.textContent = '正在重新載入...';
                                outputConsole.className = '';
                                setEnvState('loading', '重新載入中...');
                                pyodideFailed = false;
                                pyodideLoadingPromise = null;
                                preparePyodideBackground();
                            };
                            if (outputConsole.parentElement) {
                                outputConsole.parentElement.appendChild(retryButton);
                            }
                        }
                    });
                }
            } else {
                showError('沒有找到課程內容。請確認課程文件已正確配置。');
            }
        } catch (error) {
            console.error('初始化失敗：', error);
            showError(`載入失敗：${error.message}\n\n請檢查：\n1. 後端服務是否正常運行\n2. 課程文件是否存在\n3. 瀏覽器控制台是否有詳細錯誤訊息`);
        } finally {
            hideLoading();
        }
    }

    // --- Lesson Loading ---
    function loadLesson(index) {
        if (index < 0 || index >= lessons.length) return;

        const previousLesson = lessons[currentLessonIndex];
        if (previousLesson && previousLesson.id && index !== currentLessonIndex && codeEditor) {
            saveDraftForLesson(previousLesson.id, codeEditor.value);
        }

        currentLessonIndex = index;
        const lesson = lessons[index];

        // Update lesson title and badge
        lessonTitle.textContent = lesson.title;
        if (lessonBadge) {
            lessonBadge.textContent = lesson.id;
        }

        // Update header counter
        if (lessonCounterHeader) {
            lessonCounterHeader.textContent = `單元 ${index + 1} / ${lessons.length}`;
        }

        // Use marked.js to render markdown content
        lessonExplanation.innerHTML = marked.parse(lesson.explanation);
        lessonExercise.innerHTML = marked.parse(lesson.exercise);

        // Extract and show example code if available
        const exampleCodeText = extractExampleCode(lesson.explanation);
        showExampleCode(exampleCodeText);

        // Initialize realtime guide system
        const guideContainer = document.getElementById('realtime-guide-container');
        if (typeof RealtimeGuide !== 'undefined' && guideContainer && codeEditor) {
            if (realtimeGuide) {
                realtimeGuide.clear();
            }
            realtimeGuide = new RealtimeGuide(lesson);
            realtimeGuide.init(codeEditor, guideContainer);
            // Set guide level based on user preference (can be stored in localStorage)
            const savedGuideLevel = localStorage.getItem('guideLevel') || 'moderate';
            realtimeGuide.setGuideLevel(savedGuideLevel);
        }

        // Initialize smart guide system for stuck students
        const smartGuideContainer = document.getElementById('smart-guide-container');
        if (typeof SmartGuide !== 'undefined' && smartGuideContainer && codeEditor) {
            if (smartGuide) {
                smartGuide.closeGuide();
            }
            smartGuide = new SmartGuide(lesson, codeEditor);
            smartGuide.init(smartGuideContainer);
        }

        // Handle hint
        if (lesson.hint) {
            if (toggleHint) toggleHint.style.display = 'flex';
            lessonHint.innerHTML = `<strong>提示：</strong> ${lesson.hint}`;
            lessonHint.classList.remove('show');
            hintVisible = false;
            if (toggleHint) {
                toggleHint.querySelector('.hint-text').textContent = '顯示提示';
            }
        } else {
            if (toggleHint) toggleHint.style.display = 'none';
            lessonHint.style.display = 'none';
        }

        // Show essentials (expected output, completion cue)
        const expected = lesson?.validator?.expected_output;
        if (completionCriteria) {
            completionCriteria.textContent = expected
                ? '執行後輸出需與下方預期一致。'
                : '執行並確認沒有錯誤即可完成本題。';
        }
        if (expectedOutputCard && expectedOutputPreview) {
            if (expected && typeof expected === 'string') {
                expectedOutputCard.style.display = 'block';
                expectedOutputPreview.textContent = expected.trim() || '(題目未提供預期輸出)';
            } else {
                expectedOutputCard.style.display = 'none';
                expectedOutputPreview.textContent = '';
            }
        }

        // Update lesson status
        const isCompleted = completedLessons.has(lesson.id);
        if (lessonStatus) {
            if (isCompleted) {
                lessonStatus.style.display = 'flex';
            } else {
                lessonStatus.style.display = 'none';
            }
        }

        // Reset UI elements
        const draft = restoreDraft(lesson.id);

        // --- Handle Lesson Type (Parsons vs Standard) ---
        const parsonsContainer = document.getElementById('parsons-container');
        if (lesson.type === 'parsons') {
            // Setup Parsons Mode
            if (parsonsContainer) parsonsContainer.style.display = 'flex';
            if (codeEditor) codeEditor.style.display = 'none';
            if (lineNumbers) lineNumbers.style.display = 'none';

            initializeParsonsProblem(lesson);

            // For Parsons, code editor is used as a hidden buffer
            codeEditor.value = draft || '';

            if (draft) {
                // If draft exists, try to restore block positions (advanced feature)
                // For now, simpler: if draft exists, we might not want to re-shuffle
                // but let's stick to standard behavior for now.
                // Or better: updateParsonsCode will overwrite this anyway upon interaction.
            }

            outputConsole.textContent = '拖拉積木來解題，排列好後點擊「執行程式碼」檢查結果。';
        } else {
            // Setup Standard Mode
            if (parsonsContainer) parsonsContainer.style.display = 'none';
            if (codeEditor) codeEditor.style.display = 'block';
            if (lineNumbers) lineNumbers.style.display = 'block';

            codeEditor.value = draft;
            updateLineNumbers();

            if (draft && draft.trim() !== '') {
                outputConsole.textContent = '已載入上次的程式碼草稿，準備執行看看吧！';
                setDraftState('restored');
            } else {
                outputConsole.textContent = '點擊「執行程式碼」來看結果。';
                setDraftState('empty');
            }
        }

        outputConsole.className = '';

        // Reset output comparison
        if (compareOutput) compareOutput.style.display = 'none';
        if (outputComparison) outputComparison.style.display = 'none';
        lastResult = null;

        // Hide input container and reset its state
        inputContainer.style.display = 'none';
        inputContainer.style.opacity = '1';
        inputContainer.style.transform = 'translateY(0)';
        inputContainer.style.transition = '';
        userInput.value = '';
        window._currentInputResolver = null;

        updateNavigation();
        updateLessonProgressLabel();
        updateWorkflowState();
        renderLessonList(lessonSearch ? lessonSearch.value : '');
        saveProgress();
    }

    // --- Navigation ---
    function updateNavigation() {
        if (lessons.length === 0) return;

        const progress = ((currentLessonIndex + 1) / lessons.length) * 100;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        updateLessonProgressLabel();
        updateProgressMarkers();

        if (lessonCounter) {
            lessonCounter.textContent = `單元 ${currentLessonIndex + 1} / ${lessons.length}`;
        }

        if (prevButton) {
            prevButton.disabled = currentLessonIndex === 0;
        }
        if (nextButton) {
            nextButton.disabled = currentLessonIndex === lessons.length - 1;
        }
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentLessonIndex > 0) {
                loadLesson(currentLessonIndex - 1);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentLessonIndex < lessons.length - 1) {
                loadLesson(currentLessonIndex + 1);
            }
        });
    }

    // --- Explanation Toggle ---
    if (toggleExplanation) {
        toggleExplanation.addEventListener('click', () => {
            const isExpanded = toggleExplanation.getAttribute('aria-expanded') === 'true';
            const explanationContent = document.getElementById('lesson-explanation');
            const collapseIcon = toggleExplanation.querySelector('.collapse-icon');

            if (isExpanded) {
                toggleExplanation.setAttribute('aria-expanded', 'false');
                explanationContent.classList.add('collapsed');
                if (collapseIcon) collapseIcon.textContent = '▶';
            } else {
                toggleExplanation.setAttribute('aria-expanded', 'true');
                explanationContent.classList.remove('collapsed');
                if (collapseIcon) collapseIcon.textContent = '▼';
            }
        });
    }

    // --- Example Code ---
    function extractExampleCode(explanation) {
        // 從說明中提取程式碼範例
        const codeBlockRegex = /```(?:python)?\n?([\s\S]*?)```/g;
        const matches = [];
        let match;

        while ((match = codeBlockRegex.exec(explanation)) !== null) {
            matches.push(match[1].trim());
        }

        return matches.length > 0 ? matches[0] : null;
    }

    function showExampleCode(code) {
        if (code && exampleCode && exampleCodeContent) {
            exampleCodeContent.textContent = code;
            exampleCode.style.display = 'block';
            if (showExample) showExample.style.display = 'flex';
        } else {
            if (exampleCode) exampleCode.style.display = 'none';
            if (showExample) showExample.style.display = 'none';
        }
    }

    if (showExample) {
        showExample.addEventListener('click', () => {
            const isVisible = exampleCode.style.display !== 'none';
            exampleCode.style.display = isVisible ? 'none' : 'block';
            showExample.querySelector('span:last-child').textContent = isVisible ? '範例' : '隱藏範例';
        });
    }

    if (copyExample) {
        copyExample.addEventListener('click', async () => {
            const code = exampleCodeContent.textContent;
            try {
                await navigator.clipboard.writeText(code);
                const originalText = copyExample.querySelector('span:last-child').textContent;
                copyExample.querySelector('span:last-child').textContent = '已複製！';
                copyExample.style.background = 'rgba(16, 185, 129, 0.2)';
                setTimeout(() => {
                    copyExample.querySelector('span:last-child').textContent = originalText;
                    copyExample.style.background = '';
                }, 2000);
            } catch (err) {
                console.error('複製失敗:', err);
            }
        });
    }

    // --- Reset Button ---
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            const lesson = lessons[currentLessonIndex];
            if (lesson) {
                if (lesson.type === 'parsons') {
                    // Handle Parsons Reset
                    localStorage.removeItem(`parsons_state_${lesson.id}`);
                    initializeParsonsProblem(lesson);
                    outputConsole.textContent = '積木已重置，請重新排列。';
                    outputConsole.className = '';
                    // Also clear the hidden editor buffer
                    codeEditor.value = '';
                    // Reset visual feedback
                    const targetContainer = document.getElementById('parsons-target');
                    if (targetContainer) {
                        const blocks = targetContainer.querySelectorAll('.parsons-block');
                        blocks.forEach(el => el.classList.remove('parsons-correct', 'parsons-incorrect'));
                    }
                } else {
                    // Handle Standard Reset
                    const draft = restoreDraft(lesson.id);
                    codeEditor.value = draft || '';
                    updateLineNumbers();
                    outputConsole.textContent = '程式碼已重置。';
                    outputConsole.className = '';
                    setDraftState(draft ? 'restored' : 'empty');
                }

                updateWorkflowState();
                if (errorDetails) errorDetails.style.display = 'none';
                if (outputComparison) outputComparison.style.display = 'none';
                if (compareOutput) compareOutput.style.display = 'none';
            }
        });
    }

    // --- Hint Toggle ---
    if (toggleHint) {
        toggleHint.addEventListener('click', () => {
            hintVisible = !hintVisible;
            if (hintVisible) {
                lessonHint.classList.add('show');
                toggleHint.querySelector('.hint-text').textContent = '隱藏提示';
            } else {
                lessonHint.classList.remove('show');
                toggleHint.querySelector('.hint-text').textContent = '顯示提示';
            }
        });
    }

    // --- Clear Buttons ---
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            codeEditor.value = '';
            updateLineNumbers();
            const lesson = lessons[currentLessonIndex];
            if (lesson) {
                saveDraftForLesson(lesson.id, '');
            }
            codeEditor.focus();
            updateWorkflowState();
        });
    }

    if (clearOutput) {
        clearOutput.addEventListener('click', () => {
            outputConsole.textContent = '點擊「執行程式碼」來看結果。';
            outputConsole.className = '';
        });
    }

    // --- Input Handling ---
    function handleInputSubmit() {
        const value = userInput.value;
        console.log('[INPUT] handleInputSubmit called, value:', JSON.stringify(value));

        // Resolve the current input promise
        if (window._currentInputResolver) {
            const stringValue = String(value);
            window._currentInputResolver(stringValue);
            window._currentInputResolver = null;
            console.log('[INPUT] Resolved input promise with value:', JSON.stringify(stringValue));
        } else {
            console.warn('[INPUT] No input resolver found!');
        }

        // Hide input container with animation
        inputContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        inputContainer.style.opacity = '0';
        inputContainer.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            inputContainer.style.display = 'none';
            userInput.value = '';
        }, 200);
    }

    if (submitInput) {
        submitInput.addEventListener('click', handleInputSubmit);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInputSubmit();
            }
        });
    }

    // --- Code Execution with Pyodide ---
    async function executeCodeWithPyodide(code) {
        if (!pyodideReady || !pyodide) {
            throw new Error('Python 執行環境尚未就緒，請稍候...');
        }

        // Set execution timeout (30 seconds)
        const EXECUTION_TIMEOUT = 30000;
        let timeoutId = null;
        let executionCompleted = false;

        try {
            // Set up stdout/stderr capture
            pyodide.runPython(`
from io import StringIO
import sys
import signal

_original_stdout = sys.stdout
_original_stderr = sys.stderr

_capture_stdout = StringIO()
_capture_stderr = StringIO()

sys.stdout = _capture_stdout
sys.stderr = _capture_stderr
            `);

            let stdout = '';
            let stderr = '';
            let hasError = false;

            // Check if code contains input()
            const hasInput = code.includes('input(');
            console.log('[EXEC] Code contains input():', hasInput);

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    if (!executionCompleted) {
                        executionCompleted = true;
                        reject(new Error('執行超時：程式碼執行時間超過 30 秒。可能是無限迴圈或其他效能問題。\n\n💡 建議：\n1. 檢查是否有無限迴圈\n2. 優化程式碼效能\n3. 減少不必要的計算'));
                    }
                }, EXECUTION_TIMEOUT);
            });

            // Execute user code with timeout protection
            try {
                const executionPromise = (async () => {
                    if (hasInput) {
                        console.log('[EXEC] Using runPythonAsync for code with input()');

                        // Transform the code: replace input(...) with await input(...)
                        let transformedCode = code;
                        transformedCode = transformedCode.replace(/(?<!await\s)(?<!await\s\()\binput\s*\(/g, 'await input(');

                        // Split code by newlines and indent each line
                        const codeLines = transformedCode.split('\n');
                        const indentedCode = codeLines.map(line => '    ' + line).join('\n');
                        const wrappedCode = `async def _run_user_code():\n${indentedCode}\n\nawait _run_user_code()`;

                        await pyodide.runPythonAsync(wrappedCode);
                        console.log('[EXEC] runPythonAsync completed');
                    } else {
                        console.log('[EXEC] Using runPython (no input())');
                        pyodide.runPython(code);
                    }
                    executionCompleted = true;
                })();

                // Race between execution and timeout
                await Promise.race([executionPromise, timeoutPromise]);

                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            } catch (error) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                executionCompleted = true;
                hasError = true;
                let errorStr = error.toString();

                // 改進常見錯誤訊息的用戶友好性
                if (errorStr.includes('ValueError: invalid literal for int()')) {
                    const match = errorStr.match(/invalid literal for int\(\) with base 10: '([^']*)'/);
                    if (match) {
                        const value = match[1];
                        if (value === '') {
                            errorStr = "ValueError: 無法將空字串轉換為整數。\n\n💡 提示：當您使用 int(input()) 時，請確保在輸入框中輸入一個有效的數字，不要留空。\n\n（原始錯誤：invalid literal for int() with base 10: ''）";
                        } else {
                            errorStr = `ValueError: 無法將 "${value}" 轉換為整數。\n\n💡 提示：int() 函數只能將數字字串（如 "123"、"45"）轉換為整數。請確保您輸入的是有效的數字。\n\n（原始錯誤：invalid literal for int() with base 10: '${value}'）`;
                        }
                    }
                } else if (errorStr.includes('NameError')) {
                    // 改進 NameError 的提示
                    const match = errorStr.match(/name '([^']+)' is not defined/);
                    if (match) {
                        const varName = match[1];
                        errorStr = `NameError: 變數 "${varName}" 未定義。\n\n💡 提示：\n1. 檢查變數名稱是否拼寫正確\n2. 確認在使用變數之前已經定義它（例如：${varName} = 值）\n3. 注意 Python 對大小寫敏感（例如：name 和 Name 是不同的變數）`;
                    }
                } else if (errorStr.includes('SyntaxError')) {
                    // 改進語法錯誤的提示
                    const syntaxMatch = errorStr.match(/SyntaxError: (.+)/);
                    if (syntaxMatch) {
                        const syntaxMsg = syntaxMatch[1];
                        errorStr = `語法錯誤：${syntaxMsg}\n\n💡 提示：\n1. 檢查是否缺少括號、引號或冒號\n2. 確認縮排是否正確（Python 使用縮排來表示程式碼區塊）\n3. 檢查是否有拼寫錯誤\n4. 確認字串是否正確閉合（每個引號都有配對）`;
                    } else {
                        errorStr = `語法錯誤：${errorStr}\n\n💡 提示：\n1. 檢查是否缺少括號、引號或冒號\n2. 確認縮排是否正確（Python 使用縮排來表示程式碼區塊）\n3. 檢查是否有拼寫錯誤`;
                    }
                } else if (errorStr.includes('IndentationError')) {
                    errorStr = `縮排錯誤：${errorStr}\n\n💡 提示：\n1. Python 使用縮排（通常是 4 個空格）來表示程式碼區塊\n2. 確保同一區塊內的程式碼使用相同的縮排\n3. 檢查是否有混用空格和 Tab 鍵\n4. 確認 if、for、while 等語句後的程式碼有正確縮排`;
                } else if (errorStr.includes('TypeError')) {
                    const match = errorStr.match(/unsupported operand type\(s\)/);
                    if (match) {
                        errorStr = `類型錯誤：${errorStr}\n\n💡 提示：\n1. 檢查變數的類型是否正確（例如：數字 vs 字串）\n2. 某些運算符只能用在特定類型上（例如：不能將字串和數字相加）\n3. 可以使用 type() 函數檢查變數類型\n4. 使用 str()、int()、float() 等函數進行類型轉換`;
                    } else {
                        errorStr = `類型錯誤：${errorStr}\n\n💡 提示：檢查變數類型是否匹配操作要求`;
                    }
                } else if (errorStr.includes('執行超時') || errorStr.includes('timeout')) {
                    // Timeout errors are already well-formatted
                } else if (errorStr.includes('ZeroDivisionError')) {
                    errorStr = `除零錯誤：${errorStr}\n\n💡 提示：\n1. 檢查除法運算的分母是否為零\n2. 使用條件判斷避免除以零的情況\n3. 例如：if denominator != 0: result = numerator / denominator`;
                } else if (errorStr.includes('IndexError')) {
                    errorStr = `索引錯誤：${errorStr}\n\n💡 提示：\n1. 檢查列表或字串的索引是否超出範圍\n2. 列表索引從 0 開始，最後一個元素的索引是 len(list) - 1\n3. 使用 len() 函數檢查列表長度`;
                } else if (errorStr.includes('KeyError')) {
                    errorStr = `鍵值錯誤：${errorStr}\n\n💡 提示：\n1. 檢查字典中是否存在該鍵\n2. 使用 .get() 方法安全地獲取字典值\n3. 使用 in 運算符檢查鍵是否存在`;
                }

                stderr = errorStr;
            }

            // Get captured output
            try {
                stdout = pyodide.runPython('_capture_stdout.getvalue()');
                const captured_stderr = pyodide.runPython('_capture_stderr.getvalue()');
                if (captured_stderr) {
                    let improved_stderr = captured_stderr;
                    if (captured_stderr.includes('ValueError: invalid literal for int()')) {
                        const match = captured_stderr.match(/invalid literal for int\(\) with base 10: '([^']*)'/);
                        if (match) {
                            const value = match[1];
                            if (value === '') {
                                improved_stderr = "ValueError: 無法將空字串轉換為整數。\n\n💡 提示：當您使用 int(input()) 時，請確保在輸入框中輸入一個有效的數字，不要留空。";
                            } else {
                                improved_stderr = `ValueError: 無法將 "${value}" 轉換為整數。\n\n💡 提示：int() 函數只能將數字字串轉換為整數。請確保您輸入的是有效的數字。`;
                            }
                        }
                    }
                    stderr = stderr ? stderr + '\n' + improved_stderr : improved_stderr;
                }
            } catch (e) {
                // Ignore errors in getting captured output
            }

            // Restore stdout/stderr
            pyodide.runPython(`
sys.stdout = _original_stdout
sys.stderr = _original_stderr
            `);

            return {
                stdout: stdout || '',
                stderr: stderr || '',
                is_correct: !hasError && !stderr
            };
        } catch (error) {
            return {
                stdout: '',
                stderr: `執行錯誤：${error.message}`,
                is_correct: false
            };
        }
    }

    // --- Server-side Execution (Fallback) ---
    function countInputOccurrences(code) {
        if (!code) return 0;
        try {
            const sanitized = code.replace(/(['"])(?:\\.|(?!\1).)*\1/g, '');
            const matches = sanitized.match(/input\s*\(/g);
            return matches ? matches.length : 0;
        } catch (e) {
            return 0;
        }
    }

    function showServerInputModal(initialCount) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'input-modal';
            modal.innerHTML = `
                <div class="input-modal-content">
                    <div class="input-modal-header">
                        <h3>提供 input() 輸入值</h3>
                        <button class="input-modal-close">✕</button>
                    </div>
                    <div class="input-modal-body">
                        <p class="input-modal-tip">偵測到程式碼中呼叫 input()，伺服器模式無法互動式輸入，請先填寫各次輸入的值。</p>
                        <div class="input-list"></div>
                        <div class="input-modal-actions">
                            <button class="ghost-button add-input-btn">+ 新增一筆輸入</button>
                            <div class="input-modal-buttons">
                                <button class="ghost-button input-cancel-btn">取消</button>
                                <button class="primary-button input-confirm-btn">開始執行</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const list = modal.querySelector('.input-list');
            const addBtn = modal.querySelector('.add-input-btn');
            const cancelBtn = modal.querySelector('.input-cancel-btn');
            const confirmBtn = modal.querySelector('.input-confirm-btn');
            const closeBtn = modal.querySelector('.input-modal-close');

            const createRow = (index, value = '') => {
                const row = document.createElement('div');
                row.className = 'input-row';
                row.innerHTML = `
                    <label>輸入 ${index + 1}</label>
                    <input type="text" value="${value}" placeholder="輸入給 input() 的值">
                `;
                return row;
            };

            const addRow = () => {
                const idx = list.children.length;
                list.appendChild(createRow(idx));
            };

            const ensureRows = (count) => {
                for (let i = 0; i < Math.max(1, count); i++) {
                    addRow();
                }
            };

            ensureRows(initialCount);

            addBtn.addEventListener('click', () => addRow());

            cancelBtn.addEventListener('click', () => {
                modal.remove();
                resolve({ cancelled: true, inputs: [] });
            });

            closeBtn.addEventListener('click', () => {
                modal.remove();
                resolve({ cancelled: true, inputs: [] });
            });

            confirmBtn.addEventListener('click', () => {
                const inputs = Array.from(list.querySelectorAll('input')).map(inp => inp.value);
                modal.remove();
                resolve({ cancelled: false, inputs });
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve({ cancelled: true, inputs: [] });
                }
            });

            document.body.appendChild(modal);
        });
    }

    async function executeCodeOnServer(code, lesson) {
        const inputCount = countInputOccurrences(code);
        let inputs = [];
        if (inputCount > 0) {
            const modalResult = await showServerInputModal(inputCount);
            if (modalResult.cancelled) {
                throw new Error('已取消執行');
            }
            inputs = modalResult.inputs;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch('/api/run_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    lesson_id: lesson?.id || '',
                    inputs
                }),
                signal: controller.signal
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const detail = data.detail || `伺服器回應 ${response.status}`;
                throw new Error(detail);
            }

            return {
                is_correct: Boolean(data.is_correct),
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                message: data.message || '執行完成。',
                execution_time: executionStartTime ? Date.now() - executionStartTime : 0
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('伺服器執行逾時（30 秒），請檢查程式是否有無限迴圈或稍後再試。');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // --- Code Execution ---
    let executionStartTime = 0;

    async function executeCode() {
        const code = codeEditor.value.trim();
        const lesson = lessons[currentLessonIndex];

        if (!code) {
            outputConsole.textContent = '⚠️ 請輸入一些程式碼！';
            outputConsole.className = 'error';
            return;
        }

        if (!lesson) {
            showError('無法取得當前課程資訊');
            return;
        }

        if (!lesson.id || lesson.id.trim() === '') {
            showError('課程 ID 無效，請重新載入頁面');
            return;
        }

        // Save code to history
        if (!codeHistory[lesson.id]) {
            codeHistory[lesson.id] = [];
        }
        codeHistory[lesson.id].push({
            code: code,
            timestamp: new Date().toISOString()
        });
        // Keep only last 10 versions
        if (codeHistory[lesson.id].length > 10) {
            codeHistory[lesson.id].shift();
        }
        saveCodeHistory();

        // Update UI for execution
        executionStartTime = Date.now();
        if (runButton) runButton.disabled = true;
        if (runLoading) runLoading.style.display = 'flex';
        outputConsole.textContent = '⏳ 執行中...';
        outputConsole.className = '';

        try {
            let result;

            if (lesson.type === 'parsons') {
                // Handle Parsons Problem Validation
                const parsonsResult = checkParsonsSolution(lesson);

                // Construct result object trying to mimic a Python execution result
                result = {
                    is_correct: parsonsResult.isCorrect,
                    stdout: parsonsResult.isCorrect ? "（邏輯順序正確）" : "（邏輯順序尚未正確）",
                    stderr: parsonsResult.isCorrect ? "" : parsonsResult.message,
                    message: parsonsResult.message,
                    execution_time: Date.now() - executionStartTime
                };

                // Add visual feedback
                const targetBlocks = document.querySelectorAll('.parsons-target .parsons-block');
                targetBlocks.forEach(el => {
                    el.classList.remove('parsons-correct', 'parsons-incorrect');
                });

                if (parsonsResult.isCorrect) {
                    targetBlocks.forEach(el => el.classList.add('parsons-correct'));
                } else {
                    targetBlocks.forEach(el => el.classList.add('parsons-incorrect'));
                }

            } else if (executionMode === 'server') {
                result = await executeCodeOnServer(code, lesson);
            } else {
                const ready = await ensurePyodideReady();
                if (!ready || !pyodide) {
                    setExecutionMode('server', { auto: true, reason: 'Pyodide 載入失敗，改用伺服器模式。' });
                    result = await executeCodeOnServer(code, lesson);
                } else {
                    // Execute code with Pyodide
                    const executionResult = await executeCodeWithPyodide(code);

                    // Validate against lesson with improved validator support
                    let is_correct = false;
                    let message = "執行完成。";

                    if (executionResult.stderr) {
                        is_correct = false;
                        message = "❌ 程式執行時發生錯誤。";
                    } else {
                        if (lesson && 'validator' in lesson) {
                            const validator = lesson['validator'];
                            const validatorType = validator?.type || 'none';
                            const expected_output = (validator?.expected_output || "").trim();
                            const actual_output = executionResult.stdout.trim();

                            switch (validatorType) {
                                case "stdout_equals":
                                    if (actual_output === expected_output) {
                                        is_correct = true;
                                        message = "✅ 恭喜！輸出結果完全符合題目要求！";
                                    } else {
                                        is_correct = false;
                                        message = `🤔 程式可以執行，但輸出結果不符.\n\n預期輸出：\n---\n${expected_output}\n---\n\n你的輸出：\n---\n${actual_output}\n---`;
                                    }
                                    break;
                                case "stdout_contains":
                                    if (actual_output.includes(expected_output)) {
                                        is_correct = true;
                                        message = "✅ 恭喜！輸出包含預期的內容！";
                                    } else {
                                        is_correct = false;
                                        message = `🤔 程式可以執行，但輸出未包含預期內容.\n\n預期包含：\n---\n${expected_output}\n---\n\n你的輸出：\n---\n${actual_output}\n---`;
                                    }
                                    break;
                                case "stdout_ends_with":
                                    if (actual_output.endsWith(expected_output)) {
                                        is_correct = true;
                                        message = "✅ 恭喜！輸出結尾符合題目要求！";
                                    } else {
                                        is_correct = false;
                                        message = `🤔 程式可以執行，但輸出結尾不符.\n\n預期結尾：\n---\n${expected_output}\n---\n\n你的輸出結尾：\n---\n${actual_output.slice(-expected_output.length - 20)}\n---`;
                                    }
                                    break;
                                case "stdout_starts_with":
                                    if (actual_output.startsWith(expected_output)) {
                                        is_correct = true;
                                        message = "✅ 恭喜！輸出開頭符合題目要求！";
                                    } else {
                                        is_correct = false;
                                        message = `🤔 程式可以執行，但輸出開頭不符.\n\n預期開頭：\n---\n${expected_output}\n---\n\n你的輸出開頭：\n---\n${actual_output.slice(0, expected_output.length + 20)}\n---`;
                                    }
                                    break;
                                case "no_error":
                                    // Just check that there's no error
                                    is_correct = true;
                                    message = "✅ 程式執行成功，沒有錯誤。";
                                    break;
                                default:
                                    // No specific validator type, so just running without error is enough
                                    is_correct = true;
                                    message = "✅ 程式執行成功，沒有錯誤。";
                            }
                        } else {
                            // No lesson or validator found, so any error-free run is "correct"
                            is_correct = true;
                            message = "✅ 程式執行成功，沒有錯誤。";
                        }
                    }

                    const executionTime = executionStartTime > 0 ? Date.now() - executionStartTime : 0;

                    result = {
                        is_correct: is_correct,
                        stdout: executionResult.stdout,
                        stderr: executionResult.stderr,
                        message: message,
                        execution_time: executionTime
                    };
                }
            }

            if (!result.execution_time && executionStartTime) {
                result.execution_time = Date.now() - executionStartTime;
            }

            // Update learning statistics
            updateLearningStats(lesson.id, result.is_correct, result.execution_time || 0, result.stderr ? true : false);

            // Mark lesson as completed if correct
            if (result.is_correct && lesson) {
                completedLessons.add(lesson.id);
                updateCompletionRate();
                saveProgress();
            }

            lastResult = result;
            displayResult(result);

        } catch (error) {
            let errorMessage = '未知錯誤';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                errorMessage = error.message || error.detail || JSON.stringify(error);
            }

            const isCancelled = typeof errorMessage === 'string' && errorMessage.includes('已取消');
            if (isCancelled) {
                outputConsole.textContent = '已取消此次執行。';
                outputConsole.className = '';
                return;
            }

            // Update learning stats for error
            if (lesson) {
                updateLearningStats(lesson.id, false, 0, true);
            }

            showError(`執行時發生錯誤：${errorMessage}`);

            // Display error in console
            outputConsole.textContent = `❌ 執行時發生錯誤：${errorMessage}`;
            outputConsole.className = 'error';
        } finally {
            executionStartTime = 0; // Reset execution start time
            if (runButton) runButton.disabled = false;
            if (runLoading) runLoading.style.display = 'none';
        }
    }

    if (runButton) {
        runButton.addEventListener('click', executeCode);
    }

    function handleFloatingRun() {
        const editorVisible = codeEditor ? isElementMostlyVisible(codeEditor, 0.3) : true;
        if (!editorVisible) {
            jumpToEditor();
            return;
        }
        executeCode();
    }

    if (runFloating) {
        runFloating.addEventListener('click', handleFloatingRun);
    }

    // --- Output Comparison ---
    function toggleOutputComparison() {
        if (!outputComparison || !lastResult) return;

        const isVisible = outputComparison.style.display !== 'none';
        if (isVisible) {
            outputComparison.style.display = 'none';
            if (compareOutput) compareOutput.textContent = '🔍';
        } else {
            const lesson = lessons[currentLessonIndex];
            if (lesson && lesson.validator && lesson.validator.type === 'stdout_equals') {
                outputComparison.style.display = 'grid';
                if (expectedOutput) {
                    expectedOutput.textContent = lesson.validator.expected_output || '(無預期輸出)';
                }
                if (actualOutput) {
                    actualOutput.textContent = lastResult.stdout || '(無輸出)';
                }
                if (compareOutput) compareOutput.textContent = '✕';
            }
        }
    }

    if (compareOutput) {
        compareOutput.addEventListener('click', toggleOutputComparison);
    }

    // --- UI Updates ---
    function displayResult(result) {
        let output = result.stdout;

        // Hide error details initially
        if (errorDetails) errorDetails.style.display = 'none';

        if (result.stderr) {
            // Show detailed error information
            if (errorDetails && errorContent) {
                errorContent.textContent = result.stderr;
                errorDetails.style.display = 'block';
            }
            output += `\n\n--- 錯誤 ---\n${result.stderr}`;
        }

        if (result.message) {
            output += `\n\n${result.message}`;
        }

        // Add execution time if available
        if (result.execution_time && result.execution_time > 0) {
            output += `\n\n⏱️ 執行時間：${result.execution_time}ms`;
        }

        outputConsole.textContent = output || '(沒有任何輸出)';

        outputConsole.className = '';
        if (result.is_correct) {
            outputConsole.classList.add('correct');
            if (compareOutput) compareOutput.style.display = 'none';
            if (outputComparison) outputComparison.style.display = 'none';
            if (errorDetails) errorDetails.style.display = 'none';

            // Show completion status
            const lesson = lessons[currentLessonIndex];
            if (lesson && lessonStatus) {
                lessonStatus.style.display = 'flex';
            }
        } else if (result.stderr) {
            outputConsole.classList.add('error');
            if (compareOutput) compareOutput.style.display = 'none';
            if (outputComparison) outputComparison.style.display = 'none';
        } else {
            // Show comparison button if there's a validator
            const lesson = lessons[currentLessonIndex];
            if (lesson && lesson.validator && lesson.validator.type === 'stdout_equals') {
                if (compareOutput) compareOutput.style.display = 'flex';
            }
        }

        updateWorkflowState();
    }

    function showError(message) {
        console.error('應用錯誤：', message);
        if (lessonTitle) lessonTitle.textContent = '⚠️ 發生錯誤';
        if (lessonExplanation) {
            lessonExplanation.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">無法載入課程</h3>
                    <p style="color: #991b1b; margin-bottom: 0;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(14, 165, 233, 0.1); border-radius: 10px;">
                    <strong>💡 建議解決步驟：</strong>
                    <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>檢查瀏覽器控制台（F12）查看詳細錯誤訊息</li>
                        <li>確認後端服務正在運行（檢查終端機輸出）</li>
                        <li>確認 <code>web_tutor/lessons.py</code> 文件存在且格式正確</li>
                        <li>嘗試刷新頁面（Ctrl+R 或 Cmd+R）</li>
                    </ol>
                </div>
            `;
        }
        if (outputConsole) {
            outputConsole.textContent = `❌ 錯誤：${message}`;
            outputConsole.className = 'error';
        }
    }

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter or Cmd+Enter to run code
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            executeCode();
        }

        // Ctrl+L or Cmd+L to clear code
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            if (clearButton) clearButton.click();
        }

        // Ctrl+B or Cmd+B to toggle sidebar
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            if (sidebar && sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        // Ctrl+R or Cmd+R to reset code
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (resetButton) resetButton.click();
        }

        // Ctrl+Shift+F for format code
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            if (formatButton) formatButton.click();
        }

        // Ctrl+J or Cmd+J to jump to editor
        if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
            e.preventDefault();
            if (typeof jumpToEditor === 'function') {
                jumpToEditor();
            }
        }

        // Arrow keys for navigation (when not in input fields)
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.key === 'ArrowLeft' && !prevButton.disabled) {
                e.preventDefault();
                prevButton.click();
            } else if (e.key === 'ArrowRight' && !nextButton.disabled) {
                e.preventDefault();
                nextButton.click();
            }
        }
    });

    // --- Persist draft before leaving page ---
    window.addEventListener('beforeunload', () => {
        const lesson = lessons[currentLessonIndex];
        if (lesson && codeEditor) {
            saveDraftForLesson(lesson.id, codeEditor.value);
        }
    });

    // --- Load Pyodide Script Dynamically ---
    async function loadPyodideScript() {
        // Check if already loaded
        if (typeof loadPyodide !== 'undefined') {
            console.log('Pyodide script already loaded');
            return true;
        }

        const cdnUrls = [
            'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js',
            'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js' // Fallback
        ];

        let lastError = null;

        for (let i = 0; i < cdnUrls.length; i++) {
            const url = cdnUrls[i];
            try {
                console.log(`[PYODIDE] 嘗試載入從 CDN ${i + 1}/${cdnUrls.length}: ${url}`);
                if (envStatusValue) {
                    envStatusValue.textContent = `載入腳本... (${i + 1}/${cdnUrls.length})`;
                }
                if (outputConsole) {
                    outputConsole.textContent = `正在從 CDN ${i + 1} 載入 Pyodide 腳本...\n如果載入時間過長，請檢查網絡連接。`;
                }

                await new Promise((resolve, reject) => {
                    let resolved = false;
                    let timeoutId;
                    let checkInterval;

                    const script = document.createElement('script');
                    script.src = url;
                    script.async = true;
                    script.crossOrigin = 'anonymous';

                    const cleanup = () => {
                        if (timeoutId) clearTimeout(timeoutId);
                        if (checkInterval) clearInterval(checkInterval);
                        script.onload = null;
                        script.onerror = null;
                    };

                    script.onload = () => {
                        if (resolved) return;
                        console.log(`[PYODIDE] 腳本標籤載入成功: ${url}`);

                        // Wait for loadPyodide to be available (check multiple times)
                        let attempts = 0;
                        checkInterval = setInterval(() => {
                            attempts++;
                            if (typeof loadPyodide !== 'undefined') {
                                clearInterval(checkInterval);
                                cleanup();
                                console.log(`[PYODIDE] ✓ loadPyodide 函數已可用 (嘗試 ${attempts} 次)`);
                                resolve();
                            } else if (attempts > 40) { // 20 seconds max wait
                                clearInterval(checkInterval);
                                cleanup();
                                reject(new Error('腳本載入但 loadPyodide 函數未定義（等待 20 秒後超時）'));
                            }
                        }, 500);
                    };

                    script.onerror = (event) => {
                        if (resolved) return;
                        resolved = true;
                        cleanup();
                        console.error(`[PYODIDE] ✗ 腳本載入失敗: ${url}`, event);
                        // Remove script if still in DOM
                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                        reject(new Error(`無法從 ${url} 載入腳本（網絡錯誤或 CDN 無法訪問）`));
                    };

                    // Add timeout for script loading (25 seconds)
                    timeoutId = setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            cleanup();
                            // Remove script if still in DOM
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                            reject(new Error(`載入超時: ${url} (25秒)`));
                        }
                    }, 25000);

                    document.head.appendChild(script);
                    console.log(`[PYODIDE] 已添加腳本標籤到 DOM: ${url}`);
                });

                // Successfully loaded
                console.log(`[PYODIDE] ✓ 成功從 CDN ${i + 1} 載入 Pyodide`);
                return true;
            } catch (error) {
                lastError = error;
                console.error(`[PYODIDE] CDN ${i + 1} 載入失敗:`, error);
                if (outputConsole) {
                    outputConsole.textContent = `CDN ${i + 1} 載入失敗，嘗試下一個...\n錯誤: ${error.message}`;
                }

                if (i === cdnUrls.length - 1) {
                    // All CDNs failed
                    const errorMsg = `所有 CDN 載入失敗。\n\n最後一個錯誤: ${error.message}\n\n💡 解決方案：\n1. 檢查網絡連接\n2. 檢查防火牆/代理設置\n3. 嘗試使用 VPN\n4. 檢查瀏覽器控制台 (F12) 查看詳細錯誤`;
                    throw new Error(errorMsg);
                }
                // Try next CDN after a short delay
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return false;
    }

    // --- Theme Toggle ---
    function loadTheme() {
        const savedTheme = localStorage.getItem('python_tutor_theme') || 'light';
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        if (themeToggle) {
            themeToggle.querySelector('span').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('python_tutor_theme', isDark ? 'dark' : 'light');
        if (themeToggle) {
            themeToggle.querySelector('span').textContent = isDark ? '☀️' : '🌙';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    loadTheme();

    // --- Code Formatting ---
    function formatCode() {
        if (!codeEditor) return;

        let code = codeEditor.value;
        if (!code.trim()) return;

        // Basic formatting: fix indentation
        const lines = code.split('\n');
        let formattedLines = [];
        let indentLevel = 0;
        const indentSize = 4;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const trimmed = line.trim();

            // Decrease indent for lines that end blocks
            if (trimmed && (trimmed.startsWith('elif ') || trimmed.startsWith('else:') ||
                trimmed.startsWith('except') || trimmed.startsWith('finally:'))) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            // Add line with proper indentation
            if (trimmed) {
                formattedLines.push(' '.repeat(indentLevel * indentSize) + trimmed);
            } else {
                formattedLines.push('');
            }

            // Increase indent for lines that start blocks
            if (trimmed && (trimmed.endsWith(':') && !trimmed.startsWith('#') &&
                !trimmed.includes('"""') && !trimmed.includes("'''"))) {
                // Don't increase for one-line if statements
                if (!trimmed.match(/^(if|elif|else|for|while|def|class|try|except|finally)\s+.*:\s*#/)) {
                    indentLevel++;
                }
            }

            // Decrease indent after block ends
            if (i < lines.length - 1) {
                const nextLine = lines[i + 1].trim();
                if (nextLine && !nextLine.startsWith('#') &&
                    !nextLine.startsWith('elif ') && !nextLine.startsWith('else:') &&
                    !nextLine.startsWith('except') && !nextLine.startsWith('finally:')) {
                    // Check if we should decrease indent
                    if (trimmed.endsWith(':') && nextLine && !nextLine.match(/^\s/)) {
                        // Next line is not indented, so decrease
                        indentLevel = Math.max(0, indentLevel - 1);
                    }
                }
            }
        }

        codeEditor.value = formattedLines.join('\n');
        updateLineNumbers();
        setDraftState('dirty');
        scheduleDraftSave();
    }

    if (formatButton) {
        formatButton.addEventListener('click', formatCode);
    }

    // --- Code History Viewer ---
    function showCodeHistory() {
        const lesson = lessons[currentLessonIndex];
        if (!lesson) return;

        const history = getCodeHistoryForLesson(lesson.id);
        if (history.length === 0) {
            alert('此課程尚無程式碼歷史記錄。');
            return;
        }

        // Create modal for history
        const modal = document.createElement('div');
        modal.className = 'history-modal';
        modal.innerHTML = `
            <div class="history-modal-content">
                <div class="history-modal-header">
                    <h3>📜 程式碼歷史記錄 - ${lesson.title}</h3>
                    <button class="history-modal-close">✕</button>
                </div>
                <div class="history-list">
                    ${history.map((item, index) => `
                        <div class="history-item">
                            <div class="history-item-header">
                                <span class="history-item-number">版本 ${history.length - index}</span>
                                <span class="history-item-time">${new Date(item.timestamp).toLocaleString('zh-TW')}</span>
                                <button class="history-restore-btn" data-index="${index}">恢復此版本</button>
                            </div>
                            <pre class="history-item-code">${escapeHtml(item.code)}</pre>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        modal.querySelector('.history-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Restore code
        modal.querySelectorAll('.history-restore-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const code = restoreCodeFromHistory(lesson.id, index);
                if (code !== null) {
                    codeEditor.value = code;
                    updateLineNumbers();
                    setDraftState('restored');
                    scheduleDraftSave();
                    modal.remove();
                }
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (historyButton) {
        historyButton.addEventListener('click', showCodeHistory);
    }

    // --- Export Progress ---
    function exportProgress() {
        const data = {
            progress: {
                currentLessonIndex,
                completedLessons: Array.from(completedLessons),
                lastUpdated: new Date().toISOString()
            },
            statistics: learningStats,
            codeHistory: codeHistory,
            drafts: lessonDrafts,
            exportDate: new Date().toISOString(),
            version: '1.1'
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `python_tutor_progress_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    if (exportProgressButton) {
        exportProgressButton.addEventListener('click', exportProgress);
    }

    if (importProgressButton && importFileInput) {
        importProgressButton.addEventListener('click', () => {
            importFileInput.click();
        });
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                importProgressFromFile(file);
            }
        });
    }

    if (resetDataButton) {
        resetDataButton.addEventListener('click', resetLocalData);
    }

    // --- Show Statistics ---
    function showStatistics() {
        const lesson = lessons[currentLessonIndex];
        if (!lesson) return;

        const stats = learningStats[lesson.id] || {
            total_executions: 0,
            successful_executions: 0,
            failed_executions: 0,
            error_count: 0,
            total_time: 0,
            average_time: 0
        };

        const modal = document.createElement('div');
        modal.className = 'stats-modal';
        modal.innerHTML = `
            <div class="stats-modal-content">
                <div class="stats-modal-header">
                    <h3>📊 學習統計 - ${lesson.title}</h3>
                    <button class="stats-modal-close">✕</button>
                </div>
                <div class="stats-content">
                    <div class="stat-item">
                        <span class="stat-label">總執行次數</span>
                        <span class="stat-value">${stats.total_executions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">成功次數</span>
                        <span class="stat-value success">${stats.successful_executions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">失敗次數</span>
                        <span class="stat-value error">${stats.failed_executions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">錯誤次數</span>
                        <span class="stat-value error">${stats.error_count}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">平均執行時間</span>
                        <span class="stat-value">${stats.average_time}ms</span>
                    </div>
                    ${stats.first_success_time ? `
                    <div class="stat-item">
                        <span class="stat-label">首次成功時間</span>
                        <span class="stat-value">${new Date(stats.first_success_time).toLocaleString('zh-TW')}</span>
                    </div>
                    ` : ''}
                    ${stats.last_attempt ? `
                    <div class="stat-item">
                        <span class="stat-label">最後嘗試時間</span>
                        <span class="stat-value">${new Date(stats.last_attempt).toLocaleString('zh-TW')}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.stats-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    if (showStats) {
        showStats.addEventListener('click', showStatistics);
    }

    // Update keyboard shortcuts to include new features
    // (The existing keyboard shortcuts handler is already defined above)

    // --- Unsaved Changes Warning ---
    window.addEventListener('beforeunload', (e) => {
        // Check if there are unsaved drafts or unexported progress
        // Note: draftStatus is 'dirty' when typing, but quickly becomes 'saved' (auto-save to localStorage).
        // However, localStorage is not permanent storage (user might clear it).
        // We prompt if they have completed lessons but haven't exported recently (simplified logic: just prompt if there is progress).

        const hasProgress = completedLessons.size > 0;
        const hasDraft = codeEditor && codeEditor.value.trim().length > 0;

        if (hasProgress || hasDraft) {
            // Standard way to trigger browser's confirmation dialog
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    // --- Start the App ---
    initializeApp();
    updateLineNumbers();
    updateWorkflowState();
});

// --- Parsons Problem Logic ---
function initializeParsonsProblem(lesson) {
    const parsonsContainer = document.getElementById('parsons-container');
    const sourceContainer = document.getElementById('parsons-source');
    const targetContainer = document.getElementById('parsons-target');

    if (!parsonsContainer || !sourceContainer || !targetContainer) return;

    // Smart Guide should be disabled for Parsons to avoid confusion
    if (smartGuide) smartGuide.isActive = false;

    // Reset containers
    sourceContainer.innerHTML = '';
    targetContainer.innerHTML = '';

    const placeholder = document.createElement('div');
    placeholder.className = 'parsons-placeholder';
    placeholder.textContent = '拖拉積木到這裡...';
    targetContainer.appendChild(placeholder);

    // Try to load saved state
    const savedState = loadParsonsState(lesson.id);
    let blocksToRender = [];

    if (savedState && savedState.source && savedState.target) {
        // Render from saved state
        savedState.source.forEach(b => renderBlock(b, sourceContainer));
        savedState.target.forEach(b => renderBlock(b, targetContainer));
        if (savedState.target.length > 0) placeholder.style.display = 'none';
    } else {
        // Initial state: all in source, shuffled
        const blocks = [...(lesson.parsons_blocks || [])].map((code, index) => ({
            code,
            originalIndex: index,
            indent: 0
        }));
        blocks.sort(() => Math.random() - 0.5);
        blocks.forEach(b => renderBlock(b, sourceContainer));
    }

    // Initialize Sortable
    if (typeof Sortable !== 'undefined') {
        const commonOptions = {
            group: 'parsons',
            animation: 150,
            onEnd: () => {
                saveParsonsState(lesson.id);
                updateParsonsCode();
            }
        };

        new Sortable(sourceContainer, { ...commonOptions, sort: false });
        new Sortable(targetContainer, {
            ...commonOptions,
            onAdd: function (evt) {
                const placeholder = targetContainer.querySelector('.parsons-placeholder');
                if (placeholder) placeholder.style.display = 'none';
                saveParsonsState(lesson.id);
                updateParsonsCode();
            },
            onRemove: function (evt) {
                if (targetContainer.children.length === 0 ||
                    (targetContainer.children.length === 1 && targetContainer.children[0].classList.contains('parsons-placeholder'))) {
                    const p = targetContainer.querySelector('.parsons-placeholder');
                    if (p) p.style.display = 'block';
                }
                saveParsonsState(lesson.id);
                updateParsonsCode();
            }
        });
    }
}

function renderBlock(blockData, container) {
    const el = document.createElement('div');
    el.className = 'parsons-block';
    el.dataset.code = blockData.code;
    el.dataset.originalIndex = blockData.originalIndex;
    // Ensure indent is a number
    let indent = parseInt(blockData.indent || 0);
    el.dataset.indent = indent;

    const content = document.createElement('span');
    content.className = 'parsons-block-content';
    content.textContent = blockData.code;

    const controls = document.createElement('div');
    controls.className = 'parsons-controls';

    const indentBtn = document.createElement('button');
    indentBtn.className = 'parsons-btn';
    indentBtn.textContent = '>';
    indentBtn.title = '增加縮排';
    indentBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent drag start
        let current = parseInt(el.dataset.indent || 0);
        if (current < 4) {
            el.dataset.indent = current + 1;
            saveParsonsState(lessons[currentLessonIndex].id);
            updateParsonsCode();
        }
    };

    const unindentBtn = document.createElement('button');
    unindentBtn.className = 'parsons-btn';
    unindentBtn.textContent = '<';
    unindentBtn.title = '減少縮排';
    unindentBtn.onclick = (e) => {
        e.stopPropagation();
        let current = parseInt(el.dataset.indent || 0);
        if (current > 0) {
            el.dataset.indent = current - 1;
            saveParsonsState(lessons[currentLessonIndex].id);
            updateParsonsCode();
        }
    };

    controls.appendChild(unindentBtn);
    controls.appendChild(indentBtn);

    el.appendChild(content);
    el.appendChild(controls);
    container.appendChild(el);
}

function saveParsonsState(lessonId) {
    const sourceContainer = document.getElementById('parsons-source');
    const targetContainer = document.getElementById('parsons-target');
    if (!sourceContainer || !targetContainer) return;

    const getState = (container) => {
        return Array.from(container.querySelectorAll('.parsons-block')).map(el => ({
            code: el.dataset.code,
            originalIndex: parseInt(el.dataset.originalIndex),
            indent: parseInt(el.dataset.indent || 0)
        }));
    };

    const state = {
        source: getState(sourceContainer),
        target: getState(targetContainer)
    };
    localStorage.setItem(`parsons_state_${lessonId}`, JSON.stringify(state));
}

function loadParsonsState(lessonId) {
    try {
        const saved = localStorage.getItem(`parsons_state_${lessonId}`);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Load parsons state failed', e);
        return null;
    }
}

function updateParsonsCode() {
    const targetContainer = document.getElementById('parsons-target');
    const codeEditor = document.getElementById('code-editor');

    if (!targetContainer || !codeEditor) return;

    // Collect code from blocks in target container
    const blocks = Array.from(targetContainer.querySelectorAll('.parsons-block'));
    // Construct string with indentation
    const code = blocks.map(el => {
        const indent = parseInt(el.dataset.indent || 0);
        const spaces = '    '.repeat(indent);
        return spaces + el.dataset.code;
    }).join('\n');

    // Sync to hidden editor for execution
    codeEditor.value = code;
    codeEditor.dispatchEvent(new Event('input'));
}

function checkParsonsSolution(lesson) {
    const targetContainer = document.getElementById('parsons-target');
    if (!targetContainer) return { isCorrect: false, message: '找不到容器' };

    const blocks = Array.from(targetContainer.querySelectorAll('.parsons-block'));
    const currentIndices = blocks.map(el => parseInt(el.dataset.originalIndex));
    const currentIndents = blocks.map(el => parseInt(el.dataset.indent || 0));

    const expectedOrder = lesson.validator.expected_order;
    const expectedIndentation = lesson.validator.expected_indentation || Array(expectedOrder.length).fill(0);

    if (currentIndices.length !== expectedOrder.length) {
        return { isCorrect: false, message: `積木數目不正確（目前 ${currentIndices.length} 個，應為 ${expectedOrder.length} 個）` };
    }

    // Check Order
    for (let i = 0; i < currentIndices.length; i++) {
        if (currentIndices[i] !== expectedOrder[i]) {
            return { isCorrect: false, message: '順序不正確，請再試試！' };
        }
    }

    // Check Indentation
    for (let i = 0; i < currentIndents.length; i++) {
        if (currentIndents[i] !== expectedIndentation[i]) {
            return { isCorrect: false, message: '順序正確，但縮排有誤。請使用 < > 按鈕調整縮排。' };
        }
    }

    return { isCorrect: true, message: '太棒了！邏輯與縮排都正確！' };
}
