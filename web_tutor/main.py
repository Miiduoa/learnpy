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
# 服務器端執行已被移除以確保安全性。
# 

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup - nothing special needed
    yield
    # On shutdown - nothing to cleanup now
    pass

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
    
    注意：目前前端使用 Pyodide 在瀏覽器中執行 Python 程式碼，
    此端點保留作為備用方案或未來擴展使用（例如服務器端驗證、更複雜的執行環境等）。
    如果前端需要切換到服務器端執行，可以修改 script.js 中的 executeCode() 函數。
    """
    try:
        if not request.code or not request.code.strip():
            raise HTTPException(status_code=400, detail="程式碼不能為空")
        
        if not request.lesson_id:
            raise HTTPException(status_code=400, detail="缺少課程 ID")
        
        # Get inputs from request (default to empty list if not provided)
        inputs = request.inputs if request.inputs else []
        
        # If no inputs provided but lesson has test_inputs, use test_inputs for validation
        if not inputs:
            lesson = next((l for l in LESSONS if l['id'] == request.lesson_id), None)
            if lesson and 'validator' in lesson:
                validator = lesson['validator']
                test_inputs = validator.get("test_inputs", [])
                if test_inputs:
                    inputs = test_inputs
        
        execution_result = await run_code_async(request.code, inputs)
        
        stdout = execution_result["stdout"]
        stderr = execution_result["stderr"]

        # Default response values
        is_correct = False
        message = "執行完成。"

        if stderr:
            is_correct = False
            message = "❌ 程式執行時發生錯誤。"
        else:
            # Find the corresponding lesson for validation
            lesson = next((l for l in LESSONS if l['id'] == request.lesson_id), None)
            if lesson and 'validator' in lesson:
                validator = lesson['validator']
                validator_type = validator.get("type", "no_error")
                expected_output = validator.get("expected_output", "").strip()
                actual_output = stdout.strip()
                
                # Check code structure requirements first (if any)
                structure_passed = True
                structure_feedback = []
                code_requirements = validator.get("code_requirements", {})
                
                if code_requirements and analyze_code:
                    try:
                        structure_passed, structure_feedback, code_summary = analyze_code(
                            request.code, 
                            code_requirements
                        )
                    except Exception as e:
                        # If code analysis fails, log the error but continue with validation
                        # Default to passing structure check if analysis fails
                        structure_passed = True
                        structure_feedback = []
                        print(f"警告：代碼分析時發生錯誤：{str(e)}")
                
                # Then check output
                output_passed = False
                output_message = ""
                
                if validator_type == "stdout_equals":
                    if actual_output == expected_output:
                        output_passed = True
                        output_message = "✅ 輸出結果完全符合題目要求！"
                    else:
                        output_passed = False
                        output_message = f"🤔 程式可以執行，但輸出結果不符.\n\n預期輸出：\n---\n{expected_output}\n---\n\n你的輸出：\n---\n{actual_output}\n---"
                elif validator_type == "stdout_contains":
                    if expected_output in actual_output:
                        output_passed = True
                        output_message = "✅ 輸出包含預期的內容！"
                    else:
                        output_passed = False
                        output_message = f"🤔 程式可以執行，但輸出未包含預期內容.\n\n預期包含：\n---\n{expected_output}\n---\n\n你的輸出：\n---\n{actual_output}\n---"
                elif validator_type == "stdout_ends_with":
                    if actual_output.endswith(expected_output):
                        output_passed = True
                        output_message = "✅ 輸出結尾符合題目要求！"
                    else:
                        output_passed = False
                        output_message = f"🤔 程式可以執行，但輸出結尾不符.\n\n預期結尾：\n---\n{expected_output}\n---\n\n你的輸出結尾：\n---\n{actual_output[-len(expected_output)-20:] if len(actual_output) > len(expected_output) else actual_output}\n---"
                elif validator_type == "stdout_starts_with":
                    if actual_output.startswith(expected_output):
                        output_passed = True
                        output_message = "✅ 輸出開頭符合題目要求！"
                    else:
                        output_passed = False
                        output_message = f"🤔 程式可以執行，但輸出開頭不符.\n\n預期開頭：\n---\n{expected_output}\n---\n\n你的輸出開頭：\n---\n{actual_output[:len(expected_output)+20]}\n---"
                elif validator_type == "no_error":
                    # Just check that there's no error
                    output_passed = True
                    output_message = "✅ 程式執行成功，沒有錯誤。"
                else:
                    # Unknown validator type, default to no-error check
                    output_passed = True
                    output_message = "✅ 程式執行成功，沒有錯誤。"
                
                # Combine structure and output checks
                is_correct = structure_passed and output_passed
                
                # Build comprehensive message
                message_parts = []
                if output_passed and structure_passed:
                    message_parts.append("🎉 恭喜！您的程式完全符合題目要求！")
                    message_parts.append(output_message)
                elif output_passed and not structure_passed:
                    message_parts.append("⚠️ 輸出結果正確，但程式寫法不符合題目要求：")
                    message_parts.append("")
                    message_parts.extend(structure_feedback)
                    message_parts.append("")
                    message_parts.append("💡 請修改程式碼以符合題目的要求。")
                elif not output_passed and structure_passed:
                    message_parts.append(output_message)
                    if structure_feedback:
                        message_parts.append("")
                        message_parts.append("📝 程式結構檢查：")
                        message_parts.extend(structure_feedback)
                else:
                    message_parts.append("❌ 程式需要改進：")
                    message_parts.append("")
                    message_parts.append("輸出問題：")
                    message_parts.append(output_message)
                    message_parts.append("")
                    message_parts.append("程式結構問題：")
                    message_parts.extend(structure_feedback)
                
                message = "\n".join(message_parts)
            else:
                # No lesson or validator found, so any error-free run is "correct"
                is_correct = True
                message = "✅ 程式執行成功，沒有錯誤。"

        return {
            "is_correct": is_correct,
            "stdout": stdout,
            "stderr": stderr,
            "message": message
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"執行時發生錯誤：{str(e)}")

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