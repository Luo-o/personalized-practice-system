// import React, { useMemo, useState } from "react";
// import { Input, Tag, Select } from "antd";
// import {
//   FileTextOutlined,
//   FilterOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";
// import { useSearchParams } from "react-router-dom";
// import PageHeader from "../../components/PageHeader";
// import WrongQuestionSheetDrawer from "../../components/student/wrong-book/WrongQuestionSheetDrawer";
// import {
//   useAnswerRecordStore,
//   useQuestionStore,
//   useAuthStore,
// } from "../../store";
// import "./wrong-book.css";

// function toParams(prev, patch) {
//   const next = new URLSearchParams(prev);
//   Object.entries(patch).forEach(([k, v]) => {
//     const val = (v ?? "").toString().trim();
//     if (!val) next.delete(k);
//     else next.set(k, val);
//   });
//   return next;
// }

// export default function WrongBook() {
//   const answerRecords = useAnswerRecordStore((s) => s.answerRecords);
//   const questions = useQuestionStore((s) => s.questions);
//   const currentUser = useAuthStore((s) => s.currentUser);

//   const currentStudentId =
//     currentUser?.role === "student" ? currentUser.id : null;

//   const wrongs = useMemo(() => {
//     if (!currentStudentId) return [];

//     const records = answerRecords.filter(
//       (r) => r.studentId === currentStudentId && !r.isCorrect,
//     );

//     const grouped = new Map();

//     records.forEach((r) => {
//       const q = questions.find((item) => item.id === r.questionId);
//       if (!q) return;

//       const old = grouped.get(r.questionId);
//       if (!old) {
//         grouped.set(r.questionId, {
//           id: `w_${r.questionId}`,
//           questionId: r.questionId,
//           subject: q.subject,
//           wrongCount: 1,
//           lastPracticeAt: (r.answeredAt || "").split(" ")[0],
//           chapterText: q.chapter,
//           knowledgePoint: q.kps?.[0] || "未归类",
//           title: q.title,
//           difficulty: q.difficulty,
//           tag: q.kps?.[0] || "",
//           question: {
//             id: q.id,
//             difficulty: q.difficulty,
//             tag: `${q.subject} · ${q.chapter}`,
//             stem: q.title,
//             options: q.options,
//             correct: q.correct,
//             explanation: q.analysis,
//           },
//           lastAttempt: {
//             answer: r.selectedAnswer,
//             answeredAt: r.answeredAt,
//           },
//           mastered: false,
//         });
//       } else {
//         old.wrongCount += 1;
//         old.lastPracticeAt = (r.answeredAt || "").split(" ")[0];
//         old.lastAttempt = {
//           answer: r.selectedAnswer,
//           answeredAt: r.answeredAt,
//         };
//       }
//     });

//     return Array.from(grouped.values()).sort(
//       (a, b) =>
//         new Date(b.lastAttempt.answeredAt) - new Date(a.lastAttempt.answeredAt),
//     );
//   }, [answerRecords, questions, currentStudentId]);

//   const [masteredIds, setMasteredIds] = useState([]);
//   const [searchParams, setSearchParams] = useSearchParams();

//   const enrichedWrongs = useMemo(() => {
//     return wrongs.map((w) => ({
//       ...w,
//       mastered: masteredIds.includes(w.id),
//     }));
//   }, [wrongs, masteredIds]);

//   const totalWrongCount = enrichedWrongs.length;
//   const masteredCount = enrichedWrongs.filter((w) => w.mastered).length;
//   const pendingCount = enrichedWrongs.filter((w) => !w.mastered).length;

//   const subjectValue = searchParams.get("sub") || "全部科目";
//   const kpSearch = searchParams.get("kp") || "";
//   const tabParam = searchParams.get("tab") || "";

//   const subjectOptions = useMemo(() => {
//     const set = new Set();
//     for (const w of enrichedWrongs) set.add(w.subject || "未设置");
//     const list = Array.from(set)
//       .sort()
//       .map((s) => ({ value: s, label: s }));
//     return [{ value: "全部科目", label: "全部科目" }, ...list];
//   }, [enrichedWrongs]);

//   const wrongsBySubject = useMemo(() => {
//     if (subjectValue === "全部科目") return enrichedWrongs;
//     return enrichedWrongs.filter(
//       (w) => (w.subject || "未设置") === subjectValue,
//     );
//   }, [enrichedWrongs, subjectValue]);

//   const kpStats = useMemo(() => {
//     const map = new Map();
//     for (const w of wrongsBySubject) {
//       const kp = w.knowledgePoint || "未归类";
//       map.set(kp, (map.get(kp) || 0) + 1);
//     }
//     return Array.from(map.entries())
//       .map(([kp, count]) => ({ kp, count }))
//       .sort((a, b) => b.count - a.count);
//   }, [wrongsBySubject]);

//   const activeKp = useMemo(() => {
//     if (tabParam) return tabParam;
//     if (!kpSearch) return "全部";
//     const exists = kpStats.some((x) => x.kp === kpSearch);
//     return exists ? kpSearch : "全部";
//   }, [tabParam, kpSearch, kpStats]);

//   const filteredKpStats = useMemo(() => {
//     const s = kpSearch.trim().toLowerCase();
//     if (!s) return kpStats;
//     return kpStats.filter((x) => x.kp.toLowerCase().includes(s));
//   }, [kpStats, kpSearch]);

//   const displayWrongs = useMemo(() => {
//     let list = wrongsBySubject;

//     if (activeKp !== "全部") {
//       list = list.filter((w) => (w.knowledgePoint || "未归类") === activeKp);
//     }

//     const s = kpSearch.trim().toLowerCase();
//     if (s) {
//       list = list.filter((w) =>
//         (w.knowledgePoint || "未归类").toLowerCase().includes(s),
//       );
//     }

//     return list;
//   }, [wrongsBySubject, activeKp, kpSearch]);

//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [drawerDefaultView, setDrawerDefaultView] = useState("practice");
//   const [currentWrong, setCurrentWrong] = useState(null);

//   const openPractice = (wrong) => {
//     setCurrentWrong(wrong);
//     setDrawerDefaultView("practice");
//     setDrawerOpen(true);
//   };

//   const openAnalysis = (wrong) => {
//     setCurrentWrong(wrong);
//     setDrawerDefaultView("analysis");
//     setDrawerOpen(true);
//   };

//   const hasFilter =
//     subjectValue !== "全部科目" ||
//     activeKp !== "全部" ||
//     kpSearch.trim().length > 0;

//   const clearAll = () => {
//     setSearchParams({});
//   };

//   return (
//     <div className="wb-page">
//       <PageHeader
//         title="我的错题本"
//         subtitle={`共${pendingCount}道错题待复习`}
//         icon={
//           <div className="wb-ph-icon">
//             <FileTextOutlined />
//           </div>
//         }
//       />

//       <div className="wb-wrap">
//         <div className="wb-stats">
//           <div className="wb-stat wrong-total">
//             <div className="wb-stat-label">总错题数</div>
//             <div className="wb-stat-value is-red">{totalWrongCount}</div>
//           </div>
//           <div className="wb-stat mastered-count">
//             <div className="wb-stat-label">已掌握</div>
//             <div className="wb-stat-value is-green">{masteredCount}</div>
//           </div>
//         </div>

//         <div className="wb-filter-card">
//           <div className="wb-filter-head">
//             <div className="wb-filter-title">
//               <FilterOutlined />
//               <span>筛选</span>
//             </div>

//             <div className="wb-filter-right">
//               <Select
//                 className="wb-subject-select"
//                 value={subjectValue}
//                 options={subjectOptions}
//                 size="middle"
//                 onChange={(v) => {
//                   setSearchParams(
//                     toParams(searchParams, { sub: v, tab: "", kp: "" }),
//                     { replace: true },
//                   );
//                 }}
//               />

//               <Input
//                 className="wb-kp-search"
//                 placeholder="搜索知识点"
//                 allowClear
//                 value={kpSearch}
//                 onChange={(e) => {
//                   setSearchParams(
//                     toParams(searchParams, { kp: e.target.value }),
//                     {
//                       replace: true,
//                     },
//                   );
//                 }}
//                 prefix={<SearchOutlined />}
//               />
//             </div>
//           </div>

//           <div className="wb-kp-tabs">
//             <button
//               type="button"
//               className={[
//                 "wb-kp-tab",
//                 activeKp === "全部" ? "is-active" : "",
//               ].join(" ")}
//               onClick={() =>
//                 setSearchParams(toParams(searchParams, { tab: "" }), {
//                   replace: true,
//                 })
//               }
//             >
//               全部（{wrongsBySubject.length}）
//             </button>

//             {filteredKpStats.map((x) => (
//               <button
//                 key={x.kp}
//                 type="button"
//                 className={[
//                   "wb-kp-tab",
//                   activeKp === x.kp ? "is-active" : "",
//                 ].join(" ")}
//                 onClick={() =>
//                   setSearchParams(toParams(searchParams, { tab: x.kp }), {
//                     replace: true,
//                   })
//                 }
//               >
//                 {x.kp}（{x.count}）
//               </button>
//             ))}
//           </div>

//           {hasFilter && (
//             <div className="wb-filter-bar">
//               <div className="wb-filter-bar-text">
//                 当前：{subjectValue}
//                 {activeKp !== "全部" ? ` - ${activeKp}` : ""}
//                 {kpSearch.trim() ? ` | 搜索“${kpSearch.trim()}”` : ""}
//               </div>
//               <button
//                 type="button"
//                 className="wb-filter-clear"
//                 onClick={clearAll}
//               >
//                 清除
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="wb-list">
//           {displayWrongs.map((w, idx) => (
//             <div key={w.id} className="wb-item">
//               <div className="wb-item-head">
//                 <div className="wb-item-left">
//                   <div className="wb-item-index">#{idx + 1}</div>
//                   <Tag className="wb-tag-wrong" color="red">
//                     错误{w.wrongCount}次
//                   </Tag>
//                   <span className="wb-item-title">{w.title}</span>
//                 </div>

//                 <div className="wb-item-right">
//                   {w.mastered ? (
//                     <Tag color="green" className="wb-tag-mastered">
//                       已掌握
//                     </Tag>
//                   ) : (
//                     <Tag color="orange" className="wb-tag-pending">
//                       待复习
//                     </Tag>
//                   )}
//                 </div>
//               </div>

//               <div className="wb-item-sub">
//                 <span className="wb-sub">{w.subject || "未设置"}</span>
//                 <span className="wb-dot">|</span>
//                 <span className="wb-sub">{w.chapterText}</span>
//                 <span className="wb-dot">|</span>
//                 <span className="wb-sub">{w.knowledgePoint || "未归类"}</span>
//                 <span className="wb-dot">|</span>
//                 <span className="wb-sub">最后练习：{w.lastPracticeAt}</span>
//               </div>

//               <div className="wb-item-actions">
//                 <button
//                   className="wb-btn primary"
//                   type="button"
//                   onClick={() => openPractice(w)}
//                 >
//                   重新练习
//                 </button>

//                 <button
//                   className="wb-btn ghost"
//                   type="button"
//                   onClick={() => openAnalysis(w)}
//                 >
//                   查看解析
//                 </button>
//               </div>
//             </div>
//           ))}

//           {displayWrongs.length === 0 && (
//             <div className="wb-empty">
//               当前筛选下暂无错题
//               {hasFilter && (
//                 <button
//                   type="button"
//                   className="wb-empty-clear"
//                   onClick={clearAll}
//                 >
//                   清除筛选
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <WrongQuestionSheetDrawer
//         open={drawerOpen}
//         onClose={() => setDrawerOpen(false)}
//         wrong={currentWrong}
//         defaultView={drawerDefaultView}
//         onMarkMastered={(wrongId) => {
//           setMasteredIds((prev) =>
//             prev.includes(wrongId) ? prev : [...prev, wrongId],
//           );
//         }}
//       />
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { Input, Tag, Select } from "antd";
import {
  FileTextOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import WrongQuestionSheetDrawer from "../../components/student/wrong-book/WrongQuestionSheetDrawer";
import { useAnswerRecordStore, useQuestionStore } from "../../store";
import "./wrong-book.css";

function toParams(prev, patch) {
  const next = new URLSearchParams(prev);
  Object.entries(patch).forEach(([k, v]) => {
    const val = (v ?? "").toString().trim();
    if (!val) next.delete(k);
    else next.set(k, val);
  });
  return next;
}

export default function WrongBook() {
  const wrongQuestions = useAnswerRecordStore((s) => s.wrongQuestions);
  const fetchWrongQuestions = useAnswerRecordStore(
    (s) => s.fetchWrongQuestions,
  );

  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

  useEffect(() => {
    fetchWrongQuestions();
    fetchQuestions();
  }, [fetchWrongQuestions, fetchQuestions]);

  const wrongs = useMemo(() => {
    const grouped = new Map();

    (wrongQuestions || []).forEach((r) => {
      const q = (questions || []).find(
        (item) => Number(item.id) === Number(r.questionId),
      );

      const questionId = r.questionId;
      const old = grouped.get(questionId);

      if (!old) {
        grouped.set(questionId, {
          id: `w_${questionId}`,
          questionId,
          subject: q?.subjectName || "未设置",
          wrongCount: 1,
          lastPracticeAt: (r.answeredAt || "").split(" ")[0],
          chapterText: q?.chapterName || "未分章",
          knowledgePoint: q?.knowledgePoints?.[0]?.name || "未归类",
          title: q?.title || r.title,
          difficulty: q?.difficulty || r.difficulty,
          tag: q?.knowledgePoints?.[0]?.name || "",
          question: q
            ? {
                id: q.id,
                difficulty: q.difficulty,
                tag: `${q.subjectName || ""} · ${q.chapterName || ""}`,
                stem: q.title,
                options: (q.options || []).map((item) => ({
                  key: item.key || item.option_key,
                  text: item.text || item.option_text,
                })),
                correct: q.correct,
                explanation: q.analysis,
              }
            : null,
          lastAttempt: {
            answer: r.selectedAnswer,
            answeredAt: r.answeredAt,
          },
          mastered: false,
        });
      } else {
        old.wrongCount += 1;
        old.lastPracticeAt = (r.answeredAt || "").split(" ")[0];
        old.lastAttempt = {
          answer: r.selectedAnswer,
          answeredAt: r.answeredAt,
        };
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(String(b.lastAttempt?.answeredAt || "").replace(" ", "T")) -
        new Date(String(a.lastAttempt?.answeredAt || "").replace(" ", "T")),
    );
  }, [wrongQuestions, questions]);

  const [masteredIds, setMasteredIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const enrichedWrongs = useMemo(() => {
    return wrongs.map((w) => ({
      ...w,
      mastered: masteredIds.includes(w.id),
    }));
  }, [wrongs, masteredIds]);

  const totalWrongCount = enrichedWrongs.length;
  const masteredCount = enrichedWrongs.filter((w) => w.mastered).length;
  const pendingCount = enrichedWrongs.filter((w) => !w.mastered).length;

  const subjectValue = searchParams.get("sub") || "全部科目";
  const kpSearch = searchParams.get("kp") || "";
  const tabParam = searchParams.get("tab") || "";

  const subjectOptions = useMemo(() => {
    const set = new Set();
    for (const w of enrichedWrongs) set.add(w.subject || "未设置");
    const list = Array.from(set)
      .sort()
      .map((s) => ({ value: s, label: s }));
    return [{ value: "全部科目", label: "全部科目" }, ...list];
  }, [enrichedWrongs]);

  const wrongsBySubject = useMemo(() => {
    if (subjectValue === "全部科目") return enrichedWrongs;
    return enrichedWrongs.filter(
      (w) => (w.subject || "未设置") === subjectValue,
    );
  }, [enrichedWrongs, subjectValue]);

  const kpStats = useMemo(() => {
    const map = new Map();
    for (const w of wrongsBySubject) {
      const kp = w.knowledgePoint || "未归类";
      map.set(kp, (map.get(kp) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([kp, count]) => ({ kp, count }))
      .sort((a, b) => b.count - a.count);
  }, [wrongsBySubject]);

  const activeKp = useMemo(() => {
    if (tabParam) return tabParam;
    if (!kpSearch) return "全部";
    const exists = kpStats.some((x) => x.kp === kpSearch);
    return exists ? kpSearch : "全部";
  }, [tabParam, kpSearch, kpStats]);

  const filteredKpStats = useMemo(() => {
    const s = kpSearch.trim().toLowerCase();
    if (!s) return kpStats;
    return kpStats.filter((x) => x.kp.toLowerCase().includes(s));
  }, [kpStats, kpSearch]);

  const displayWrongs = useMemo(() => {
    let list = wrongsBySubject;

    if (activeKp !== "全部") {
      list = list.filter((w) => (w.knowledgePoint || "未归类") === activeKp);
    }

    const s = kpSearch.trim().toLowerCase();
    if (s) {
      list = list.filter((w) =>
        (w.knowledgePoint || "未归类").toLowerCase().includes(s),
      );
    }

    return list;
  }, [wrongsBySubject, activeKp, kpSearch]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDefaultView, setDrawerDefaultView] = useState("practice");
  const [currentWrong, setCurrentWrong] = useState(null);

  const openPractice = (wrong) => {
    setCurrentWrong(wrong);
    setDrawerDefaultView("practice");
    setDrawerOpen(true);
  };

  const openAnalysis = (wrong) => {
    setCurrentWrong(wrong);
    setDrawerDefaultView("analysis");
    setDrawerOpen(true);
  };

  const hasFilter =
    subjectValue !== "全部科目" ||
    activeKp !== "全部" ||
    kpSearch.trim().length > 0;

  const clearAll = () => {
    setSearchParams({});
  };

  return (
    <div className="wb-page">
      <PageHeader
        title="我的错题本"
        subtitle={`共${pendingCount}道错题待复习`}
        icon={
          <div className="wb-ph-icon">
            <FileTextOutlined />
          </div>
        }
      />

      <div className="wb-wrap">
        <div className="wb-stats">
          <div className="wb-stat wrong-total">
            <div className="wb-stat-label">总错题数</div>
            <div className="wb-stat-value is-red">{totalWrongCount}</div>
          </div>
          <div className="wb-stat mastered-count">
            <div className="wb-stat-label">已掌握</div>
            <div className="wb-stat-value is-green">{masteredCount}</div>
          </div>
        </div>

        <div className="wb-filter-card">
          <div className="wb-filter-head">
            <div className="wb-filter-title">
              <FilterOutlined />
              <span>筛选</span>
            </div>

            <div className="wb-filter-right">
              <Select
                className="wb-subject-select"
                value={subjectValue}
                options={subjectOptions}
                size="middle"
                onChange={(v) => {
                  setSearchParams(
                    toParams(searchParams, { sub: v, tab: "", kp: "" }),
                    { replace: true },
                  );
                }}
              />

              <Input
                className="wb-kp-search"
                placeholder="搜索知识点"
                allowClear
                value={kpSearch}
                onChange={(e) => {
                  setSearchParams(
                    toParams(searchParams, { kp: e.target.value }),
                    { replace: true },
                  );
                }}
                prefix={<SearchOutlined />}
              />
            </div>
          </div>

          <div className="wb-kp-tabs">
            <button
              type="button"
              className={[
                "wb-kp-tab",
                activeKp === "全部" ? "is-active" : "",
              ].join(" ")}
              onClick={() =>
                setSearchParams(toParams(searchParams, { tab: "" }), {
                  replace: true,
                })
              }
            >
              全部（{wrongsBySubject.length}）
            </button>

            {filteredKpStats.map((x) => (
              <button
                key={x.kp}
                type="button"
                className={[
                  "wb-kp-tab",
                  activeKp === x.kp ? "is-active" : "",
                ].join(" ")}
                onClick={() =>
                  setSearchParams(toParams(searchParams, { tab: x.kp }), {
                    replace: true,
                  })
                }
              >
                {x.kp}（{x.count}）
              </button>
            ))}
          </div>

          {hasFilter && (
            <div className="wb-filter-bar">
              <div className="wb-filter-bar-text">
                当前：{subjectValue}
                {activeKp !== "全部" ? ` - ${activeKp}` : ""}
                {kpSearch.trim() ? ` | 搜索“${kpSearch.trim()}”` : ""}
              </div>
              <button
                type="button"
                className="wb-filter-clear"
                onClick={clearAll}
              >
                清除
              </button>
            </div>
          )}
        </div>

        <div className="wb-list">
          {displayWrongs.map((w, idx) => (
            <div key={w.id} className="wb-item">
              <div className="wb-item-head">
                <div className="wb-item-left">
                  <div className="wb-item-index">#{idx + 1}</div>
                  <Tag className="wb-tag-wrong" color="red">
                    错误{w.wrongCount}次
                  </Tag>
                  <span className="wb-item-title">{w.title}</span>
                </div>

                <div className="wb-item-right">
                  {w.mastered ? (
                    <Tag color="green" className="wb-tag-mastered">
                      已掌握
                    </Tag>
                  ) : (
                    <Tag color="orange" className="wb-tag-pending">
                      待复习
                    </Tag>
                  )}
                </div>
              </div>

              <div className="wb-item-sub">
                <span className="wb-sub">{w.subject || "未设置"}</span>
                <span className="wb-dot">|</span>
                <span className="wb-sub">{w.chapterText}</span>
                <span className="wb-dot">|</span>
                <span className="wb-sub">{w.knowledgePoint || "未归类"}</span>
                <span className="wb-dot">|</span>
                <span className="wb-sub">最后练习：{w.lastPracticeAt}</span>
              </div>

              <div className="wb-item-actions">
                <button
                  className="wb-btn primary"
                  type="button"
                  onClick={() => openPractice(w)}
                >
                  重新练习
                </button>

                <button
                  className="wb-btn ghost"
                  type="button"
                  onClick={() => openAnalysis(w)}
                >
                  查看解析
                </button>
              </div>
            </div>
          ))}

          {displayWrongs.length === 0 && (
            <div className="wb-empty">
              当前筛选下暂无错题
              {hasFilter && (
                <button
                  type="button"
                  className="wb-empty-clear"
                  onClick={clearAll}
                >
                  清除筛选
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <WrongQuestionSheetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wrong={currentWrong}
        defaultView={drawerDefaultView}
        onMarkMastered={(wrongId) => {
          setMasteredIds((prev) =>
            prev.includes(wrongId) ? prev : [...prev, wrongId],
          );
        }}
      />
    </div>
  );
}
