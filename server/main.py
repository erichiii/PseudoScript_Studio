"""HTTP API for the PseudoScript compiler pipeline."""

from __future__ import annotations

import io
from contextlib import redirect_stdout

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from compiler.pseudoscript import PseudoScriptCompiler


app = FastAPI(title="PseudoScript Compiler API", version="1.0.0")
compiler = PseudoScriptCompiler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CompileRequest(BaseModel):
    source: str


class TokenModel(BaseModel):
    type: str
    value: str


class CompileResponse(BaseModel):
    success: bool
    output: str
    tokens: list[TokenModel]


@app.get("/health")
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok"}


@app.post("/compile", response_model=CompileResponse)
def compile_code(payload: CompileRequest):
    """Run the compiler pipeline for the provided source code."""
    source = payload.source or ""
    if not source.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty.")

    buffer = io.StringIO()
    try:
        with redirect_stdout(buffer):
            report = compiler.compile(source)
    except Exception as exc:  # pragma: no cover - surfaced to client
        raise HTTPException(status_code=500, detail=f"Compiler error: {exc}") from exc

    output_text = buffer.getvalue()
    success = bool(report.get("success")) if isinstance(report, dict) else False

    tokens_payload: list[TokenModel] = []
    if isinstance(report, dict):
        raw_tokens = report.get("tokens") or []
        tokens_payload = [
            TokenModel(type=getattr(token, "type", str(token)), value=str(getattr(token, "value", "")))
            for token in raw_tokens
        ]

    return CompileResponse(success=success, output=output_text, tokens=tokens_payload)


@app.post("/reset")
def reset_symbol_table():
    """Reset the compiler state (symbol table, snapshots)."""
    compiler.reset()
    return {"status": "reset"}
