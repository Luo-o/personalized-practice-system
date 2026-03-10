import React from "react";
import { Modal, Slider, Button, Checkbox, Empty } from "antd";
import { RiseOutlined, SettingOutlined } from "@ant-design/icons";
import "./practice-decision-modal.css";

import SectionCard from "./SectionCard";
import SubjectPickerCard from "./SubjectPickerCard";
import ChapterPickerCard from "./ChapterPickerCard";
import KnowledgePickerCard from "./KnowledgePickerCard";
import { usePracticeDecisionLogic } from "./usePracticeDecisionLogic";

function InnerPracticeDecisionContent({ strategy, onClose, onStart }) {
  const {
    subjects,
    currentSubject,
    safeSubjectId,

    isChapterMode,
    isKnowledgeMode,

    availableChapters,
    availableKnowledgePoints,

    requestedTotal,
    setRequestedTotal,
    setRequestedSplit,

    includeTrue,
    shuffle,
    setShuffle,

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

    difficultyCaps,
    maxQuestionCount,
    minQuestionCount,

    handleSubjectChange,
    handleIncludeTrueChange,
    handleSwitchToChapter,
    handleSwitchToKnowledge,
    buildConfig,
  } = usePracticeDecisionLogic(strategy);

  const renderEmpty = !subjects.length || !currentSubject;

  const handleStart = () => {
    const cfg = buildConfig();
    if (!cfg) return;
    onStart?.(cfg);
    onClose?.();
  };

  return (
    <div className="pdm-body">
      {renderEmpty ? (
        <Empty description="暂无可用科目数据" />
      ) : (
        <>
          <SubjectPickerCard
            subjects={subjects}
            value={safeSubjectId}
            onChange={handleSubjectChange}
          />

          <SectionCard
            icon={<SettingOutlined />}
            title="题目数量"
            right={
              <div>
                {safeTotal}题 / 最多 {maxQuestionCount}题
              </div>
            }
          >
            <Slider
              min={minQuestionCount}
              max={Math.max(minQuestionCount, maxQuestionCount)}
              value={safeTotal}
              onChange={setRequestedTotal}
              disabled={maxQuestionCount <= 0}
            />
          </SectionCard>

          {strategy === "mix" && (
            <SectionCard title="题目分布" icon={<SettingOutlined />}>
              <div className="pdm-scope-row">
                <button
                  type="button"
                  className={`pdm-scope-btn ${
                    mixScope === "chapter" ? "is-active" : ""
                  }`}
                  onClick={handleSwitchToChapter}
                >
                  按章节
                </button>

                <button
                  type="button"
                  className={`pdm-scope-btn ${
                    mixScope === "knowledge" ? "is-active" : ""
                  }`}
                  onClick={handleSwitchToKnowledge}
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
              title="难度划分"
              icon={<RiseOutlined />}
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
                value={safeSplit}
                onChange={setRequestedSplit}
                disabled={safeTotal <= 0}
                tooltip={{ formatter: (v) => `${v}题` }}
              />
              <div className="pdm-split-labels">
                <span>简单</span>
                <span>困难</span>
              </div>
            </SectionCard>
          )}

          <SectionCard icon={<SettingOutlined />} title="其他选项">
            <div className="pdm-checks">
              <label className="pdm-check">
                <Checkbox
                  checked={includeTrue}
                  onChange={(e) => handleIncludeTrueChange(e.target.checked)}
                />
                <span>包含真题</span>
              </label>

              <label className="pdm-check">
                <Checkbox
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                />
                <span>随机顺序</span>
              </label>
            </div>
          </SectionCard>

          <Button
            className="pdm-start"
            type="primary"
            size="large"
            onClick={handleStart}
            disabled={maxQuestionCount <= 0}
          >
            开始刷题
          </Button>
        </>
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
