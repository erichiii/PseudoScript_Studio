"""Symbol table utilities for the PseudoScript compiler front-end."""

from collections import defaultdict


class SymbolTable:
    """Tracks declared identifiers, their scopes, and memory usage."""

    TYPE_WIDTH = {
        "whole": 4,
        "decimal": 8,
        "logic": 1,
        "text": 8,
        "unknown": 0,
    }

    def __init__(self):
        self._records = {}
        self._scope_totals = defaultdict(int)
        self._current_scope = 0

    @property
    def current_scope(self):
        return self._current_scope

    def push_scope(self):
        self._current_scope += 1

    def pop_scope(self):
        if self._current_scope > 0:
            self._current_scope -= 1

    def declare(self, name, datatype, value=None, scope=None):
        scope = self._resolve_scope(scope)
        width = self.TYPE_WIDTH.get(datatype, 0)
        if name in self._records:
            old = self._records[name]
            self._scope_totals[old["scope"]] -= old.get("bytes", 0)
        record = {
            "datatype": datatype,
            "value": value,
            "scope": scope,
            "bytes": width,
        }
        self._records[name] = record
        self._scope_totals[scope] += width
        return record

    def assign(self, name, value, *, datatype=None):
        if name not in self._records:
            datatype = datatype or "unknown"
            return self.declare(name, datatype, value)
        self._records[name]["value"] = value
        return self._records[name]

    def lookup(self, name):
        return self._records.get(name)

    def __contains__(self, name):
        return name in self._records

    def items(self):
        return self._records.items()

    def clear(self):
        self._records.clear()
        self._scope_totals.clear()
        self._current_scope = 0

    def memory_per_scope(self):
        if not self._scope_totals:
            return {0: 0}
        return dict(sorted(self._scope_totals.items(), key=lambda item: item[0]))

    def _resolve_scope(self, explicit_scope):
        return self._current_scope if explicit_scope is None else explicit_scope
