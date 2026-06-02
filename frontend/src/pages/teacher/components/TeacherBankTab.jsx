import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Input,
  Tag,
  Space,
  message,
  Popconfirm,
  Empty,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  DownOutlined,
  CheckOutlined,
  TagOutlined,
} from "@ant-design/icons";
import TeacherQuestionImportEntryCard from "../../../components/teacher/question-import-card/TeacherQuestionImportEntryCard";
import TeacherSubjectManageEntryCard from "../../../components/teacher/subject-manage-card/TeacherSubjectManageEntryCard";
import TeacherAddQuestionDrawer from "../../../components/teacher/question-modal/TeacherAddQuestionDrawer";
import QuestionPreviewModal from "../../../components/teacher/question-modal/QuestionPreviewModal";
import {
  useQuestionStore,
  useAuthStore,
  useSubjectStore,
} from "../../../store";
import "./teacher-bank.css";

const ALL_SUBJECT = "全部";
const ALL_CHAPTER = "全部章节";
const ALL_KP = "全部知识点";
const ALL_DIFFICULTY = "全部难度";
const ALL_REAL = "全部真题";
const ALL_SOURCE = "全部来源";
const PAGE_SIZE = 20;

function diffTagColor(d) {
  if (d === "简单") return "success";
  if (d === "中等") return "warning";
  if (d === "困难") return "error";
  return "default";
}

function normalizeRealLabel(record) {
  return record?.isReal ? "真题" : "非真题";
}

function toPreviewQuestion(record) {
  if (!record) return null;

  return {
    ...record,
    subject: record.subjectName,
    chapter: record.chapterName,
    kps: (record.knowledgePoints || []).map((kp) => kp.name),
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

function FilterDropdownButton({
  label,
  options,
  value,
  onSelect,
  searchable = false,
  getOptionLabel = (item) =>
    typeof item === "string" ? item : (item?.name ?? ""),
  getOptionValue = (item) =>
    typeof item === "string" ? item : (item?.id ?? item?.name),
}) {
  const [keyword, setKeyword] = useState("");

  const visibleOptions = useMemo(() => {
    if (!searchable) return options;
    const q = keyword.trim().toLowerCase();
    if (!q) return options;
    return options.filter((item) =>
      String(getOptionLabel(item)).toLowerCase().includes(q),
    );
  }, [options, searchable, keyword, getOptionLabel]);

  const currentValue = value == null ? "__ALL__" : String(value);

  const content = (
    <div className="tb-menu">
      {searchable ? (
        <div className="tb-menu-search">
          <Input
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={`搜索${label}`}
            allowClear
          />
        </div>
      ) : null}

      <div className="tb-menu-list">
        {visibleOptions.length ? (
          visibleOptions.map((item) => {
            const optionValue = getOptionValue(item);
            const normalizedOptionValue =
              optionValue == null ? "__ALL__" : String(optionValue);
            const active = normalizedOptionValue === currentValue;

            return (
              <button
                key={normalizedOptionValue}
                type="button"
                className={`tb-menu-item ${active ? "is-active" : ""}`}
                onClick={() => {
                  onSelect(item);
                  setKeyword("");
                }}
              >
                <span>{getOptionLabel(item)}</span>
                {active ? <CheckOutlined /> : null}
              </button>
            );
          })
        ) : (
          <div className="tb-menu-empty">暂无匹配项</div>
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      dropdownRender={() => content}
      placement="bottomLeft"
    >
      <button type="button" className="tb-filter-trigger">
        <span>{label}</span>
        <DownOutlined />
      </button>
    </Dropdown>
  );
}

function createCacheKey(params = {}) {
  return JSON.stringify({
    teacherId: params.teacherId ?? null,
    subjectId: params.subjectId ?? null,
    chapterId: params.chapterId ?? null,
    knowledgePointName: params.knowledgePointName ?? null,
    difficulty: params.difficulty ?? null,
    keyword: params.keyword ?? null,
    isReal: params.isReal ?? null,
    ownerSource: params.ownerSource ?? null,
    pageSize: params.pageSize ?? PAGE_SIZE,
  });
}

export default function TeacherBankTab() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState(ALL_SUBJECT);
  const [difficulty, setDifficulty] = useState(ALL_DIFFICULTY);
  const [kp, setKp] = useState(ALL_KP);
  const [chapter, setChapter] = useState({
    id: undefined,
    name: ALL_CHAPTER,
  });
  const [sourceScope, setSourceScope] = useState(ALL_SOURCE);
  const [realScope, setRealScope] = useState(ALL_REAL);

  const [addOpen, setAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const currentUser = useAuthStore((s) => s.currentUser);

  const questions = useQuestionStore((s) => s.questions);
  const loading = useQuestionStore((s) => s.loading);
  const loadingMore = useQuestionStore((s) => s.loadingMore);
  const hasMore = useQuestionStore((s) => s.hasMore);
  const total = useQuestionStore((s) => s.total);

  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);
  const fetchMoreQuestions = useQuestionStore((s) => s.fetchMoreQuestions);

  const addQuestion = useQuestionStore((s) => s.addQuestion);
  const deleteQuestion = useQuestionStore((s) => s.deleteQuestion);
  const updateQuestion = useQuestionStore((s) => s.updateQuestion);

  const subjectStats = useQuestionStore((s) => s.subjectStats);
  const subjectTotal = useQuestionStore((s) => s.subjectTotal);
  const fetchTeacherQuestionSubjectSummary = useQuestionStore(
    (s) => s.fetchTeacherQuestionSubjectSummary,
  );

  const subjects = useSubjectStore((s) => s.subjects);
  const chapters = useSubjectStore((s) => s.chapters);
  const chapterTree = useSubjectStore((s) => s.chapterTree);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);
  const fetchSubjectDetail = useSubjectStore((s) => s.fetchSubjectDetail);

  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.profileId : null;

  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    if (!subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
      });
    }
  }, [subjects.length, fetchSubjects]);

  useEffect(() => {
    if (!currentTeacherId) return;

    fetchTeacherQuestionSubjectSummary().catch((error) => {
      console.error("获取题目统计失败：", error);
      message.error(error?.message || "获取题目统计失败");
    });
  }, [currentTeacherId, fetchTeacherQuestionSubjectSummary]);

  const subjectOptions = useMemo(() => {
    const names = subjectStats.map((item) => item.subjectName).filter(Boolean);
    return [ALL_SUBJECT, ...names];
  }, [subjectStats]);

  const subjectNameToIdMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((item) => {
      map.set(item.name, item.id);
    });
    return map;
  }, [subjects]);

  const currentSubjectId = useMemo(() => {
    return subject !== ALL_SUBJECT
      ? subjectNameToIdMap.get(subject)
      : undefined;
  }, [subject, subjectNameToIdMap]);

  useEffect(() => {
    if (!currentSubjectId) return;

    fetchSubjectDetail(currentSubjectId).catch((error) => {
      console.error("获取科目详情失败：", error);
    });
  }, [currentSubjectId, fetchSubjectDetail]);

  const requestParams = useMemo(() => {
    const subjectId = currentSubjectId;

    const isReal =
      realScope === ALL_REAL ? undefined : realScope === "真题" ? 1 : 0;

    const ownerSource =
      sourceScope === ALL_SOURCE
        ? undefined
        : sourceScope === "系统题"
          ? "system"
          : "teacher";

    return {
      teacherId: currentTeacherId ?? undefined,
      subjectId,
      chapterId: chapter.id,
      knowledgePointName: kp !== ALL_KP ? kp : undefined,
      difficulty: difficulty !== ALL_DIFFICULTY ? difficulty : undefined,
      keyword: q.trim() || undefined,
      isReal,
      ownerSource,
      pageSize: PAGE_SIZE,
    };
  }, [
    currentTeacherId,
    currentSubjectId,
    chapter,
    kp,
    difficulty,
    q,
    realScope,
    sourceScope,
  ]);

  const cacheKey = useMemo(
    () => createCacheKey(requestParams),
    [requestParams],
  );

  useEffect(() => {
    if (!currentTeacherId) return;

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      useQuestionStore.setState({
        questions: cached.questions,
        page: cached.page,
        pageSize: cached.pageSize,
        total: cached.total,
        hasMore: cached.hasMore,
        loading: false,
        loadingMore: false,
      });
      return;
    }

    fetchQuestions(requestParams)
      .then((list) => {
        const state = useQuestionStore.getState();
        cacheRef.current.set(cacheKey, {
          questions: list || [],
          page: state.page,
          pageSize: state.pageSize,
          total: state.total,
          hasMore: state.hasMore,
        });
      })
      .catch((error) => {
        console.error("获取教师题库失败：", error);
        message.error(error?.message || "获取题库失败");
      });
  }, [currentTeacherId, cacheKey, requestParams, fetchQuestions]);

  useEffect(() => {
    const node = loadMoreRef.current;

    const shouldEnableObserver =
      !!node &&
      hasMore &&
      !loading &&
      !loadingMore &&
      questions.length > 0 &&
      questions.length < total;

    if (!shouldEnableObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (
          first?.isIntersecting &&
          hasMore &&
          !loading &&
          !loadingMore &&
          !loadMoreLockRef.current
        ) {
          loadMoreLockRef.current = true;

          fetchMoreQuestions(requestParams)
            .then(() => {
              const state = useQuestionStore.getState();
              cacheRef.current.set(cacheKey, {
                questions: state.questions,
                page: state.page,
                pageSize: state.pageSize,
                total: state.total,
                hasMore: state.hasMore,
              });
            })
            .catch((error) => {
              console.error("加载更多题目失败：", error);
              message.error(error?.message || "加载更多失败");
            })
            .finally(() => {
              loadMoreLockRef.current = false;
            });
        }
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    hasMore,
    loading,
    loadingMore,
    total,
    questions.length,
    requestParams,
    cacheKey,
    fetchMoreQuestions,
  ]);

  const chapterList = useMemo(() => {
    const list = [...chapters].sort((a, b) => {
      const na = extractChapterOrder(a.name);
      const nb = extractChapterOrder(b.name);

      if (na !== nb) return na - nb;

      return String(a.name || "").localeCompare(
        String(b.name || ""),
        "zh-Hans-CN",
      );
    });

    return [{ id: undefined, name: ALL_CHAPTER }, ...list];
  }, [chapters]);

  const kpList = useMemo(() => {
    let base = chapterTree;

    if (chapter.id != null) {
      base = chapterTree.filter(
        (item) => String(item.id) === String(chapter.id),
      );
    }

    const names = [
      ...new Set(
        base
          .flatMap((item) => item.knowledgePoints || [])
          .map((item) => item.name)
          .filter(Boolean),
      ),
    ];

    return [ALL_KP, ...names];
  }, [chapterTree, chapter.id]);

  const difficultyList = [ALL_DIFFICULTY, "简单", "中等", "困难"];
  const realList = [ALL_REAL, "真题", "非真题"];
  const sourceList = [ALL_SOURCE, "系统题", "自建题"];

  const activeFilters = useMemo(() => {
    const result = [];

    if (subject !== ALL_SUBJECT) {
      result.push({
        key: "subject",
        label: subject,
        onClose: () => {
          setSubject(ALL_SUBJECT);
          setChapter({ id: undefined, name: ALL_CHAPTER });
          setKp(ALL_KP);
          setDifficulty(ALL_DIFFICULTY);
        },
      });
    }

    if (chapter.id != null) {
      result.push({
        key: "chapter",
        label: chapter.name,
        onClose: () => {
          setChapter({ id: undefined, name: ALL_CHAPTER });
          setKp(ALL_KP);
        },
      });
    }

    if (kp !== ALL_KP) {
      result.push({
        key: "kp",
        label: kp,
        onClose: () => setKp(ALL_KP),
      });
    }

    if (difficulty !== ALL_DIFFICULTY) {
      result.push({
        key: "difficulty",
        label: difficulty,
        onClose: () => setDifficulty(ALL_DIFFICULTY),
      });
    }

    if (realScope !== ALL_REAL) {
      result.push({
        key: "real",
        label: realScope,
        onClose: () => setRealScope(ALL_REAL),
      });
    }

    if (sourceScope !== ALL_SOURCE) {
      result.push({
        key: "source",
        label: sourceScope,
        onClose: () => setSourceScope(ALL_SOURCE),
      });
    }

    return result;
  }, [subject, chapter, kp, difficulty, realScope, sourceScope]);

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      cacheRef.current.delete(cacheKey);

      fetchQuestions(requestParams).catch((error) => {
        console.error("删除后刷新题库失败：", error);
      });

      fetchTeacherQuestionSubjectSummary().catch(() => {});
      message.success(`已删除题目：${id}`);
    } catch (error) {
      console.error("删除题目失败：", error);
      message.error(error?.message || "删除题目失败");
    }
  };

  const resetFilters = () => {
    setQ("");
    setSubject(ALL_SUBJECT);
    setChapter({ id: undefined, name: ALL_CHAPTER });
    setKp(ALL_KP);
    setDifficulty(ALL_DIFFICULTY);
    setRealScope(ALL_REAL);
    setSourceScope(ALL_SOURCE);
  };

  const handleImportSuccess = async () => {
    try {
      cacheRef.current.clear();
      await fetchQuestions(requestParams).catch(() => {});
      await fetchTeacherQuestionSubjectSummary().catch(() => {});
      await fetchSubjects().catch(() => {});
    } catch (error) {
      console.error("导入后刷新题库失败：", error);
    }
  };

  const handleSubjectManageSuccess = async () => {
    try {
      await fetchSubjects().catch(() => {});
      await fetchTeacherQuestionSubjectSummary().catch(() => {});
      cacheRef.current.clear();
      await fetchQuestions(requestParams).catch(() => {});
    } catch (error) {
      console.error("管理科目后刷新失败：", error);
    }
  };

  return (
    <div className="tb-page">
      <div className="tb-entry-card-row">
        <div className="tb-entry-card-col">
          <TeacherQuestionImportEntryCard
            onImportSuccess={handleImportSuccess}
          />
        </div>
        <div className="tb-entry-card-col">
          <TeacherSubjectManageEntryCard
            onSuccess={handleSubjectManageSuccess}
          />
        </div>
      </div>

      <div className="tb-board">
        <div className="tb-top-row">
          <div className="tb-subject-tabs">
            {subjectOptions.map((item) => {
              const count =
                item === ALL_SUBJECT
                  ? subjectTotal
                  : subjectStats.find((s) => s.subjectName === item)?.count ||
                    0;

              return (
                <button
                  key={item}
                  type="button"
                  className={`tb-subject-tab ${subject === item ? "is-active" : ""}`}
                  onClick={() => {
                    setSubject(item);
                    setChapter({ id: undefined, name: ALL_CHAPTER });
                    setKp(ALL_KP);
                    setDifficulty(ALL_DIFFICULTY);
                  }}
                >
                  <span className="tb-subject-name">{item}</span>
                  <span className="tb-subject-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tb-toolbar-row">
          <Input
            className="tb-search"
            prefix={<SearchOutlined />}
            placeholder="搜索题目、知识点..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            allowClear
          />

          <div className="tb-toolbar-actions">
            <FilterDropdownButton
              label="章节"
              options={chapterList}
              value={chapter.id}
              onSelect={(item) => {
                setChapter(item);
                setKp(ALL_KP);
              }}
              getOptionLabel={(item) => item.name}
              getOptionValue={(item) => item.id}
            />

            <FilterDropdownButton
              label="知识点"
              options={kpList}
              value={kp}
              onSelect={setKp}
              searchable
            />

            <FilterDropdownButton
              label="难度"
              options={difficultyList}
              value={difficulty}
              onSelect={setDifficulty}
            />

            <FilterDropdownButton
              label="真题"
              options={realList}
              value={realScope}
              onSelect={setRealScope}
            />

            <FilterDropdownButton
              label="来源"
              options={sourceList}
              value={sourceScope}
              onSelect={setSourceScope}
            />

            <button
              type="button"
              className="tb-reset-btn"
              onClick={resetFilters}
            >
              <FilterOutlined />
              重置
            </button>
          </div>
        </div>

        <div className="tb-selected-row">
          <div className="tb-selected-line">
            <span className="tb-selected-label">
              <TagOutlined />
              当前选择：
            </span>
            <div className="tb-selected-tags">
              {activeFilters.map((item) => (
                <Tag
                  key={item.key}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    item.onClose();
                  }}
                  className="tb-selected-tag"
                >
                  {item.label}
                </Tag>
              ))}
            </div>

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

        <div className="tb-list">
          {loading ? (
            <div className="tb-empty-wrap">
              <Empty description="加载中..." />
            </div>
          ) : questions.length ? (
            <>
              {questions.map((record) => (
                <div key={record.id} className="tb-item tb-item-inline">
                  <div className="tb-col-title">
                    <button
                      type="button"
                      className="tb-item-title tb-item-title-inline"
                      onClick={() => {
                        setPreviewQuestion(toPreviewQuestion(record));
                        setPreviewOpen(true);
                      }}
                    >
                      {record.title}
                    </button>
                  </div>

                  <div className="tb-col-kp">
                    {(record.knowledgePoints || []).length ? (
                      <div className="tb-inline-tags">
                        {(record.knowledgePoints || []).slice(0, 3).map((k) => (
                          <Tag key={k.id || k.name} className="tb-tag-kp">
                            {k.name}
                          </Tag>
                        ))}
                        {(record.knowledgePoints || []).length > 3 ? (
                          <span className="tb-more-text">
                            +{record.knowledgePoints.length - 3}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="tb-empty-text">暂无知识点</span>
                    )}
                  </div>

                  <div className="tb-col-real">
                    <Tag
                      className={record.isReal ? "tb-tag-real" : "tb-tag-fake"}
                    >
                      {normalizeRealLabel(record)}
                    </Tag>
                  </div>

                  <div className="tb-col-difficulty">
                    <Tag color={diffTagColor(record.difficulty)}>
                      {record.difficulty || "未设置"}
                    </Tag>
                  </div>

                  <div className="tb-col-actions">
                    <Space size={4}>
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setPreviewQuestion(toPreviewQuestion(record));
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
                  </div>
                </div>
              ))}

              <div ref={loadMoreRef} style={{ height: 1 }} />

              {loadingMore ? (
                <div className="tb-empty-wrap">
                  <Empty description="正在加载更多..." />
                </div>
              ) : null}

              {!hasMore && questions.length > 0 ? (
                <div className="tb-empty-wrap">
                  <Empty description="已经到底啦" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="tb-empty-wrap">
              <Empty description="当前筛选条件下暂无题目" />
            </div>
          )}
        </div>
      </div>

      <TeacherAddQuestionDrawer
        open={addOpen}
        editingQuestion={editingQuestion}
        onClose={() => {
          setAddOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={async (payload) => {
          try {
            if (!currentTeacherId) {
              message.warning("教师未登录");
              return;
            }

            if (editingQuestion) {
              await updateQuestion(editingQuestion.id, payload);
              message.success(`已更新题目：${editingQuestion.id}`);
            } else {
              await addQuestion({
                id: Date.now(),
                ownerType: "teacher",
                teacherId: currentTeacherId,
                isReal: payload?.isReal ?? false,
                ...payload,
              });
              message.success("已添加题目");
            }

            cacheRef.current.clear();

            fetchQuestions(requestParams).catch(() => {});
            fetchTeacherQuestionSubjectSummary().catch(() => {});
            fetchSubjects().catch(() => {});

            setAddOpen(false);
            setEditingQuestion(null);
          } catch (error) {
            console.error("保存题目失败：", error);
            message.error(error?.message || "保存题目失败");
          }
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
