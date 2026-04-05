import React, { useMemo, useState } from "react";
import { Button, Modal, Tag, message } from "antd";
import {
  PlusOutlined,
  BarChartOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import PublishExamModal from "./PublishExamModal";
import ExamAnalysisModal from "../../exam-analysis/ExamAnalysisModal";
import "./exams-panel.css";
import {
  useExamStore,
  useAuthStore,
  useAnswerRecordStore,
} from "../../../../store";

function buildKnowledgePointStats(questionStats = []) {
  const kpMap = new Map();

  questionStats.forEach((q) => {
    const names = Array.isArray(q.kps) ? q.kps : [];
    names.forEach((name) => {
      if (!name) return;

      const prev = kpMap.get(name) || {
        name,
        totalAccuracy: 0,
        count: 0,
      };

      prev.totalAccuracy += Number(q.accuracy || 0);
      prev.count += 1;

      kpMap.set(name, prev);
    });
  });

  return Array.from(kpMap.values()).map((item) => ({
    name: item.name,
    accuracy: item.count ? Math.round(item.totalAccuracy / item.count) : 0,
  }));
}

function isExpired(deadlineAt) {
  if (!deadlineAt) return false;
  const time = new Date(deadlineAt).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() > time;
}

function getStatusLabel(exam) {
  if (exam.status !== "published") return "未发布";
  if (isExpired(exam.deadlineAt)) return "已截止";
  return "进行中";
}

function StatusTag({ value }) {
  if (value === "进行中") return <Tag color="success">进行中</Tag>;
  if (value === "已截止") return <Tag>已截止</Tag>;
  return <Tag>未发布</Tag>;
}

export default function ExamsPanel({ klass }) {
  const allExams = useExamStore((s) => s.exams);
  const addExam = useExamStore((s) => s.addExam);
  const deleteExam = useExamStore((s) => s.deleteExam);
  const fetchExamQuestions = useExamStore((s) => s.fetchExamQuestions);

  const fetchExamAnalytics = useAnswerRecordStore((s) => s.fetchExamAnalytics);

  const currentUser = useAuthStore((s) => s.currentUser);

  const [publishOpen, setPublishOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [analysisData, setAnalysisData] = useState({
    examStats: {
      submitRate: 0,
      avgAccuracy: 0,
      minAccuracy: 0,
    },
    questionStats: [],
    knowledgePointStats: [],
  });

  const currentTeacherId =
    currentUser?.role === "teacher" ? currentUser.profileId : null;

  const exams = useMemo(() => {
    const list = allExams.filter((e) => Number(e.classId) === Number(klass.id));

    return list.map((e) => ({
      ...e,
      statusLabel: getStatusLabel(e),
      start: e.publishAt || "-",
      end: e.deadlineAt || "-",
      count: e.questionCount || e.questionIds?.length || 0,
      done: e.submissionCount || 0,
      total: klass?.studentsCount || 0,
    }));
  }, [allExams, klass]);

  const totalStudents = klass?.studentsCount ?? 0;

  const removeExam = (exam) => {
    Modal.confirm({
      title: "确认删除测验？",
      content: exam.title,
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteExam(exam.id);
          message.success("已删除测验");
        } catch (error) {
          console.error("删除测验失败：", error);
          message.error(error?.message || "删除测验失败");
        }
      },
    });
  };

  const handleOpenAnalysis = async (exam) => {
    try {
      setAnalysisLoading(true);
      setCurrentExam(exam);
      setAnalysisOpen(true);

      const [{ questions }, analytics] = await Promise.all([
        fetchExamQuestions(exam.id),
        fetchExamAnalytics(exam.id),
      ]);

      const analyticsMap = new Map(
        (analytics || []).map((item) => [Number(item.questionId), item]),
      );

      const questionStats = (questions || []).map((q, index) => {
        const matched = analyticsMap.get(Number(q.id));

        return {
          id: q.id,
          no: index + 1,
          stem: q.title,
          title: q.title,
          subject: q.subjectName,
          difficulty: q.difficulty,
          chapter: q.chapterName,
          source: q.source,
          kps: (q.knowledgePoints || []).map((kp) => kp.name),
          options: q.options || [],
          correct: q.correct,
          accuracy: Number(matched?.accuracy || 0),
          answered: Number(matched?.answered || 0),
          correctCount: Number(matched?.correct || 0),
          easiestWrongOption: matched?.wrongOption || "",
          easiestWrongText: matched?.wrongText || "",
        };
      });

      const avgAccuracy = questionStats.length
        ? Math.round(
            questionStats.reduce(
              (sum, item) => sum + Number(item.accuracy || 0),
              0,
            ) / questionStats.length,
          )
        : 0;

      const minAccuracy = questionStats.length
        ? Math.min(...questionStats.map((item) => Number(item.accuracy || 0)))
        : 0;

      const examStats = {
        submitRate: exam.total
          ? Math.round(((exam.done || 0) / exam.total) * 100)
          : 0,
        avgAccuracy,
        minAccuracy,
      };

      const knowledgePointStats = buildKnowledgePointStats(questionStats);

      setAnalysisData({
        examStats,
        questionStats,
        knowledgePointStats,
      });
    } catch (error) {
      console.error("获取测验分析失败：", error);
      message.error(error?.message || "获取测验分析失败");
      setAnalysisData({
        examStats: {
          submitRate: exam?.total
            ? Math.round(((exam?.done || 0) / exam.total) * 100)
            : 0,
          avgAccuracy: 0,
          minAccuracy: 0,
        },
        questionStats: [],
        knowledgePointStats: [],
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="class-panel class-panel--fill">
      <div className="class-panel-header ep-panel-header">
        <Button
          type="primary"
          className="ep-primary"
          icon={<PlusOutlined />}
          onClick={() => setPublishOpen(true)}
        >
          发布测验
        </Button>
      </div>

      <div className="class-line-tabs">
        <button type="button" className="class-line-tab active">
          班级测验
        </button>
      </div>

      <div className="class-table-panel class-table-panel--fill">
        <div className="class-table-wrap">
          <table className="class-table ep-table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>测验名称</th>
                <th style={{ width: 100 }}>状态</th>
                <th style={{ width: 100 }}>发布时间</th>
                <th style={{ width: 100 }}>截止时间</th>
                <th style={{ width: 80 }}>题目数</th>
                <th style={{ width: 80 }}>提交情况</th>
                <th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>

            <tbody>
              {exams.length > 0 ? (
                exams.map((e) => (
                  <tr key={e.id}>
                    <td className="class-table-cell-title">{e.title}</td>
                    <td>
                      <StatusTag value={e.statusLabel} />
                    </td>
                    <td>{e.start}</td>
                    <td>{e.end}</td>
                    <td>{e.count}</td>
                    <td>
                      {e.done}/{e.total}
                    </td>
                    <td>
                      <div className="ep-action-group">
                        <button
                          type="button"
                          className="ep-action-btn ep-action-btn-primary"
                          onClick={() => handleOpenAnalysis(e)}
                          disabled={analysisLoading && currentExam?.id === e.id}
                        >
                          <BarChartOutlined />
                        </button>

                        <button
                          type="button"
                          className="ep-action-btn ep-action-btn-danger"
                          onClick={() => removeExam(e)}
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="class-table-empty">当前暂无测验数据</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="class-table-footer">
          <span>共 {exams.length} 条</span>
          <div className="class-table-pagination">
            <button type="button" className="page-btn" disabled>
              ‹
            </button>
            <button type="button" className="page-btn active">
              1
            </button>
            <button type="button" className="page-btn" disabled>
              ›
            </button>
          </div>
        </div>
      </div>

      <PublishExamModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        defaultSubject={klass?.subject || klass?.subjectName || "计算机网络"}
        totalStudents={totalStudents}
        classId={klass.id}
        onPublish={async (payload) => {
          try {
            if (!currentTeacherId) {
              message.warning("教师未登录");
              return;
            }

            await addExam({
              id: Date.now(),
              title: payload.title,
              classId: klass.id,
              teacherId: currentTeacherId,
              subjectId: payload.subjectId,
              publishAt: new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
              deadlineAt: payload.deadline,
              status: "published",
              duration: payload.duration ?? null,
              totalScore: payload.questions.length,
              questionIds: payload.questions.map((q) => q.id),
            });

            setPublishOpen(false);
            message.success("已发布测验");
          } catch (error) {
            console.error("发布测验失败：", error);
            message.error(error?.message || "发布测验失败");
          }
        }}
      />

      <ExamAnalysisModal
        open={analysisOpen}
        onClose={() => {
          setAnalysisOpen(false);
          setCurrentExam(null);
          setAnalysisData({
            examStats: {
              submitRate: 0,
              avgAccuracy: 0,
              minAccuracy: 0,
            },
            questionStats: [],
            knowledgePointStats: [],
          });
        }}
        exam={currentExam}
        examStats={analysisData.examStats}
        questionStats={analysisData.questionStats}
        knowledgePointStats={analysisData.knowledgePointStats}
      />
    </div>
  );
}
