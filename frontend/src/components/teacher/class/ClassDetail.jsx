import React, { useEffect, useMemo, useState } from "react";
import { Breadcrumb, Button, message } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DotChartOutlined,
} from "@ant-design/icons";
import StudentsPanel from "./student-panel/StudentsPanel";
import ExamsPanel from "./exam-panel/ExamsPanel";
import KnowledgeBubbleMap from "../../student/knowledge-bubble-map/KnowledgeBubbleMap";
import { http } from "../../../api/http";
import "./class-detail.css";

const MENU_ITEMS = [
  {
    key: "students",
    label: "学生管理",
    icon: <TeamOutlined />,
  },
  {
    key: "exams",
    label: "测验管理",
    icon: <FileTextOutlined />,
  },
];

function resolveBubblePayload(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

export default function ClassDetail({ klass, onBack }) {
  const [activeMenu, setActiveMenu] = useState("students");
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleData, setBubbleData] = useState([]);
  const [loadingBubble, setLoadingBubble] = useState(false);

  const subjectOptions = useMemo(() => {
    if (!klass?.subjectId || !klass?.subject) return [];
    return [{ value: String(klass.subjectId), label: klass.subject }];
  }, [klass]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    klass?.subjectId ? String(klass.subjectId) : "",
  );

  useEffect(() => {
    if (klass?.subjectId) {
      setSelectedSubjectId(String(klass.subjectId));
    }
  }, [klass]);

  const fetchBubbleData = async (subjectId = selectedSubjectId) => {
    if (!klass?.id) return;

    setLoadingBubble(true);
    try {
      const res = await http.get(
        `/analytics/classes/${klass.id}/knowledge-mastery`,
        {
          params: subjectId ? { subjectId } : {},
        },
      );

      setBubbleData(resolveBubblePayload(res));
    } catch (error) {
      console.error(error);
      message.error("获取掌握情况失败");
      setBubbleData([]);
    } finally {
      setLoadingBubble(false);
    }
  };

  const handleOpenBubble = async () => {
    setBubbleOpen(true);
    await fetchBubbleData(selectedSubjectId);
  };

  const handleChangeSubject = async (value) => {
    setSelectedSubjectId(value);
    await fetchBubbleData(value);
  };

  const panelTitle = useMemo(() => {
    if (activeMenu === "students") {
      return {
        title: "学生管理",
        sub: `当前班级共 ${klass?.studentsCount || 0} 名学生`,
      };
    }

    return {
      title: "测验管理",
      sub: `当前班级已发布 ${klass?.examsCount || 0} 项测验`,
    };
  }, [activeMenu, klass]);

  return (
    <div className="tcd-page">
      <div className="tcd-shell">
        <aside className="tcd-sidebar">
          <div className="tcd-sidebar-offset" />

          <div className="tcd-sidebar-card">
            <div className="tcd-course-cover">
              <div className="tcd-course-cover-title">{klass?.name}</div>
              <div className="tcd-course-cover-sub">
                {klass?.subject || "未设置科目"} · {klass?.studentsCount || 0}{" "}
                人
              </div>
            </div>

            <div className="tcd-menu">
              {MENU_ITEMS.map((item) => {
                const active = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`tcd-menu-item ${active ? "active" : ""}`}
                    onClick={() => setActiveMenu(item.key)}
                  >
                    <span className="tcd-menu-icon">{item.icon}</span>
                    <span className="tcd-menu-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="tcd-content">
          <div className="tcd-content-top">
            <Breadcrumb
              items={[
                {
                  title: (
                    <button
                      type="button"
                      className="tcd-breadcrumb-back"
                      onClick={onBack}
                    >
                      <HomeOutlined />
                    </button>
                  ),
                },
                {
                  title: (
                    <button
                      type="button"
                      className="tcd-breadcrumb-link"
                      onClick={onBack}
                    >
                      班级列表
                    </button>
                  ),
                },
                {
                  title: (
                    <span className="tcd-breadcrumb-current">
                      {klass?.name}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="tcd-content-body">
            <div className="tcd-panel tcd-panel--fill">
              <div className="tcd-panel-header">
                <div>
                  <div className="tcd-panel-title">{panelTitle.title}</div>
                  <div className="tcd-panel-sub">{panelTitle.sub}</div>
                </div>

                <Button
                  className="tcd-analysis-btn"
                  icon={<DotChartOutlined />}
                  onClick={handleOpenBubble}
                  loading={loadingBubble}
                >
                  掌握情况分析
                </Button>
              </div>

              <div className="tcd-panel-body">
                {activeMenu === "students" ? (
                  <StudentsPanel klass={klass} />
                ) : null}
                {activeMenu === "exams" ? <ExamsPanel klass={klass} /> : null}
              </div>
            </div>
          </div>
        </section>
      </div>

      <KnowledgeBubbleMap
        open={bubbleOpen}
        onClose={() => setBubbleOpen(false)}
        data={bubbleData}
        width={1200}
        height={760}
        title={`${klass?.subject || "当前科目"} 知识点掌握情况`}
        subjects={subjectOptions}
        subject={selectedSubjectId}
        onChangeSubject={handleChangeSubject}
        overlay
      />
    </div>
  );
}
