from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

from pydantic import BaseModel

DEFAULT_DB_PATH = "data/originlens.db"


class RunStore:
    def __init__(self, db_path: str | None = None) -> None:
        self.db_path = Path(db_path or os.getenv("ORIGINLENS_DB_PATH", DEFAULT_DB_PATH))
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init()

    def save(self, run_id: str, kind: str, payload: BaseModel | dict[str, Any]) -> None:
        body = (
            payload.model_dump(mode="json")
            if isinstance(payload, BaseModel)
            else payload
        )
        with self._connect() as connection:
            connection.execute(
                """
                insert or replace into runs (run_id, kind, body_json, created_at)
                values (?, ?, ?, datetime('now'))
                """,
                (run_id, kind, json.dumps(body)),
            )

    def get(self, run_id: str) -> dict[str, Any] | None:
        with self._connect() as connection:
            row = connection.execute(
                "select body_json from runs where run_id = ?",
                (run_id,),
            ).fetchone()
        return json.loads(row["body_json"]) if row else None

    def latest(self, kind: str | None = None) -> dict[str, Any] | None:
        with self._connect() as connection:
            if kind:
                row = connection.execute(
                    """
                    select body_json from runs
                    where kind = ?
                    order by created_at desc, rowid desc
                    limit 1
                    """,
                    (kind,),
                ).fetchone()
            else:
                row = connection.execute(
                    "select body_json from runs order by created_at desc, rowid desc limit 1"
                ).fetchone()
        return json.loads(row["body_json"]) if row else None

    def _init(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                create table if not exists runs (
                    run_id text primary key,
                    kind text not null,
                    body_json text not null,
                    created_at text not null
                )
                """
            )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection
