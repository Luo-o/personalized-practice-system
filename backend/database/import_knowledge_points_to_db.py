import json
import sqlite3
import argparse
from pathlib import Path


def load_json(json_path: str):
    path = Path(json_path)
    if not path.exists():
        raise FileNotFoundError(f"找不到 JSON 文件: {json_path}")
    return json.loads(path.read_text(encoding="utf-8"))


def get_chapter_map(conn: sqlite3.Connection, subject_id: int):
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, name
        FROM chapters
        WHERE subject_id = ?
        """,
        (subject_id,)
    )
    rows = cursor.fetchall()

    chapter_map = {}
    for chapter_id, name in rows:
        chapter_map[str(chapter_id).strip()] = {
            "id": chapter_id,
            "name": name,
        }
    return chapter_map


def has_code_column(conn: sqlite3.Connection) -> bool:
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(knowledge_points)")
    cols = cursor.fetchall()
    col_names = {row[1] for row in cols}
    return "code" in col_names


def import_knowledge_points(db_path: str, json_path: str, subject_id: int, dry_run: bool = False):
    data = load_json(json_path)

    if not isinstance(data, list):
        raise ValueError("knowledge_points.json 顶层必须是 list")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    chapter_map = get_chapter_map(conn, subject_id)
    support_code = has_code_column(conn)

    inserted = 0
    skipped = 0
    failed = 0

    for item in data:
        try:
            code = str(item.get("code", "")).strip()
            name = str(item.get("name", "")).strip()
            chapter_id = str(item.get("chapter_id", "")).strip()  # 这里直接用 chapter_id 作为 chapter_id
            item_subject_id = item.get("subject_id")
            sort_order = int(item.get("sort_order", 0))

            if item_subject_id is not None and int(item_subject_id) != subject_id:
                print(f"⏭️ 跳过：subject_id 不匹配 -> {item}")
                skipped += 1
                continue

            if not name or not chapter_id:
                print(f"⚠️ 跳过：缺少 name 或 chapter_id -> {item}")
                skipped += 1
                continue

            if chapter_id not in chapter_map:
                print(f"⚠️ 跳过：数据库中未找到 chapter_id={chapter_id} -> {name}")
                skipped += 1
                continue

            # 去重策略：
            # 如果 knowledge_points 表有 code 列，就优先按 code 去重
            # 否则按 chapter_id + name 去重
            if support_code and code:
                cursor.execute(
                    """
                    SELECT id FROM knowledge_points
                    WHERE code = ?
                    """,
                    (code,)
                )
            else:
                cursor.execute(
                    """
                    SELECT id FROM knowledge_points
                    WHERE chapter_id = ? AND name = ?
                    """,
                    (chapter_id, name)
                )

            exists = cursor.fetchone()
            if exists:
                print(f"⏭️ 已存在，跳过：{code or name}")
                skipped += 1
                continue

            if dry_run:
                print(
                    f"DRY RUN -> chapter_id={chapter_id}, code={code}, "
                    f"name={name}, sort_order={sort_order}"
                )
            else:
                if support_code:
                    cursor.execute(
                        """
                        INSERT INTO knowledge_points (chapter_id, code, name, sort_order)
                        VALUES (?, ?, ?, ?)
                        """,
                        (chapter_id, code, name, sort_order)
                    )
                else:
                    cursor.execute(
                        """
                        INSERT INTO knowledge_points (chapter_id, name, sort_order)
                        VALUES (?, ?, ?)
                        """,
                        (chapter_id, name, sort_order)
                    )

                print(f"✅ 已插入：{code} {name}")

            inserted += 1

        except Exception as e:
            print(f"❌ 导入失败：{item}，原因：{e}")
            failed += 1

    if dry_run:
        conn.rollback()
    else:
        conn.commit()

    conn.close()

    print("\n========== 导入完成 ==========")
    print(f"插入成功: {inserted}")
    print(f"跳过数量: {skipped}")
    print(f"失败数量: {failed}")


def main():
    parser = argparse.ArgumentParser(description="将 knowledge_points.json 导入 SQLite")
    parser.add_argument("--db", required=True, help="数据库路径，例如 app.db")
    parser.add_argument("--json", required=True, help="knowledge_points.json 路径")
    parser.add_argument("--subject-id", type=int, required=True, help="科目 ID，例如 1")
    parser.add_argument("--dry-run", action="store_true", help="预演，不实际写入")
    args = parser.parse_args()

    import_knowledge_points(
        db_path=args.db,
        json_path=args.json,
        subject_id=args.subject_id,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()