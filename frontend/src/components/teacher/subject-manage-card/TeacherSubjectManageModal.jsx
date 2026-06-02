import React, { useEffect, useMemo, useState } from "react";
import { Modal, Input, Button, Empty, message, Spin, Tag, Divider } from "antd";
import {
  BookOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSubjectStore } from "../../../store";
import "./TeacherSubjectManageModal.css";

function extractSortNum(text = "") {
  const match = String(text).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function createEmptyDraftChapter() {
  return {
    key: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    sort_order: "",
  };
}

export default function TeacherSubjectManageModal({
  open,
  onClose,
  onSuccess,
}) {
  const subjects = useSubjectStore((s) => s.subjects);
  const chapters = useSubjectStore((s) => s.chapters);
  const chapterTree = useSubjectStore((s) => s.chapterTree);
  const loading = useSubjectStore((s) => s.loading);

  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);
  const fetchSubjectDetail = useSubjectStore((s) => s.fetchSubjectDetail);
  const addSubject = useSubjectStore((s) => s.addSubject);
  const addChapter = useSubjectStore((s) => s.addChapter);
  const addKnowledgePoint = useSubjectStore((s) => s.addKnowledgePoint);
  const clearSubjectDetail = useSubjectStore((s) => s.clearSubjectDetail);

  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeChapterId, setActiveChapterId] = useState(null);

  const [subjectName, setSubjectName] = useState("");
  const [draftChapters, setDraftChapters] = useState([
    createEmptyDraftChapter(),
  ]);

  const [kpName, setKpName] = useState("");
  const [kpSortOrder, setKpSortOrder] = useState("");

  useEffect(() => {
    if (!open) return;

    fetchSubjects().catch((error) => {
      console.error("获取科目失败：", error);
      message.error(error?.message || "获取科目失败");
    });
  }, [open, fetchSubjects]);

  useEffect(() => {
    if (!open) return;

    if (!subjects.length) {
      setActiveSubjectId(null);
      return;
    }

    const exists = subjects.some(
      (item) => Number(item.id) === Number(activeSubjectId),
    );

    if (!exists) {
      setActiveSubjectId(subjects[0]?.id ?? null);
    }
  }, [open, subjects, activeSubjectId]);

  useEffect(() => {
    if (!open || !activeSubjectId) {
      clearSubjectDetail();
      setActiveChapterId(null);
      return;
    }

    fetchSubjectDetail(activeSubjectId)
      .then((detail) => {
        const firstChapter = detail?.chapters?.[0];
        setActiveChapterId(firstChapter?.id ?? null);
      })
      .catch((error) => {
        console.error("获取科目详情失败：", error);
        message.error(error?.message || "获取科目详情失败");
      });
  }, [open, activeSubjectId, fetchSubjectDetail, clearSubjectDetail]);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "zh-Hans-CN"),
    );
  }, [subjects]);

  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => {
      const oa = extractSortNum(a.sortOrder ?? a.sort_order ?? a.name);
      const ob = extractSortNum(b.sortOrder ?? b.sort_order ?? b.name);
      if (oa !== ob) return oa - ob;
      return String(a.name).localeCompare(String(b.name), "zh-Hans-CN");
    });
  }, [chapters]);

  const activeChapterKnowledgePoints = useMemo(() => {
    const current = chapterTree.find(
      (item) => String(item.id) === String(activeChapterId),
    );
    return current?.knowledgePoints || [];
  }, [chapterTree, activeChapterId]);

  const currentSubject = useMemo(() => {
    return sortedSubjects.find(
      (item) => Number(item.id) === Number(activeSubjectId),
    );
  }, [sortedSubjects, activeSubjectId]);

  const currentChapter = useMemo(() => {
    return sortedChapters.find(
      (item) => String(item.id) === String(activeChapterId),
    );
  }, [sortedChapters, activeChapterId]);

  const updateDraftChapter = (key, field, value) => {
    setDraftChapters((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addDraftChapterRow = () => {
    setDraftChapters((prev) => [...prev, createEmptyDraftChapter()]);
  };

  const removeDraftChapterRow = (key) => {
    setDraftChapters((prev) => {
      const next = prev.filter((item) => item.key !== key);
      return next.length ? next : [createEmptyDraftChapter()];
    });
  };

  const resetCreateSubjectForm = () => {
    setSubjectName("");
    setDraftChapters([createEmptyDraftChapter()]);
  };

  const handleCreateSubjectWithChapters = async () => {
    const finalSubjectName = subjectName.trim();

    if (!finalSubjectName) {
      message.warning("请输入科目名称");
      return;
    }

    const cleanedChapters = draftChapters
      .map((item, index) => ({
        name: String(item.name || "").trim(),
        sort_order:
          item.sort_order === "" || item.sort_order == null
            ? index + 1
            : Number(item.sort_order),
      }))
      .filter((item) => item.name);

    try {
      const createdSubject = await addSubject({ name: finalSubjectName });

      if (!createdSubject?.id) {
        throw new Error("新增科目后未获取到科目 id");
      }

      for (const chapter of cleanedChapters) {
        await addChapter(createdSubject.id, {
          name: chapter.name,
          sort_order: chapter.sort_order,
        });
      }

      message.success(
        cleanedChapters.length ? "科目及章节创建成功" : "科目创建成功",
      );

      resetCreateSubjectForm();
      await fetchSubjects();
      setActiveSubjectId(createdSubject.id);
      await fetchSubjectDetail(createdSubject.id);

      onSuccess?.();
    } catch (error) {
      console.error("创建科目失败：", error);
      message.error(error?.message || "创建科目失败");
    }
  };

  const handleAddKnowledgePoint = async () => {
    const name = kpName.trim();

    if (!activeSubjectId) {
      message.warning("请先选择科目");
      return;
    }

    if (!activeChapterId) {
      message.warning("请先选择章节");
      return;
    }

    if (!name) {
      message.warning("请输入知识点名称");
      return;
    }

    try {
      await addKnowledgePoint(activeChapterId, {
        subjectId: activeSubjectId,
        name,
        sort_order: kpSortOrder === "" ? undefined : Number(kpSortOrder),
      });

      message.success("新增知识点成功");
      setKpName("");
      setKpSortOrder("");

      await fetchSubjectDetail(activeSubjectId);
      onSuccess?.();
    } catch (error) {
      console.error("新增知识点失败：", error);
      message.error(error?.message || "新增知识点失败");
    }
  };

  return (
    <Modal
      open={open}
      title="管理科目"
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
      className="teacher-subject-manage-modal"
      style={{ top: 40 }}
    >
      <div className="teacher-subject-manage-modal__layout teacher-subject-manage-modal__layout--two">
        <div className="teacher-subject-manage-modal__panel">
          <div className="teacher-subject-manage-modal__panel-header">
            <div className="teacher-subject-manage-modal__panel-title">
              <BookOutlined />
              <span>新增科目</span>
            </div>
          </div>

          <div className="teacher-subject-manage-modal__section">
            <div className="teacher-subject-manage-modal__label">科目名称</div>
            <Input
              placeholder="请输入科目名称"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="teacher-subject-manage-modal__section">
            <div className="teacher-subject-manage-modal__section-head">
              <div className="teacher-subject-manage-modal__label">
                初始章节
              </div>
              <Button type="link" onClick={addDraftChapterRow}>
                + 添加章节行
              </Button>
            </div>

            <div className="teacher-subject-manage-modal__draft-list">
              {draftChapters.map((item, index) => (
                <div
                  key={item.key}
                  className="teacher-subject-manage-modal__draft-row"
                >
                  <div className="teacher-subject-manage-modal__draft-index">
                    {index + 1}
                  </div>

                  <Input
                    placeholder="章节名称，如：第一章 概述"
                    value={item.name}
                    onChange={(e) =>
                      updateDraftChapter(item.key, "name", e.target.value)
                    }
                  />

                  <Input
                    placeholder="排序值"
                    value={item.sort_order}
                    onChange={(e) =>
                      updateDraftChapter(item.key, "sort_order", e.target.value)
                    }
                  />

                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeDraftChapterRow(item.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="teacher-subject-manage-modal__actions">
            <Button onClick={resetCreateSubjectForm}>清空</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateSubjectWithChapters}
            >
              创建
            </Button>
          </div>

          <Divider />

          <div className="teacher-subject-manage-modal__panel-title teacher-subject-manage-modal__panel-title--sub">
            <ApartmentOutlined />
            <span>已有科目</span>
          </div>

          <Spin spinning={loading && !sortedSubjects.length}>
            <div className="teacher-subject-manage-modal__list">
              {sortedSubjects.length ? (
                sortedSubjects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`teacher-subject-manage-modal__list-item ${
                      Number(activeSubjectId) === Number(item.id)
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => setActiveSubjectId(item.id)}
                  >
                    <span className="teacher-subject-manage-modal__list-text">
                      {item.name}
                    </span>
                  </button>
                ))
              ) : (
                <Empty
                  description="暂无科目"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Spin>
        </div>

        <div className="teacher-subject-manage-modal__panel">
          <div className="teacher-subject-manage-modal__panel-header">
            <div className="teacher-subject-manage-modal__panel-title">
              <ApartmentOutlined />
              <span>科目详情</span>
            </div>
            {currentSubject ? (
              <Tag color="blue">当前科目：{currentSubject.name}</Tag>
            ) : null}
          </div>

          <div className="teacher-subject-manage-modal__section">
            <div className="teacher-subject-manage-modal__label">章节列表</div>

            <Spin
              spinning={loading && !!activeSubjectId && !sortedChapters.length}
            >
              <div className="teacher-subject-manage-modal__list teacher-subject-manage-modal__list--chapter">
                {sortedChapters.length ? (
                  sortedChapters.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`teacher-subject-manage-modal__list-item ${
                        String(activeChapterId) === String(item.id)
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() => setActiveChapterId(item.id)}
                    >
                      <span className="teacher-subject-manage-modal__list-text">
                        {item.name}
                      </span>
                      {item.sortOrder !== undefined ||
                      item.sort_order !== undefined ? (
                        <span className="teacher-subject-manage-modal__list-extra">
                          #{item.sortOrder ?? item.sort_order}
                        </span>
                      ) : null}
                    </button>
                  ))
                ) : (
                  <Empty
                    description="当前科目暂无章节"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </Spin>
          </div>

          <Divider />

          <div className="teacher-subject-manage-modal__section">
            <div className="teacher-subject-manage-modal__section-head">
              <div className="teacher-subject-manage-modal__label">知识点</div>
              {currentChapter ? (
                <Tag color="purple">当前章节：{currentChapter.name}</Tag>
              ) : null}
            </div>

            <div className="teacher-subject-manage-modal__kp-create">
              <Input
                placeholder="输入知识点名称"
                value={kpName}
                onChange={(e) => setKpName(e.target.value)}
                maxLength={100}
              />
              <Input
                placeholder="排序值（可选）"
                value={kpSortOrder}
                onChange={(e) => setKpSortOrder(e.target.value)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddKnowledgePoint}
              >
                新增知识点
              </Button>
            </div>

            <Spin
              spinning={loading && !!activeSubjectId && !chapterTree.length}
            >
              <div className="teacher-subject-manage-modal__kp-wrap">
                {activeChapterId ? (
                  activeChapterKnowledgePoints.length ? (
                    activeChapterKnowledgePoints.map((item) => (
                      <div
                        key={item.id || item.name}
                        className="teacher-subject-manage-modal__kp-item"
                      >
                        <span className="teacher-subject-manage-modal__kp-name">
                          {item.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <Empty
                      description="当前章节暂无知识点"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                ) : (
                  <Empty
                    description="当前章节暂无知识点"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </Spin>
          </div>
        </div>
      </div>

      <Divider className="teacher-subject-manage-modal__divider" />

      <div className="teacher-subject-manage-modal__footer-tip">
        说明：章节仅允许在“新增科目”时一并创建；已有科目只支持查看章节并继续补充知识点。
      </div>
    </Modal>
  );
}
