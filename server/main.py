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


class ParseTreeNodeModel(BaseModel):
    label: str
    note: str | None = None
    children: list["ParseTreeNodeModel"] | None = None


class SymbolTableEntryModel(BaseModel):
    name: str
    type: str
    scope: int
    bytes: int
    value: str | int | float | bool | None


class SymbolScopeModel(BaseModel):
    level: int
    label: str
    memory: int


class SymbolTableModel(BaseModel):
    entries: list[SymbolTableEntryModel]
    scopes: list[SymbolScopeModel]


class CompileResponse(BaseModel):
    success: bool
    output: str
    tokens: list[TokenModel]
    parseTree: list[ParseTreeNodeModel] | None = None
    annotatedTree: list[ParseTreeNodeModel] | None = None
    symbolTable: SymbolTableModel | None = None


ParseTreeNodeModel.model_rebuild()


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
    parse_tree_payload: list[ParseTreeNodeModel] | None = None
    annotated_tree_payload: list[ParseTreeNodeModel] | None = None
    symbol_table_payload: SymbolTableModel | None = None

    if isinstance(report, dict):
        # Extract tokens
        raw_tokens = report.get("tokens") or []
        tokens_payload = [
            TokenModel(type=getattr(token, "type", str(token)), value=str(getattr(token, "value", "")))
            for token in raw_tokens
        ]

        # Helper to convert parse tree nodes to Pydantic models
        def convert_node(node, *, include_annotations=False):
            if not hasattr(node, "label"):
                return None
            children = None
            if hasattr(node, "children") and node.children:
                children = [convert_node(child, include_annotations=include_annotations) for child in node.children]
                children = [c for c in children if c is not None]

            note = getattr(node, "note", None)
            if include_annotations:
                annotations = getattr(node, "annotations", []) or []
                hint = getattr(node, "hint", None)
                note_parts = []
                if annotations:
                    note_parts.append("; ".join(str(item) for item in annotations))
                if hint and hint not in note_parts:
                    note_parts.append(str(hint))
                if note_parts:
                    note = " | ".join(note_parts)

            return ParseTreeNodeModel(
                label=node.label,
                note=note,
                children=children or None,
            )

        # Extract parse tree
        parse_tree = report.get("parse_tree") or []
        if parse_tree and isinstance(parse_tree, list):
            converted = [convert_node(node) for node in parse_tree]
            parse_tree_payload = [n for n in converted if n is not None] or None
            converted_annotated = [convert_node(node, include_annotations=True) for node in parse_tree]
            annotated_tree_payload = [n for n in converted_annotated if n is not None] or None

        # Extract symbol table
        records = list(compiler.symbol_table.items())
        entries = [
            SymbolTableEntryModel(
                name=name,
                type=info.get("datatype", ""),
                scope=int(info.get("scope", 0)),
                bytes=int(info.get("bytes", 0)),
                value=info.get("value"),
            )
            for name, info in records
        ]
        scopes = [
            SymbolScopeModel(
                level=scope,
                label="GLOBAL" if scope == 0 else f"LEVEL {scope}",
                memory=total,
            )
            for scope, total in compiler.symbol_table.memory_per_scope().items()
        ]
        symbol_table_payload = SymbolTableModel(entries=entries, scopes=scopes)

    return CompileResponse(
        success=success,
        output=output_text,
        tokens=tokens_payload,
        parseTree=parse_tree_payload,
        annotatedTree=annotated_tree_payload,
        symbolTable=symbol_table_payload,
    )


@app.post("/reset")
def reset_symbol_table():
    """Reset the compiler state (symbol table, snapshots)."""
    compiler.reset()
    return {"status": "reset"}
