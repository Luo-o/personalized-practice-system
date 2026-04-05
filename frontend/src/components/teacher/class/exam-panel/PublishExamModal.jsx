import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Input, Button, Tag, DatePicker, message, Dropdown } from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  DownOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./publish-exam-modal.css";
import QuestionPreviewModal from "../../question-modal/QuestionPreviewModal";
import {
  useQuestionStore,
  useAuthStore,
  useSubjectStore,
} from "../../../../store";

const ALL_CHAPTER = "全部章节";
const ALL_KP = "全部知识点";
const ALL_DIFFICULTY = "全部难度";
const DIFFICULTY_OPTIONS = [ALL_DIFFICULTY, "简单", "中等", "困难"];
const PAGE_SIZE = 20;

function toPreviewQuestion(q) {
  if (!q) return null;

  return {
    ...q,
    subject: q.subjectName,
    chapter: q.chapterName,
    kps: (q.knowledgePoints || []).map((item) => item.name),
  };
}

function extractChapterOrder(name = "") {
  const text = String(name);
  const match =
    text.match(/第\s*(\d+)\s*章/) ||
    text.match(/第\s*(\d+)\s*节/) ||
    text.match(/(\d+)/);

  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function sortChapters(list = []) {
  return [...list].sort((a, b) => {
    const na = extractChapterOrder(a?.name);
    const nb = extractChapterOrder(b?.name);

    if (na !== nb) return na - nb;
    return String(a?.name || "").localeCompare(
      String(b?.name || ""),
      "zh-Hans-CN",
    );
  });
}

function dedupeQuestionsById(list = []) {
  const result = [];
  const seen = new Set();

  for (const item of list) {
    const key = Number(item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export default function PublishExamModal({
  open,
  onClose,
  onPublish,
  defaultSubject = "计算机网络",
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const searchQuestionPage = useQuestionStore((s) => s.searchQuestionPage);

  const subjects = useSubjectStore((s) => s.subjects);
  const chapters = useSubjectStore((s) => s.chapters);
  const chapterTree = useSubjectStore((s) => s.chapterTree);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);
  const fetchSubjectDetail = useSubjectStore((s) => s.fetchSubjectDetail);

  const [title, setTitle] = useState("");
  const subject = defaultSubject;
  const [deadline, setDeadline] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedKnowledgePointName, setSelectedKnowledgePointName] =
    useState(ALL_KP);
  const [selectedDifficulty, setSelectedDifficulty] = useState(ALL_DIFFICULTY);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const [bankQuestions, setBankQuestions] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankLoadingMore, setBankLoadingMore] = useState(false);
  const [bankPage, setBankPage] = useState(1);
  const [bankHasMore, setBankHasMore] = useState(true);
  const [bankTotal, setBankTotal] = useState(0);

  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);

  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.profileId : null;

  const currentSubjectId = useMemo(() => {
    return subjects.find((item) => item.name === subject)?.id ?? null;
  }, [subjects, subject]);

  useEffect(() => {
    if (open && !subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
      });
    }
  }, [open, subjects.length, fetchSubjects]);

  useEffect(() => {
    if (!open || !currentSubjectId) return;

    fetchSubjectDetail(currentSubjectId).catch((error) => {
      console.error("获取科目详情失败：", error);
    });
  }, [open, currentSubjectId, fetchSubjectDetail]);

  const requestParams = useMemo(
    () => ({
      teacherId: currentTeacherId,
      subjectId: currentSubjectId,
      chapterId: selectedChapterId ?? undefined,
      difficulty:
        selectedDifficulty !== ALL_DIFFICULTY ? selectedDifficulty : undefined,
      knowledgePointName:
        selectedKnowledgePointName !== ALL_KP
          ? selectedKnowledgePointName
          : undefined,
      keyword: search.trim() || undefined,
      pageSize: PAGE_SIZE,
    }),
    [
      currentTeacherId,
      currentSubjectId,
      selectedChapterId,
      selectedDifficulty,
      selectedKnowledgePointName,
      search,
    ],
  );

  const loadFirstPage = async () => {
    if (!open || !currentTeacherId || !currentSubjectId) return;

    setBankLoading(true);
    setBankLoadingMore(false);
    loadMoreLockRef.current = false;

    try {
      const res = await searchQuestionPage({
        ...requestParams,
        page: 1,
      });

      setBankQuestions(dedupeQuestionsById(res.list || []));
      setBankPage(res.page || 1);
      setBankHasMore(!!res.hasMore);
      setBankTotal(Number(res.total) || 0);
    } catch (error) {
      console.error("获取题目失败：", error);
      message.error(error?.message || "获取题目失败");
    } finally {
      setBankLoading(false);
    }
  };

  const loadMore = async () => {
    if (
      bankLoading ||
      bankLoadingMore ||
      !bankHasMore ||
      !currentTeacherId ||
      !currentSubjectId ||
      bankQuestions.length >= bankTotal
    ) {
      return;
    }

    setBankLoadingMore(true);

    try {
      const nextPage = bankPage + 1;
      const res = await searchQuestionPage({
        ...requestParams,
        page: nextPage,
      });

      setBankQuestions((prev) =>
        dedupeQuestionsById([...prev, ...(res.list || [])]),
      );
      setBankPage(res.page || nextPage);
      setBankHasMore(!!res.hasMore);
      setBankTotal(Number(res.total) || 0);
    } catch (error) {
      console.error("加载更多题目失败：", error);
      message.error(error?.message || "加载更多题目失败");
    } finally {
      setBankLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadFirstPage();
  }, [open, requestParams]);

  useEffect(() => {
    const node = loadMoreRef.current;

    const shouldEnableObserver =
      open &&
      !!node &&
      bankHasMore &&
      !bankLoading &&
      !bankLoadingMore &&
      bankQuestions.length >= PAGE_SIZE &&
      bankQuestions.length < bankTotal;

    if (!shouldEnableObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (
          first?.isIntersecting &&
          !bankLoading &&
          !bankLoadingMore &&
          bankHasMore &&
          bankQuestions.length < bankTotal &&
          !loadMoreLockRef.current
        ) {
          loadMoreLockRef.current = true;

          loadMore().finally(() => {
            loadMoreLockRef.current = false;
          });
        }
      },
      {
        root: null,
        rootMargin: "250px 0px",
        threshold: 0,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    open,
    bankQuestions.length,
    bankTotal,
    bankHasMore,
    bankLoading,
    bankLoadingMore,
  ]);

  const availableQuestions = bankQuestions;

  const chapterOptions = useMemo(() => {
    const sorted = sortChapters(chapters);

    return [
      { label: ALL_CHAPTER, value: null },
      ...sorted.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    ];
  }, [chapters]);

  const knowledgePointOptions = useMemo(() => {
    let base = chapterTree;

    if (selectedChapterId != null) {
      base = chapterTree.filter(
        (chapter) => String(chapter.id) === String(selectedChapterId),
      );
    }

    const names = [
      ...new Set(
        base
          .flatMap((chapter) => chapter.knowledgePoints || [])
          .map((kp) => kp.name)
          .filter(Boolean),
      ),
    ];

    return [ALL_KP, ...names];
  }, [chapterTree, selectedChapterId]);

  const difficultyOptions = DIFFICULTY_OPTIONS;
  const list = availableQuestions;

  const selectedChapterLabel = useMemo(() => {
    if (selectedChapterId == null) return ALL_CHAPTER;
    return (
      chapters.find((item) => String(item.id) === String(selectedChapterId))
        ?.name || ALL_CHAPTER
    );
  }, [chapters, selectedChapterId]);

  const isSelected = (q) => selected.some((x) => Number(x.id) === Number(q.id));

  const add = (q) => {
    setSelected((prev) =>
      prev.find((x) => Number(x.id) === Number(q.id)) ? prev : [...prev, q],
    );
  };

  const remove = (q) => {
    setSelected((prev) => prev.filter((x) => Number(x.id) !== Number(q.id)));
  };

  const clearSelected = () => {
    setSelected([]);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedChapterId(null);
    setSelectedKnowledgePointName(ALL_KP);
    setSelectedDifficulty(ALL_DIFFICULTY);
  };

  const resetState = () => {
    setTitle("");
    setDeadline(null);
    setSearch("");
    setSelected([]);
    setSelectedChapterId(null);
    setSelectedKnowledgePointName(ALL_KP);
    setSelectedDifficulty(ALL_DIFFICULTY);
    setPreviewOpen(false);
    setPreviewQuestion(null);
    setBankQuestions([]);
    setBankPage(1);
    setBankHasMore(true);
    setBankTotal(0);
    loadMoreLockRef.current = false;
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const submit = () => {
    const t = title.trim();

    if (!t) {
      message.warning("请填写测验标题");
      return;
    }

    if (!deadline) {
      message.warning("请选择截止日期");
      return;
    }

    if (!selected.length) {
      message.warning("请至少选择 1 道题");
      return;
    }

    onPublish?.({
      title: t,
      subject,
      subjectId: selected[0]?.subjectId ?? currentSubjectId ?? null,
      deadline: deadline.format("YYYY-MM-DD HH:mm:ss"),
      questions: selected,
    });

    resetState();
  };

  const createSingleSelectMenu = (options, selectedValue, onSelect) => ({
    items: options.map((item) => {
      const label = typeof item === "string" ? item : item.label;
      const value = typeof item === "string" ? item : item.value;
      const normalizedKey = String(value ?? "__all__");

      return {
        key: normalizedKey,
        label: (
          <div className="pem-dropdown-item">
            <span>{label}</span>
            {selectedValue === value ? <CheckOutlined /> : null}
          </div>
        ),
      };
    }),
    onClick: ({ key }) => {
      const target = options.find((item) => {
        const value = typeof item === "string" ? item : item.value;
        return String(value ?? "__all__") === key;
      });

      const value = typeof target === "string" ? target : target?.value;
      onSelect(value ?? null);
    },
  });

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
          <div className="pem-picked-head">
            <div className="pem-picked-title">
              已选题目题单 ({selected.length})
            </div>

            <button
              type="button"
              className="pem-picked-clear"
              onClick={clearSelected}
              title="一键清空"
              disabled={!selected.length}
            >
              <DeleteOutlined />
            </button>
          </div>

          <div className={`pem-picked ${selected.length ? "" : "is-empty"}`}>
            {selected.length ? (
              selected.map((q) => (
                <div key={q.id} className="pem-picked-item">
                  <div className="pem-picked-main">
                    <div className="pem-picked-q">{q.title}</div>
                    <div className="pem-picked-tags">
                      <Tag className="pem-tag-sub">{q.subjectName}</Tag>
                      <Tag>{q.difficulty}</Tag>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pem-mini"
                    onClick={() => {
                      setPreviewQuestion(toPreviewQuestion(q));
                      setPreviewOpen(true);
                    }}
                    title="预览题目"
                  >
                    <EyeOutlined />
                  </button>
                  <button
                    type="button"
                    className="pem-mini"
                    onClick={() => remove(q)}
                    title="移除题目"
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

      <div className="pem-toolbar">
        <Dropdown
          menu={createSingleSelectMenu(
            chapterOptions,
            selectedChapterId,
            (value) => {
              setSelectedChapterId(value);
              setSelectedKnowledgePointName(ALL_KP);
            },
          )}
          trigger={["click"]}
        >
          <Button className="pem-filter-dropdown-btn">
            章节：{selectedChapterLabel} <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          menu={createSingleSelectMenu(
            knowledgePointOptions,
            selectedKnowledgePointName,
            setSelectedKnowledgePointName,
          )}
          trigger={["click"]}
        >
          <Button className="pem-filter-dropdown-btn">
            知识点：{selectedKnowledgePointName} <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          menu={createSingleSelectMenu(
            difficultyOptions,
            selectedDifficulty,
            setSelectedDifficulty,
          )}
          trigger={["click"]}
        >
          <Button className="pem-filter-dropdown-btn">
            难度：{selectedDifficulty} <DownOutlined />
          </Button>
        </Dropdown>

        <button type="button" className="pem-reset-btn" onClick={resetFilters}>
          <FilterOutlined />
          重置
        </button>
      </div>

      <div className="pem-bank-list">
        {bankLoading ? (
          <div className="pem-empty-panel">加载中...</div>
        ) : list.length ? (
          <>
            {list.map((q) => (
              <div key={q.id} className="pem-row">
                <div className="pem-row-main">
                  <div className="pem-qline">
                    <span className="pem-qtitle">{q.title}</span>
                  </div>
                  <div className="pem-tags">
                    <Tag className="pem-tag-sub">{q.subjectName}</Tag>
                    <Tag>{q.chapterName || "未分章节"}</Tag>
                    {(q.knowledgePoints || []).slice(0, 2).map((kp) => (
                      <Tag key={kp.id || kp.name}>{kp.name}</Tag>
                    ))}
                    <Tag>{q.difficulty}</Tag>
                  </div>
                </div>

                <div className="pem-row-actions">
                  <button
                    type="button"
                    className="pem-icon-btn"
                    onClick={() => {
                      setPreviewQuestion(toPreviewQuestion(q));
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
                    title={isSelected(q) ? "取消选择" : "加入题单"}
                  >
                    {isSelected(q) ? <CheckOutlined /> : "+"}
                  </button>
                </div>
              </div>
            ))}

            <div ref={loadMoreRef} style={{ height: 1 }} />

            {bankLoadingMore ? (
              <div className="pem-empty-panel">正在加载更多...</div>
            ) : null}

            {!bankHasMore && bankQuestions.length > 0 ? (
              <div className="pem-empty-panel">已经到底啦</div>
            ) : null}
          </>
        ) : (
          <div className="pem-empty-panel">当前筛选条件下暂无题目</div>
        )}
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
