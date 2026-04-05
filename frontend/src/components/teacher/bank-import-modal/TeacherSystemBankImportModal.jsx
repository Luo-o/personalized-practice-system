// import React from "react";
// import { Modal, Tag, Button } from "antd";
// import { CheckCircleFilled } from "@ant-design/icons";
// import "./teacher-system-bank-import-modal.css";

// const BANKS = [
//   {
//     id: "Python基础题库",
//     subject: "Python",
//     desc: "涵盖Python基础语法、数据类型、控制流程、函数等核心知识点",
//     count: 280,
//     diff: "简单-中等",
//     chapters: "第1-5章",
//     imported: false,
//   },
//   {
//     id: "Python高级题库",
//     subject: "Python",
//     desc: "包含面向对象、异常处理、文件操作、模块等高级特性",
//     count: 180,
//     diff: "中等-困难",
//     chapters: "第6-10章",
//     imported: true,
//   },
//   {
//     id: "数据库原理题库",
//     subject: "数据库",
//     desc: "数据库设计、SQL语句、事务处理、索引优化等全面内容",
//     count: 320,
//     diff: "简单-困难",
//     chapters: "第1-8章",
//     imported: true,
//   },
// ];

// export default function TeacherSystemBankImportModal({
//   open,
//   onClose,
//   onImport,
// }) {
//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       footer={null}
//       width={980}
//       centered
//       title="系统题库导入"
//       className="td-modal"
//     >
//       <div className="td-bank-grid">
//         {BANKS.map((b) => (
//           <div
//             key={b.id}
//             className={`td-bank-card ${b.imported ? "is-imported" : ""}`}
//           >
//             <div className="td-bank-head">
//               <div className="td-bank-name">{b.id}</div>
//               <Tag className="td-tag-subject">{b.subject}</Tag>
//               {b.imported ? <CheckCircleFilled className="td-bank-ok" /> : null}
//             </div>

//             <div className="td-bank-desc">{b.desc}</div>

//             <div className="td-bank-meta">
//               <div>📚 {b.count} 道题目</div>
//               <div>🎯 {b.diff}</div>
//               <div>📖 {b.chapters}</div>
//             </div>

//             <div className="td-bank-actions">
//               {b.imported ? (
//                 <Button disabled block className="td-muted-btn">
//                   已导入
//                 </Button>
//               ) : (
//                 <Button
//                   type="primary"
//                   block
//                   className="td-primary"
//                   onClick={() => onImport?.(b.id)}
//                 >
//                   导入题库
//                 </Button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </Modal>
//   );
// }

import React, { useEffect, useMemo } from "react";
import { Modal, Tag, Button, Empty } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useQuestionStore, useSubjectStore } from "../../../store";
import "./teacher-system-bank-import-modal.css";

export default function TeacherSystemBankImportModal({ open, onClose }) {
  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);

  const subjects = useSubjectStore((s) => s.subjects);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);

  useEffect(() => {
    if (!open) return;

    if (!questions.length) {
      fetchQuestions().catch((error) => {
        console.error("获取题目失败：", error);
      });
    }

    if (!subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
      });
    }
  }, [open, questions.length, subjects.length, fetchQuestions, fetchSubjects]);

  const banks = useMemo(() => {
    return subjects.map((subject) => {
      const subjectQuestions = questions.filter(
        (q) =>
          q.ownerType === "system" &&
          Number(q.subjectId) === Number(subject.id),
      );

      const chapterCount = new Set(
        subjectQuestions.map((q) => q.chapterName).filter(Boolean),
      ).size;

      const diffs = [
        ...new Set(subjectQuestions.map((q) => q.difficulty).filter(Boolean)),
      ];

      return {
        id: subject.id,
        name: `${subject.name}系统题库`,
        subject: subject.name,
        count: subjectQuestions.length,
        diff: diffs.length ? diffs.join(" / ") : "暂无",
        chapters: chapterCount ? `${chapterCount}个章节` : "暂无章节",
        imported: subjectQuestions.length > 0,
      };
    });
  }, [subjects, questions]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={980}
      centered
      title="系统题库导入"
      className="td-modal"
    >
      {!banks.length ? (
        <Empty description="暂无系统题库信息" />
      ) : (
        <div className="td-bank-grid">
          {banks.map((b) => (
            <div
              key={b.id}
              className={`td-bank-card ${b.imported ? "is-imported" : ""}`}
            >
              <div className="td-bank-head">
                <div className="td-bank-name">{b.name}</div>
                <Tag className="td-tag-subject">{b.subject}</Tag>
                {b.imported ? (
                  <CheckCircleFilled className="td-bank-ok" />
                ) : null}
              </div>

              <div className="td-bank-desc">
                当前页面已接入真实系统题目统计；但“导入题库到教师私有题库”这一步仍需要后端专门接口。
              </div>

              <div className="td-bank-meta">
                <div>📚 {b.count} 道系统题</div>
                <div>🎯 {b.diff}</div>
                <div>📖 {b.chapters}</div>
              </div>

              <div className="td-bank-actions">
                <Button disabled block className="td-muted-btn">
                  当前后端未提供导入接口
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
