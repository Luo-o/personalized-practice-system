import React, { useMemo, useState } from "react";
import { Modal, Input, Button, Tag, DatePicker, message } from "antd";
import { EyeOutlined, CheckOutlined } from "@ant-design/icons";
import "./publish-exam-modal.css";
import QuestionPreviewModal from "../../question-modal/QuestionPreviewModal";
import { useQuestionStore } from "../../../../store";

const DIFFICULTY_OPTIONS = ["全部", "简单", "中等", "困难"];

export default function PublishExamModal({
  open,
  onClose,
  onPublish,
  defaultSubject = "计算机网络",
}) {
  const questions = useQuestionStore((s) => s.questions);

  const [title, setTitle] = useState("");
  const subject = defaultSubject;
  const [deadline, setDeadline] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [difficulty, setDifficulty] = useState("全部");
  const [kp, setKp] = useState("全部");
  const [chapter, setChapter] = useState("全部");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const currentTeacherId = 101;

  const availableQuestions = useMemo(() => {
    return questions.filter(
      (q) =>
        q.subject === subject &&
        (q.ownerType === "system" ||
          (q.ownerType === "teacher" && q.teacherId === currentTeacherId)),
    );
  }, [questions, subject, currentTeacherId]);

  const chapterOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(availableQuestions.map((q) => q.chapter).filter(Boolean)),
    ];
  }, [availableQuestions]);

  const kpOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(
        availableQuestions.flatMap((q) => q.kps || []).filter(Boolean),
      ),
    ];
  }, [availableQuestions]);

  const list = useMemo(() => {
    return availableQuestions.filter((q) => {
      const hitSearch =
        !search ||
        q.title?.includes(search) ||
        q.kps?.some((k) => k.includes(search));

      const hitDifficulty =
        difficulty === "全部" || q.difficulty === difficulty;
      const hitKp = kp === "全部" || q.kps?.includes(kp);
      const hitChapter = chapter === "全部" || q.chapter === chapter;

      return hitSearch && hitDifficulty && hitKp && hitChapter;
    });
  }, [availableQuestions, search, difficulty, kp, chapter]);

  const isSelected = (q) => selected.some((x) => x.id === q.id);

  const add = (q) => {
    setSelected((prev) =>
      prev.find((x) => x.id === q.id) ? prev : [...prev, q],
    );
  };

  const remove = (q) => {
    setSelected((prev) => prev.filter((x) => x.id !== q.id));
  };

  const resetState = () => {
    setTitle("");
    setDeadline(null);
    setSearch("");
    setSelected([]);
    setDifficulty("全部");
    setKp("全部");
    setChapter("全部");
    setPreviewOpen(false);
    setPreviewQuestion(null);
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const submit = () => {
    const t = title.trim();
    if (!t) return message.warning("请填写测验标题");
    if (!deadline) return message.warning("请选择截止日期");
    if (!selected.length) return message.warning("请至少选择 1 道题");

    onPublish?.({
      title: t,
      subject,
      deadline: deadline.format("YYYY-MM-DD HH:mm"),
      questions: selected,
    });

    resetState();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title="发布新测验"
      className="pem-modal"
      closeIcon={<span className="pem-x">×</span>}
      width={980}
    >
      <div className="pem-top">
        <div className="pem-left">
          <div className="pem-field">
            <div className="pem-label">测验标题</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`例如：${subject}基础测验`}
            />
          </div>

          <div className="pem-field pem-field-inline">
            <div className="pem-label">科目</div>
            <div className="pem-subject">{subject}</div>
          </div>

          <div className="pem-field">
            <div className="pem-label">截止时间</div>
            <DatePicker
              className="pem-date"
              value={deadline}
              onChange={(value) => setDeadline(value)}
              placeholder="请选择截止时间"
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="pem-right">
          <div className="pem-picked-title">
            已选题目题单 ({selected.length})
          </div>

          <div className={`pem-picked ${selected.length ? "" : "is-empty"}`}>
            {selected.length ? (
              selected.map((q) => (
                <div key={q.id} className="pem-picked-item">
                  <div className="pem-picked-main">
                    <div className="pem-picked-q">
                      {q.id} {q.title}
                    </div>
                    <div className="pem-picked-tags">
                      <Tag className="pem-tag-sub">{q.subject}</Tag>
                      <Tag>{q.difficulty}</Tag>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pem-mini"
                    onClick={() => remove(q)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="pem-muted">暂未选择题目</div>
            )}
          </div>
        </div>
      </div>

      <div className="pem-bank-head">
        <div className="pem-bank-title">在题库中选题</div>
        <Input
          className="pem-bank-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索题目..."
          allowClear
        />
      </div>

      <div className="pem-filter-card">
        <div className="pem-filter-row">
          <div className="pem-filter-label">难度：</div>
          <div className="pem-chip-row">
            {DIFFICULTY_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`pem-chip ${difficulty === item ? "is-active" : ""}`}
                onClick={() => setDifficulty(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="pem-filter-row">
          <div className="pem-filter-label">知识点：</div>
          <div className="pem-chip-row">
            {kpOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`pem-chip ${kp === item ? "is-active" : ""}`}
                onClick={() => setKp(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="pem-filter-row">
          <div className="pem-filter-label">章节：</div>
          <div className="pem-chip-row">
            {chapterOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`pem-chip ${chapter === item ? "is-active" : ""}`}
                onClick={() => setChapter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pem-bank-list">
        {list.map((q) => (
          <div key={q.id} className="pem-row">
            <div className="pem-row-main">
              <div className="pem-qline">
                <span className="pem-qid">{q.id}</span>
                <span className="pem-qtitle">{q.title}</span>
              </div>
              <div className="pem-tags">
                <Tag className="pem-tag-sub">{q.subject}</Tag>
                <Tag>{q.difficulty}</Tag>
              </div>
            </div>

            <div className="pem-row-actions">
              <button
                type="button"
                className="pem-icon-btn"
                onClick={() => {
                  setPreviewQuestion(q);
                  setPreviewOpen(true);
                }}
                title="预览题目"
              >
                <EyeOutlined />
              </button>

              <button
                type="button"
                className={`pem-add ${isSelected(q) ? "is-selected" : ""}`}
                onClick={() => {
                  if (isSelected(q)) remove(q);
                  else add(q);
                }}
              >
                {isSelected(q) ? <CheckOutlined /> : "+"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pem-actions">
        <Button onClick={handleClose}>取消</Button>
        <Button type="primary" className="pem-primary" onClick={submit}>
          发布测验
        </Button>
      </div>

      <QuestionPreviewModal
        open={previewOpen}
        question={previewQuestion}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewQuestion(null);
        }}
      />
    </Modal>
  );
}
