import React, { useMemo, useState } from "react";
import { Button, Input, Tag, Table, Space, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import TeacherSystemBankImportModal from "../../../components/teacher/bank-import-modal/TeacherSystemBankImportModal";
import TeacherAddQuestionDrawer from "../../../components/teacher/question-modal/TeacherAddQuestionDrawer";
import QuestionPreviewModal from "../../../components/teacher/question-modal/QuestionPreviewModal";
import { useQuestionStore, useAuthStore } from "../../../store";
import "./teacher-bank.css";

function diffTagColor(d) {
  if (d === "简单") return "success";
  if (d === "中等") return "warning";
  if (d === "困难") return "error";
  return "default";
}

function normalizeSourceLabel(record) {
  if (record.ownerType === "system") return "系统题";
  return "教师自建";
}

export default function TeacherBankTab() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("全部");
  const [difficulty, setDifficulty] = useState("全部");
  const [kp, setKp] = useState("全部");
  const [chapter, setChapter] = useState("全部");
  const [sourceScope, setSourceScope] = useState("全部");

  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const questions = useQuestionStore((s) => s.questions);
  const addQuestion = useQuestionStore((s) => s.addQuestion);
  const deleteQuestion = useQuestionStore((s) => s.deleteQuestion);
  const updateQuestion = useQuestionStore((s) => s.updateQuestion);

  const currentUser = useAuthStore((s) => s.currentUser);
  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.id : null;

  const availableQuestions = useMemo(() => {
    if (!currentTeacherId) return [];
    return questions.filter(
      (it) =>
        it.ownerType === "system" ||
        (it.ownerType === "teacher" && it.teacherId === currentTeacherId),
    );
  }, [questions, currentTeacherId]);

  const subjectOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(
        availableQuestions.map((item) => item.subject).filter(Boolean),
      ),
    ];
  }, [availableQuestions]);

  const difficultyOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(
        availableQuestions.map((item) => item.difficulty).filter(Boolean),
      ),
    ];
  }, [availableQuestions]);

  const kpOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(
        availableQuestions.flatMap((item) => item.kps || []).filter(Boolean),
      ),
    ];
  }, [availableQuestions]);

  const chapterOptions = useMemo(() => {
    return [
      "全部",
      ...new Set(
        availableQuestions.map((item) => item.chapter).filter(Boolean),
      ),
    ];
  }, [availableQuestions]);

  const sourceOptions = ["全部", "系统题", "自建题"];

  const filtered = useMemo(() => {
    return availableQuestions.filter((it) => {
      const hitQ =
        !q ||
        it.title?.includes(q) ||
        (it.kps || []).some((item) => item.includes(q));

      const hitS = subject === "全部" || it.subject === subject;
      const hitD = difficulty === "全部" || it.difficulty === difficulty;
      const hitK = kp === "全部" || (it.kps || []).includes(kp);
      const hitC = chapter === "全部" || it.chapter === chapter;

      const hitSource =
        sourceScope === "全部" ||
        (sourceScope === "系统题" && it.ownerType === "system") ||
        (sourceScope === "自建题" && it.ownerType === "teacher");

      return hitQ && hitS && hitD && hitK && hitC && hitSource;
    });
  }, [availableQuestions, q, subject, difficulty, kp, chapter, sourceScope]);

  const handleDeleteQuestion = (id) => {
    deleteQuestion(id);
    message.success(`已删除题目：${id}`);
  };

  const stats = useMemo(() => {
    const total = availableQuestions.length;
    const cur = filtered.length;
    return { total, cur };
  }, [availableQuestions, filtered]);

  const columns = [
    { title: "ID", dataIndex: "id", width: 90 },
    {
      title: "科目",
      dataIndex: "subject",
      width: 110,
      render: (v) => <Tag className="tb-tag-subject">{v}</Tag>,
    },
    {
      title: "题目",
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: "难度",
      dataIndex: "difficulty",
      width: 110,
      render: (v) => <Tag color={diffTagColor(v)}>{v}</Tag>,
    },
    {
      title: "知识点",
      dataIndex: "kps",
      width: 240,
      render: (arr = []) => (
        <Space size={6} wrap>
          {arr.map((k) => (
            <Tag key={k} className="tb-tag-kp">
              {k}
            </Tag>
          ))}
        </Space>
      ),
    },
    { title: "章节", dataIndex: "chapter", width: 120 },
    {
      title: "来源",
      dataIndex: "source",
      width: 120,
      render: (_, record) => normalizeSourceLabel(record),
    },
    {
      title: "操作",
      width: 140,
      render: (_, record) => (
        <Space size={10}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setPreviewQuestion(record);
              setPreviewOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingQuestion(record);
              setAddOpen(true);
            }}
          />
          <Popconfirm
            title="删除题目"
            description={`确定删除 ${record.id} 吗？`}
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDeleteQuestion(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="tb-page">
      <div className="tb-filter-card">
        <div className="tb-filter-top">
          <Input
            className="tb-search"
            prefix={<SearchOutlined />}
            placeholder="搜索题目、知识点..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            allowClear
          />

          <div className="tb-stats">
            <span>
              总题目：<b>{stats.total}</b>
            </span>
            <span>
              当前：<b>{stats.cur}</b>
            </span>
          </div>

          <div className="tb-actions">
            <Button
              type="primary"
              className="tb-primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingQuestion(null);
                setAddOpen(true);
              }}
            >
              添加题目
            </Button>
          </div>
        </div>

        <div className="tb-filter-row">
          <div className="tb-filter-label">题目归属：</div>
          <div className="tb-chip-row">
            {sourceOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`tb-chip ${sourceScope === item ? "is-active" : ""}`}
                onClick={() => setSourceScope(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-filter-row">
          <div className="tb-filter-label">科目：</div>
          <div className="tb-chip-row">
            {subjectOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`tb-chip ${subject === item ? "is-active" : ""}`}
                onClick={() => setSubject(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-filter-row">
          <div className="tb-filter-label">难度：</div>
          <div className="tb-chip-row">
            {difficultyOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`tb-chip ${difficulty === item ? "is-active" : ""}`}
                onClick={() => setDifficulty(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-filter-row">
          <div className="tb-filter-label">章节：</div>
          <div className="tb-chip-row">
            {chapterOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`tb-chip ${chapter === item ? "is-active" : ""}`}
                onClick={() => setChapter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="tb-filter-row">
          <div className="tb-filter-label">知识点：</div>
          <div className="tb-chip-row">
            {kpOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`tb-chip ${kp === item ? "is-active" : ""}`}
                onClick={() => setKp(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-table-card">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
        />
      </div>

      <TeacherSystemBankImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={async (bankId) => {
          message.success(`已导入：${bankId}（示例）`);
          setImportOpen(false);
        }}
      />

      <TeacherAddQuestionDrawer
        open={addOpen}
        editingQuestion={editingQuestion}
        onClose={() => {
          setAddOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={async (payload) => {
          if (!currentTeacherId) return;

          if (editingQuestion) {
            updateQuestion(editingQuestion.id, payload);
            message.success(`已更新题目：${editingQuestion.id}`);
          } else {
            addQuestion({
              id: Date.now(),
              ownerType: "teacher",
              teacherId: currentTeacherId,
              source: "自建",
              isReal: false,
              images: [],
              ...payload,
            });
            message.success("已添加题目");
          }

          setAddOpen(false);
          setEditingQuestion(null);
        }}
      />

      <QuestionPreviewModal
        open={previewOpen}
        question={previewQuestion}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewQuestion(null);
        }}
      />
    </div>
  );
}
