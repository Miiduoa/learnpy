# web_tutor/main.py
import asyncio
import os
import sys
import uuid
from io import StringIO
from pathlib import Path
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError, Field

# Import code analyzer for intelligent validation
try:
    from .code_analyzer import analyze_code
except ImportError:
    # Fallback for direct import
    import sys
    from pathlib import Path
    analyzer_path = Path(__file__).parent / "code_analyzer.py"
    if analyzer_path.exists():
        import importlib.util
        spec = importlib.util.spec_from_file_location("code_analyzer", analyzer_path)
        analyzer_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(analyzer_module)
        analyze_code = analyzer_module.analyze_code
    else:
        analyze_code = None

# --- Code Execution ---
# 
# 注意：目前前端使用 Pyodide 在瀏覽器中執行 Python 程式碼，
# 以下執行邏輯保留作為備用方案或未來擴展使用。
# 如果不需要服務器端執行，可以移除相關代碼以簡化應用。

# Use a thread pool executor for running Python code
executor = ThreadPoolExecutor(max_workers=4)

def run_code_sync(code_string, inputs=None):
    """
    Executes a string of Python code and captures its stdout, stderr, and any exceptions.
    Returns a dictionary with 'stdout' and 'stderr'.
    This is the same implementation as in tutor.py but adapted for web use.
    
    Args:
        code_string: Python code to execute
        inputs: List of input values for input() function calls
    """
    if inputs is None:
        inputs = []
    
    # Track input index using a list to allow modification in nested function
    input_index = [0]
    
    def custom_input(prompt=""):
        """Custom input() function that reads from the provided inputs list."""
        if input_index[0] < len(inputs):
            value = inputs[input_index[0]]
            input_index[0] += 1
            # Print the prompt if provided (standard input() behavior)
            if prompt:
                print(prompt, end='', flush=True)
            return value
        else:
            # If no more inputs available, return empty string
            if prompt:
                print(prompt, end='', flush=True)
            return ""
    
    old_stdout = sys.stdout
    redirected_output = StringIO()
    sys.stdout = redirected_output
    error_output = StringIO()
    
    # Create a custom globals dict with our custom input function
    # Handle __builtins__ properly (it might be a module or dict)
    if isinstance(__builtins__, dict):
        custom_builtins = __builtins__.copy()
    else:
        # If __builtins__ is a module, create a dict with its contents
        import builtins
        custom_builtins = {name: getattr(builtins, name) for name in dir(builtins) if not name.startswith('_')}
        custom_builtins.update(__builtins__.__dict__ if hasattr(__builtins__, '__dict__') else {})
    
    custom_builtins['input'] = custom_input
    
    custom_globals = {
        '__builtins__': custom_builtins,
        'input': custom_input
    }
    
    try:
        exec(code_string, custom_globals)
    except Exception as e:
        error_output.write(str(e))
        import traceback
        error_output.write('\n')
        error_output.write('\n'.join(traceback.format_exc().split('\n')[-3:-1]))
    finally:
        sys.stdout = old_stdout

    return {
        "stdout": redirected_output.getvalue(),
        "stderr": error_output.getvalue()
    }

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup - nothing special needed
    yield
    # On shutdown - cleanup executor
    executor.shutdown(wait=True)

app = FastAPI(lifespan=lifespan)

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors with better error messages."""
    errors = exc.errors()
    error_messages = []
    for error in errors:
        field = " -> ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        error_messages.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "請求數據驗證失敗: " + "; ".join(error_messages),
            "errors": errors
        }
    )


# --- Data Models ---

class CodeExecutionRequest(BaseModel):
    code: str = Field(..., min_length=1, description="要執行的 Python 程式碼")
    lesson_id: str = Field(..., min_length=1, description="課程 ID")
    inputs: list[str] = Field(default_factory=list, description="使用者輸入值列表（用於 input() 函數）")
    
    class Config:
        # Allow extra fields to be ignored
        extra = "forbid"

# --- Helper Functions ---

async def run_code_async(code: str, inputs=None):
    """
    Executes code using a thread pool executor and returns the result.
    This is simpler and more reliable than using Jupyter kernel.
    
    Args:
        code: Python code to execute
        inputs: List of input values for input() function calls
    """
    try:
        # Run the code execution in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, run_code_sync, code, inputs)
        return result
    except Exception as e:
        print(f"FATAL EXECUTION ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {"stdout": "", "stderr": f"A fatal error occurred during code execution: {e}"}


# --- API Endpoints ---
# Import lessons from the same directory
# 統一使用 web_tutor/lessons.py 作為課程來源
try:
    from .lessons import LESSONS
except ImportError:
    try:
        # 如果相對導入失敗，嘗試絕對導入
        import sys
        from pathlib import Path
        lessons_path = Path(__file__).parent / "lessons.py"
        if lessons_path.exists():
            import importlib.util
            spec = importlib.util.spec_from_file_location("lessons", lessons_path)
            lessons_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(lessons_module)
            LESSONS = lessons_module.LESSONS
        else:
            LESSONS = []
    except Exception as e:
        print(f"警告：無法載入課程文件：{e}")
        LESSONS = []

@app.get("/api/lessons")
async def get_lessons():
    """
    Endpoint to get the list of all lessons.
    
    返回所有可用的課程列表。如果沒有找到課程，會返回 404 錯誤。
    """
    if not LESSONS:
        raise HTTPException(
            status_code=404, 
            detail="找不到課程內容。請確認 web_tutor/lessons.py 文件存在且包含有效的 LESSONS 列表。"
        )
    
    # 驗證課程數據的完整性
    valid_lessons = []
    for lesson in LESSONS:
        if isinstance(lesson, dict) and 'id' in lesson and 'title' in lesson:
            valid_lessons.append(lesson)
        else:
            print(f"警告：發現無效的課程數據：{lesson}")
    
    if not valid_lessons:
        raise HTTPException(
            status_code=500,
            detail="課程數據格式錯誤。請檢查 web_tutor/lessons.py 文件。"
        )
    
    return valid_lessons

@app.post("/api/run_code")
async def execute_code(request: CodeExecutionRequest):
    """
    Endpoint to execute user code.
    
    SECURITY CHANGE: Server-side execution has been disabled for security reasons.
    This endpoint now returns a 501 Not Implemented error to inform the client
    that they should rely on the client-side Pyodide environment.
    """
    # 為了安全起見，已禁用服務器端代碼執行
    # 這樣可以防止惡意代碼損害主機
    
    return JSONResponse(
        status_code=501,
        content={
            "detail": "為了系統安全，已禁用服務器端代碼執行功能。請確保您的瀏覽器支持並已啟用 WebAssembly 以使用本地 Pyodide 環境。",
            "is_correct": False,
            "stdout": "",
            "stderr": "Security Error: Server-side execution is disabled.",
            "message": "❌ 為了安全起見，不支援伺服器端執行。\n請使用瀏覽器本地環境 (Pyodide) 進行練習。"
        }
    )

# --- Deprecated / Removed Execution Logic ---
# Previous implementation of run_code_async and run_code_sync has been removed
# to prevent potential remote code execution vulnerabilities.
# If server-side execution is absolutely required in the future,
# it MUST be implemented using a secure sandbox (e.g., Docker, nsjail).


# --- Static Files ---

# Get the directory where this file is located
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"

# Serve the main index.html file from the root
@app.get("/")
async def get_index():
    return FileResponse(STATIC_DIR / "index.html")

# Handle favicon requests (avoid 404 errors in logs)
@app.get("/favicon.ico")
async def get_favicon():
    # Return a simple 204 No Content to avoid 404 errors
    from fastapi.responses import Response
    return Response(status_code=204)

# Mount static files directory to serve CSS, JS, and other static assets
# This must be after all API routes are defined
# FastAPI will match specific routes first, then fall back to static files
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")