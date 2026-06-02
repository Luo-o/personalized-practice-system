#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
将 questions.json 导入 SQLite 数据库

导入内容：
1. questions
2. question_options
3. question_images
4. question_knowledge_points

说明：
- 不存 base64，图片直接存 image_url 路径
- JSON 中 chapter_id 如 "1.1" 需要映射到数据库 chapters.id，如 "1-1"
- JSON 中 knowledge_points 是 code（如 1.1.1），真正入库时按 knowledge_point_names 映射数据库 knowledge_points.id
"""

import json
import sqlite3
import argparse
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional


DEFAULT_CONFIG = {
    "JSON_PATH": "questions.json",
    "DB_PATH": "app.db",
    "SKIP_REVIEW_QUESTIONS": True,
    "DEDUP_BY_TITLE_AND_SOURCE": True,
    "CLEAR_EXISTING_SYSTEM_QUESTIONS": False,
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def safe_int(v, default=0):
    try:
        return int(v)
    except Exception:
        return default


def map_question_chapter_to_db_id(subject_id: int, question_chapter_id: str) -> Optional[str]:
    raw = str(question_chapter_id or "").strip()
    if not raw:
        return None

    parts = raw.split(".")
    if not parts or not parts[0].isdigit():
        return None

    major_chapter_no = int(parts[0])
    return f"{subject_id}-{major_chapter_no}"


def build_kp_name_map(cur) -> Dict[str, List[Dict[str, Any]]]:
    rows = cur.execute(
        """
        SELECT id, chapter_id, name
        FROM knowledge_points
        """
    ).fetchall()

    result = {}
    for kp_id, chapter_id, name in rows:
        result.setdefault(name, []).append({
            "id": kp_id,
            "chapter_id": chapter_id,
            "name": name,
        })
    return result


def find_kp_ids_for_question(
    kp_name_map: Dict[str, List[Dict[str, Any]]],
    knowledge_point_names: List[str],
    chapter_db_id: Optional[str],
) -> List[int]:
    result = []

    for name in knowledge_point_names or []:
        candidates = kp_name_map.get(name, [])
        if not candidates:
            continue

        matched = None

        if chapter_db_id:
            for item in candidates:
                if item["chapter_id"] == chapter_db_id:
                    matched = item
                    break

        if matched is None:
            matched = candidates[0]

        if matched["id"] not in result:
            result.append(matched["id"])

    return result


def clear_existing_system_questions(conn, subject_id: int):
    cur = conn.cursor()

    rows = cur.execute(
        """
        SELECT id
        FROM questions
        WHERE owner_type = 'system' AND subject_id = ?
        """,
        (subject_id,)
    ).fetchall()

    question_ids = [row[0] for row in rows]
    if not question_ids:
        return

    placeholders = ",".join("?" for _ in question_ids)

    cur.execute(f"DELETE FROM question_knowledge_points WHERE question_id IN ({placeholders})", question_ids)
    cur.execute(f"DELETE FROM question_images WHERE question_id IN ({placeholders})", question_ids)
    cur.execute(f"DELETE FROM question_options WHERE question_id IN ({placeholders})", question_ids)
    cur.execute(f"DELETE FROM questions WHERE id IN ({placeholders})", question_ids)

    conn.commit()


def parse_args():
    parser = argparse.ArgumentParser(description="批量导入题目 JSON 到 SQLite")
    parser.add_argument("--json", dest="json_path", default=DEFAULT_CONFIG["JSON_PATH"], help="题目 JSON 路径")
    parser.add_argument("--db", dest="db_path", default=DEFAULT_CONFIG["DB_PATH"], help="SQLite 数据库路径")
    parser.add_argument("--skip-review", dest="skip_review", choices=["true", "false"], default="true")
    parser.add_argument("--dedup", dest="dedup", choices=["true", "false"], default="true")
    parser.add_argument("--clear-existing", dest="clear_existing", choices=["true", "false"], default="false")
    return parser.parse_args()


def import_questions(config):
    json_path = Path(config["JSON_PATH"])
    db_path = Path(config["DB_PATH"])

    if not json_path.exists():
        raise FileNotFoundError(f"找不到 JSON 文件：{json_path}")
    if not db_path.exists():
        raise FileNotFoundError(f"找不到数据库文件：{db_path}")

    questions = load_json(json_path)

    if not isinstance(questions, list):
        raise ValueError("questions.json 顶层必须是数组")

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()

    kp_name_map = build_kp_name_map(cur)

    inserted = 0
    skipped_review = 0
    skipped_duplicate = 0
    skipped_no_kp = 0

    if config["CLEAR_EXISTING_SYSTEM_QUESTIONS"] and questions:
        first_subject_id = safe_int(questions[0].get("subject_id"))
        clear_existing_system_questions(conn, first_subject_id)

    for idx, q in enumerate(questions, start=1):
        if config["SKIP_REVIEW_QUESTIONS"] and q.get("needs_review"):
            skipped_review += 1
            continue

        subject_id = safe_int(q.get("subject_id"))
        chapter_db_id = map_question_chapter_to_db_id(subject_id, q.get("chapter_id"))

        if config["DEDUP_BY_TITLE_AND_SOURCE"]:
            existing = cur.execute(
                """
                SELECT id
                FROM questions
                WHERE title = ? AND IFNULL(source, '') = IFNULL(?, '')
                """,
                (q.get("title"), q.get("source"))
            ).fetchone()
            if existing:
                skipped_duplicate += 1
                continue

        cur.execute(
            """
            INSERT INTO questions (
                owner_type,
                teacher_id,
                title,
                subject_id,
                chapter_id,
                difficulty,
                source,
                is_real,
                analysis,
                correct_answer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                q.get("owner_type", "system"),
                q.get("teacher_id"),
                q.get("title"),
                subject_id,
                chapter_db_id,
                q.get("difficulty", "简单") if q.get("difficulty") in ("简单", "中等", "困难") else "简单",
                q.get("source"),
                safe_int(q.get("is_real"), 0),
                q.get("analysis"),
                q.get("correct_answer"),
            )
        )

        question_id = cur.lastrowid

        for i, opt in enumerate(q.get("options", []), start=1):
            cur.execute(
                """
                INSERT INTO question_options (
                    question_id,
                    option_key,
                    option_text,
                    sort_order
                ) VALUES (?, ?, ?, ?)
                """,
                (
                    question_id,
                    opt.get("key"),
                    opt.get("text"),
                    safe_int(opt.get("sort_order"), i),
                )
            )

        for i, img in enumerate(q.get("images", []), start=1):
            image_url = str(img.get("image_url") or "").strip()
            if not image_url:
                continue

            cur.execute(
                """
                INSERT INTO question_images (
                    question_id,
                    image_url,
                    sort_order
                ) VALUES (?, ?, ?)
                """,
                (
                    question_id,
                    image_url,
                    safe_int(img.get("sort_order"), i),
                )
            )

        kp_ids = find_kp_ids_for_question(
            kp_name_map=kp_name_map,
            knowledge_point_names=q.get("knowledge_point_names", []),
            chapter_db_id=chapter_db_id,
        )

        if not kp_ids:
            skipped_no_kp += 1
        else:
            for kp_id in kp_ids:
                cur.execute(
                    """
                    INSERT OR IGNORE INTO question_knowledge_points (
                        question_id,
                        knowledge_point_id
                    ) VALUES (?, ?)
                    """,
                    (question_id, kp_id)
                )

        inserted += 1

        if idx % 50 == 0:
            print(f"[INFO] 已处理 {idx} 题，当前成功导入 {inserted} 题", file=sys.stderr)

    conn.commit()
    conn.close()

    return {
        "success": True,
        "inserted": inserted,
        "skipped_review": skipped_review,
        "skipped_duplicate": skipped_duplicate,
        "skipped_no_kp": skipped_no_kp,
        "total": len(questions),
    }


def main():
    args = parse_args()

    config = {
        "JSON_PATH": args.json_path,
        "DB_PATH": args.db_path,
        "SKIP_REVIEW_QUESTIONS": args.skip_review == "true",
        "DEDUP_BY_TITLE_AND_SOURCE": args.dedup == "true",
        "CLEAR_EXISTING_SYSTEM_QUESTIONS": args.clear_existing == "true",
    }

    try:
        result = import_questions(config)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": str(e),
        }, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()