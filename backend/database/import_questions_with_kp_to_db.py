#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
将 questions_with_kp.json 导入 SQLite 数据库

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
from pathlib import Path
from typing import Dict, Any, List, Optional


# =========================
# 配置
# =========================
CONFIG = {
    "JSON_PATH": "questions_with_kp.json",
    "DB_PATH": "app.db",

    # 是否跳过 needs_review = true 的题
    "SKIP_REVIEW_QUESTIONS": True,

    # 是否按 标题+来源 去重
    "DEDUP_BY_TITLE_AND_SOURCE": True,

    # 是否清空同 subject_id 的 system 题目后再重新导入
    "CLEAR_EXISTING_SYSTEM_QUESTIONS": False,
}


# =========================
# 工具函数
# =========================
def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def safe_int(v, default=0):
    try:
        return int(v)
    except Exception:
        return default


def map_question_chapter_to_db_id(subject_id: int, question_chapter_id: str) -> Optional[str]:
    """
    将题目中的 chapter_id，如:
      1.1 -> 1-1
      1.2 -> 1-1
      2.1 -> 1-2   （subject_id=1 时）
    映射为数据库 chapters.id

    当前你的数据库 chapter 主键格式是：
      subject_id-章号
    例如：
      1-1, 1-2, 1-3 ...
    """
    raw = str(question_chapter_id or "").strip()
    if not raw:
        return None

    parts = raw.split(".")
    if not parts or not parts[0].isdigit():
        return None

    major_chapter_no = int(parts[0])
    return f"{subject_id}-{major_chapter_no}"


def build_kp_name_map(cur) -> Dict[str, List[Dict[str, Any]]]:
    """
    构建知识点名称到数据库记录的映射
    结构:
    {
      "计算机网络的概念": [
          {"id": 201, "chapter_id": "1-1"},
          ...
      ]
    }
    """
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
    """
    优先按：
    1. 知识点名称 + chapter_id 精确匹配
    2. 若该章下找不到，则退回同名第一条
    """
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


# =========================
# 主导入逻辑
# =========================
def import_questions():
    json_path = Path(CONFIG["JSON_PATH"])
    db_path = Path(CONFIG["DB_PATH"])

    if not json_path.exists():
        raise SystemExit(f"找不到 JSON 文件：{json_path}")
    if not db_path.exists():
        raise SystemExit(f"找不到数据库文件：{db_path}")

    questions = load_json(json_path)

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()

    kp_name_map = build_kp_name_map(cur)

    inserted = 0
    skipped_review = 0
    skipped_duplicate = 0
    skipped_no_kp = 0

    if CONFIG["CLEAR_EXISTING_SYSTEM_QUESTIONS"] and questions:
        first_subject_id = safe_int(questions[0].get("subject_id"))
        clear_existing_system_questions(conn, first_subject_id)
        print(f"已清空 subject_id={first_subject_id} 的 system 题目")

    for idx, q in enumerate(questions, start=1):
        if CONFIG["SKIP_REVIEW_QUESTIONS"] and q.get("needs_review"):
            skipped_review += 1
            continue

        subject_id = safe_int(q.get("subject_id"))
        chapter_db_id = map_question_chapter_to_db_id(subject_id, q.get("chapter_id"))

        # 去重
        if CONFIG["DEDUP_BY_TITLE_AND_SOURCE"]:
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

        # 插入 questions
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

        # 插入 options
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

        # 插入 images
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

        # 插入 question_knowledge_points
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
            print(f"已处理 {idx} 题，当前成功导入 {inserted} 题")

    conn.commit()
    conn.close()

    print("导入完成：")
    print(f"  成功导入题目：{inserted}")
    print(f"  跳过待复核题：{skipped_review}")
    print(f"  跳过重复题目：{skipped_duplicate}")
    print(f"  未匹配到知识点题：{skipped_no_kp}")


if __name__ == "__main__":
    import_questions()