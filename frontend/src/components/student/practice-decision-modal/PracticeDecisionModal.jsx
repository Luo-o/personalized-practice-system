import React, { useEffect, useState } from "react";
import { Modal, Slider, Button, Empty, Radio } from "antd";
import {
  RiseOutlined,
  SettingOutlined,
  FilterOutlined,
  SearchOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import "./practice-decision-modal.css";

import SectionCard from "./SectionCard";
import SubjectPickerCard from "./SubjectPickerCard";
import ChapterPickerCard from "./ChapterPickerCard";
import KnowledgePickerCard from "./KnowledgePickerCard";
import { usePracticeDecisionLogic } from "./usePracticeDecisionLogic";

function normalizeRangeValue(value, max) {
  const safeMax = Math.max(0, Number(max) || 0);

  if (!Array.isArray(value) || value.length !== 2) {
    return [0, 0];
  }

  const start = Math.max(0, Math.min(Number(value[0]) || 0, safeMax));
  const end = Math.max(start, Math.min(Number(value[1]) || 0, safeMax));

  return [start, end];
}

function sameRange(a = [], b = []) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === 2 &&
    b.length === 2 &&
    Number(a[0]) === Number(b[0]) &&
    Number(a[1]) === Number(b[1])
  );
}

function InnerPracticeDecisionContent({ strategy, onClose, onStart }) {
  const [submitting, setSubmitting] = useState(false);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const [splitDraft, setSplitDraft] = useState([0, 0]);

  const {
    loading,
    refreshingStats,

    subjects,
    currentSubject,
    safeSubjectId,

    isChapterMode,
    isKnowledgeMode,

    availableChapters,
    availableKnowledgePoints,

    setRequestedTotal,
    setRequestedSplit,

    onlyTrue,
    handleOnlyTrueChange,

    selectedChapters,
    setSelectedChapters,
    selectedKnowledge,
    setSelectedKnowledge,

    mixScope,

    safeTotal,
    safeSplit,
    easy,
    mid,
    hard,

    maxQuestionCount,
    minQuestionCount,

    handleSubjectChange,
    handleSwitchToChapter,
    handleSwitchToKnowledge,
    buildConfig,
  } = usePracticeDecisionLogic(strategy);

  const renderEmpty = !loading && (!subjects.length || !currentSubject);
  const busy = refreshingStats || submitting;

  useEffect(() => {
    if (draggingSplit) return;

    const next = normalizeRangeValue(safeSplit, safeTotal);
    setSplitDraft((prev) => (sameRange(prev, next) ? prev : next));
  }, [safeSplit, safeTotal, draggingSplit]);

  const handleSplitChange = (value) => {
    setDraggingSplit(true);
    setSplitDraft(normalizeRangeValue(value, safeTotal));
  };

  const commitSplitChange = (value) => {
    const next = normalizeRangeValue(value, safeTotal);
    setSplitDraft(next);
    setRequestedSplit(next);
    setDraggingSplit(false);
  };

  const handleStart = async () => {
    const cfg = buildConfig();
    if (!cfg || busy) return;

    try {
      setSubmitting(true);
      await Promise.resolve(onStart?.(cfg));
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="pdm-loading">加载中...</div>;
  }

  if (renderEmpty) {
    return <Empty description="暂无可用科目数据" />;
  }

  return (
    <div className="pdm-shell">
      <div className={`pdm-body ${busy ? "is-busy" : ""}`}>
        <SubjectPickerCard
          subjects={subjects}
          value={safeSubjectId}
          onChange={handleSubjectChange}
        />

        <SectionCard icon={<SearchOutlined />} title="题源范围">
          <Radio.Group
            className="pdm-source-radio"
            value={onlyTrue ? "only_true" : "all"}
            onChange={(e) =>
              handleOnlyTrueChange(e.target.value === "only_true")
            }
            disabled={busy}
          >
            <Radio value="all">全部题目</Radio>
            <Radio value="only_true">只含真题</Radio>
          </Radio.Group>
        </SectionCard>

        <SectionCard
          icon={<SettingOutlined />}
          title="题目数量"
          right={
            <div>
              <div className="pdm-total">
                {safeTotal}
                <span>题</span>
              </div>
              <div className="pdm-minmax">
                最少 {minQuestionCount} 最多 {maxQuestionCount}
              </div>
            </div>
          }
        >
          <Slider
            className="pdm-slider"
            min={minQuestionCount}
            max={Math.max(minQuestionCount, maxQuestionCount)}
            value={safeTotal}
            onChange={setRequestedTotal}
            disabled={maxQuestionCount <= 0 || busy}
            tooltip={{ formatter: (v) => `${v}题` }}
          />
        </SectionCard>

        {strategy === "mix" && (
          <SectionCard icon={<PartitionOutlined />} title="题目分布">
            <div className="pdm-scope-row">
              <button
                type="button"
                className={`pdm-scope-btn ${
                  mixScope === "chapter" ? "is-active" : ""
                }`}
                onClick={handleSwitchToChapter}
                disabled={busy}
              >
                按章节
              </button>

              <button
                type="button"
                className={`pdm-scope-btn ${
                  mixScope === "knowledge" ? "is-active" : ""
                }`}
                onClick={handleSwitchToKnowledge}
                disabled={busy}
              >
                按知识点
              </button>
            </div>
          </SectionCard>
        )}

        {isChapterMode && (
          <ChapterPickerCard
            chapters={availableChapters}
            value={selectedChapters}
            onChange={setSelectedChapters}
          />
        )}

        {isKnowledgeMode && (
          <KnowledgePickerCard
            points={availableKnowledgePoints}
            value={selectedKnowledge}
            onChange={setSelectedKnowledge}
          />
        )}

        {(strategy === "mix" || strategy === "difficulty") && (
          <SectionCard
            icon={<RiseOutlined />}
            title="难度划分"
            right={
              <div className="pdm-section-meta">
                简单 {easy} · 中等 {mid} · 困难 {hard}
              </div>
            }
          >
            <Slider
              className="pdm-slider pdm-split"
              range={{ draggableTrack: true }}
              allowCross={false}
              min={0}
              max={safeTotal}
              value={splitDraft}
              onChange={handleSplitChange}
              onAfterChange={commitSplitChange}
              disabled={safeTotal <= 0 || busy}
              tooltip={{ formatter: (v) => `${v}题` }}
            />
            <div className="pdm-split-labels">
              <span>简单</span>
              <span>困难</span>
            </div>
          </SectionCard>
        )}

        <div className="pdm-actions">
          <Button
            className="pdm-start"
            type="primary"
            size="large"
            onClick={handleStart}
            disabled={maxQuestionCount <= 0 || busy}
            loading={submitting}
          >
            开始刷题
          </Button>
        </div>
      </div>

      {busy && (
        <div className="pdm-overlay">
          <div className="pdm-overlay-card">
            {submitting ? "正在生成题目..." : "正在更新可用题量..."}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticeDecisionModal({
  open,
  strategy,
  onClose,
  onStart,
}) {
  const modalSessionKey = `${String(open)}-${strategy || "none"}`;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      destroyOnHidden
      title={
        <div className="pdm-title">
          <div className="pdm-title-main">刷题设置</div>
        </div>
      }
    >
      <InnerPracticeDecisionContent
        key={modalSessionKey}
        strategy={strategy}
        onClose={onClose}
        onStart={onStart}
      />
    </Modal>
  );
}
