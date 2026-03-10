// import { create } from "zustand";

// const initialQuestions = [
//   {
//     id: 101,
//     ownerType: "teacher",
//     teacherId: 123,
//     title: "TCP协议属于OSI模型的哪一层？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第5章 传输层",
//     kps: ["TCP协议的特点", "传输层的功能"],
//     source: "自建",
//     isReal: false,
//     options: [
//       { key: "A", text: "应用层" },
//       { key: "B", text: "传输层" },
//       { key: "C", text: "网络层" },
//       { key: "D", text: "数据链路层" },
//     ],
//     correct: "B",
//     analysis: "TCP属于传输层协议，提供面向连接、可靠传输服务。",
//     images: [],
//   },

//   {
//     id: 102,
//     ownerType: "system",
//     teacherId: null,
//     title: "IP协议的主要功能是？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第4章 网络层",
//     kps: ["路由与转发", "IPv4分组"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "提供可靠数据传输" },
//       { key: "B", text: "进行路由选择和数据包转发" },
//       { key: "C", text: "实现应用程序之间通信" },
//       { key: "D", text: "管理物理链路连接" },
//     ],
//     correct: "B",
//     analysis: "IP协议位于网络层，负责寻址、路由和分组转发，但不保证可靠传输。",
//     images: [],
//   },

//   {
//     id: 103,
//     ownerType: "system",
//     teacherId: null,
//     title: "HTTP协议工作在哪一层？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第6章 应用层",
//     kps: ["超文本传输协议（HTTP）", "WWW的概念与组成结构"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "应用层" },
//       { key: "B", text: "传输层" },
//       { key: "C", text: "网络层" },
//       { key: "D", text: "数据链路层" },
//     ],
//     correct: "A",
//     analysis: "HTTP属于应用层协议，常运行在TCP之上，为Web通信提供支持。",
//     images: [],
//   },

//   {
//     id: 104,
//     ownerType: "system",
//     teacherId: null,
//     title: "IPv4地址长度为多少位？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第4章 网络层",
//     kps: ["IPv4地址与NAT"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "16位" },
//       { key: "B", text: "32位" },
//       { key: "C", text: "64位" },
//       { key: "D", text: "128位" },
//     ],
//     correct: "B",
//     analysis: "IPv4地址由32位二进制组成，通常写成4段十进制数。",
//     images: [],
//   },

//   {
//     id: 105,
//     ownerType: "system",
//     teacherId: null,
//     title: "OSI模型包含哪几层？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第1章 计算机网络体系结构",
//     kps: ["ISO/OSI参考模型和TCP/IP模型", "计算机网络分层结构"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "5层" },
//       { key: "B", text: "6层" },
//       { key: "C", text: "7层" },
//       { key: "D", text: "8层" },
//     ],
//     correct: "C",
//     analysis:
//       "OSI参考模型共7层：物理层、数据链路层、网络层、传输层、会话层、表示层、应用层。",
//     images: [],
//   },

//   {
//     id: 106,
//     ownerType: "system",
//     teacherId: null,
//     title: "下列哪项属于计算机网络的性能指标？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第1章 计算机网络体系结构",
//     kps: ["计算机网络的性能指标"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "吞吐量" },
//       { key: "B", text: "编译速度" },
//       { key: "C", text: "指令条数" },
//       { key: "D", text: "缓存命中率" },
//     ],
//     correct: "A",
//     analysis:
//       "吞吐量、时延、时延带宽积、往返时间、利用率等都属于网络性能指标。",
//     images: [],
//   },

//   {
//     id: 107,
//     ownerType: "system",
//     teacherId: null,
//     title: "NAT技术的主要作用是？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第4章 网络层",
//     kps: ["IPv4地址与NAT"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "提升传输层可靠性" },
//       { key: "B", text: "实现网络地址转换" },
//       { key: "C", text: "进行差错检测" },
//       { key: "D", text: "提供拥塞控制" },
//     ],
//     correct: "B",
//     analysis: "NAT通过将私有地址转换为公网地址，缓解IPv4地址不足问题。",
//     images: [],
//   },

//   {
//     id: 108,
//     ownerType: "system",
//     teacherId: null,
//     title: "ARP协议用于实现什么功能？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第4章 网络层",
//     kps: ["地址解析协议（ARP）"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "IP地址到MAC地址的映射" },
//       { key: "B", text: "域名到IP地址的映射" },
//       { key: "C", text: "检测网络拥塞" },
//       { key: "D", text: "加密传输数据" },
//     ],
//     correct: "A",
//     analysis: "ARP用于根据已知IP地址查询对应的MAC地址。",
//     images: [],
//   },

//   {
//     id: 109,
//     ownerType: "system",
//     teacherId: null,
//     title: "TCP三次握手的主要目的是什么？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第5章 传输层",
//     kps: ["TCP连接管理"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "释放连接" },
//       { key: "B", text: "建立可靠连接并同步序号" },
//       { key: "C", text: "进行路由发现" },
//       { key: "D", text: "减少分组长度" },
//     ],
//     correct: "B",
//     analysis:
//       "三次握手的核心作用是确认双方收发能力正常，并同步初始序号，建立连接。",
//     images: [],
//   },

//   {
//     id: 110,
//     ownerType: "system",
//     teacherId: null,
//     title: "UDP与TCP相比，最大的特点是？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第5章 传输层",
//     kps: ["UDP数据报", "无连接服务与面向连接服务"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "面向连接" },
//       { key: "B", text: "可靠传输" },
//       { key: "C", text: "无连接、开销小" },
//       { key: "D", text: "必须按序到达" },
//     ],
//     correct: "C",
//     analysis: "UDP是无连接协议，不保证可靠性，但首部开销小、传输效率高。",
//     images: [],
//   },

//   {
//     id: 111,
//     ownerType: "system",
//     teacherId: null,
//     title: "DNS的核心作用是？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第6章 应用层",
//     kps: ["域名解析过程", "域名服务器"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "进行差错控制" },
//       { key: "B", text: "完成域名到IP地址的解析" },
//       { key: "C", text: "实现文件传输" },
//       { key: "D", text: "建立TCP连接" },
//     ],
//     correct: "B",
//     analysis: "DNS是域名系统，负责将便于记忆的域名解析成IP地址。",
//     images: [],
//   },

//   {
//     id: 112,
//     ownerType: "system",
//     teacherId: null,
//     title: "FTP中用于传输文件内容的连接属于？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第6章 应用层",
//     kps: ["控制连接与数据连接", "FTP的工作原理"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "控制连接" },
//       { key: "B", text: "数据连接" },
//       { key: "C", text: "逻辑连接" },
//       { key: "D", text: "广播连接" },
//     ],
//     correct: "B",
//     analysis: "FTP使用控制连接传输命令，使用数据连接传输文件内容。",
//     images: [],
//   },

//   {
//     id: 113,
//     ownerType: "system",
//     teacherId: null,
//     title: "RIP协议选择路由时主要依据什么？",
//     subject: "计算机网络",
//     difficulty: "困难",
//     chapter: "第4章 网络层",
//     kps: ["路由信息协议（RIP）", "路由算法"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "链路带宽" },
//       { key: "B", text: "时延" },
//       { key: "C", text: "跳数" },
//       { key: "D", text: "拥塞窗口" },
//     ],
//     correct: "C",
//     analysis: "RIP属于距离向量路由协议，以跳数作为度量值，跳数越少越优。",
//     images: [],
//   },

//   {
//     id: 114,
//     ownerType: "system",
//     teacherId: null,
//     title: "TCP拥塞控制不包括下列哪一项？",
//     subject: "计算机网络",
//     difficulty: "困难",
//     chapter: "第5章 传输层",
//     kps: ["TCP拥塞控制"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "慢开始" },
//       { key: "B", text: "拥塞避免" },
//       { key: "C", text: "快重传" },
//       { key: "D", text: "名称解析" },
//     ],
//     correct: "D",
//     analysis:
//       "TCP拥塞控制常见机制包括慢开始、拥塞避免、快重传、快恢复；名称解析属于DNS功能。",
//     images: [],
//   },

//   {
//     id: 115,
//     ownerType: "system",
//     teacherId: null,
//     title: "下列哪项最能体现分组交换的优点？",
//     subject: "计算机网络",
//     difficulty: "中等",
//     chapter: "第1章 计算机网络体系结构",
//     kps: ["电路交换、报文交换与分组交换"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "独占整条链路" },
//       { key: "B", text: "线路利用率高" },
//       { key: "C", text: "固定带宽不变" },
//       { key: "D", text: "不需要存储转发" },
//     ],
//     correct: "B",
//     analysis:
//       "分组交换采用存储转发机制，链路可被多用户共享，因此线路利用率较高。",
//     images: [],
//   },

//   {
//     id: 116,
//     ownerType: "system",
//     teacherId: null,
//     title: "以下哪项属于电子邮件系统常用协议？",
//     subject: "计算机网络",
//     difficulty: "简单",
//     chapter: "第6章 应用层",
//     kps: ["SMTP和POP3", "电子邮件系统的组成结构"],
//     source: "系统题库",
//     isReal: false,
//     options: [
//       { key: "A", text: "SMTP" },
//       { key: "B", text: "ARP" },
//       { key: "C", text: "ICMP" },
//       { key: "D", text: "RIP" },
//     ],
//     correct: "A",
//     analysis: "SMTP用于发送邮件，POP3常用于接收邮件。",
//     images: [],
//   },
// ];

// export const useQuestionStore = create((set) => ({
//   questions: initialQuestions,

//   addQuestion: (q) =>
//     set((state) => ({
//       questions: [...state.questions, q],
//     })),

//   deleteQuestion: (id) =>
//     set((state) => ({
//       questions: state.questions.filter((q) => q.id !== id),
//     })),

//   updateQuestion: (id, data) =>
//     set((state) => ({
//       questions: state.questions.map((q) =>
//         q.id === id ? { ...q, ...data } : q,
//       ),
//     })),
// }));

import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeQuestion } from "../../api/normalizer";
import { useTeacherStore } from "./teacherStore";

export const useQuestionStore = create((set, get) => ({
  questions: [],
  currentQuestion: null,
  loading: false,

  // 获取全部题目
  fetchQuestions: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/questions");
      const questions = (res || []).map(normalizeQuestion);

      set({
        questions,
        loading: false,
      });

      return questions;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取题目详情
  fetchQuestionById: async (id) => {
    set({ loading: true });

    try {
      const res = await http.get(`/questions/${id}`);
      const currentQuestion = normalizeQuestion(res);

      set({
        currentQuestion,
        loading: false,
      });

      return currentQuestion;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 新增题目
  addQuestion: async (questionData) => {
    set({ loading: true });

    try {
      const teacherId =
        questionData.teacherId ??
        useTeacherStore.getState().getCurrentTeacherId() ??
        null;

      const payload = {
        id: questionData.id,
        owner_type: questionData.ownerType || "teacher",
        teacher_id: teacherId,
        title: questionData.title,
        subject_id: questionData.subjectId,
        chapter_id: questionData.chapterId ?? null,
        difficulty: questionData.difficulty,
        source: questionData.source ?? "教师录入",
        is_real: questionData.isReal ? 1 : 0,
        analysis: questionData.analysis ?? "",
        correct_answer: questionData.correct,

        options: (questionData.options || []).map((item, index) => ({
          option_key: item.key,
          option_text: item.text,
          sort_order: item.sortOrder ?? index + 1,
        })),

        knowledgePointIds:
          questionData.knowledgePointIds ||
          (questionData.knowledgePoints || []).map((kp) =>
            typeof kp === "object" ? kp.id : kp,
          ),

        images: (questionData.images || []).map((img, index) => ({
          image_url: img.imageUrl || img.url || img,
          sort_order: img.sortOrder ?? index + 1,
        })),
      };

      const res = await http.post("/questions", payload);
      const created = normalizeQuestion(res);

      set((state) => ({
        questions: [...state.questions, created],
        loading: false,
      }));

      return created;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 更新题目
  updateQuestion: async (id, questionData) => {
    set({ loading: true });

    try {
      const teacherId =
        questionData.teacherId ??
        useTeacherStore.getState().getCurrentTeacherId() ??
        null;

      const payload = {
        owner_type: questionData.ownerType || "teacher",
        teacher_id: teacherId,
        title: questionData.title,
        subject_id: questionData.subjectId,
        chapter_id: questionData.chapterId ?? null,
        difficulty: questionData.difficulty,
        source: questionData.source ?? "教师录入",
        is_real: questionData.isReal ? 1 : 0,
        analysis: questionData.analysis ?? "",
        correct_answer: questionData.correct,

        options: (questionData.options || []).map((item, index) => ({
          option_key: item.key,
          option_text: item.text,
          sort_order: item.sortOrder ?? index + 1,
        })),

        knowledgePointIds:
          questionData.knowledgePointIds ||
          (questionData.knowledgePoints || []).map((kp) =>
            typeof kp === "object" ? kp.id : kp,
          ),

        images: (questionData.images || []).map((img, index) => ({
          image_url: img.imageUrl || img.url || img,
          sort_order: img.sortOrder ?? index + 1,
        })),
      };

      const res = await http.patch(`/questions/${id}`, payload);
      const updated = normalizeQuestion(res);

      set((state) => ({
        questions: state.questions.map((q) =>
          Number(q.id) === Number(id) ? updated : q,
        ),
        currentQuestion:
          state.currentQuestion &&
          Number(state.currentQuestion.id) === Number(id)
            ? updated
            : state.currentQuestion,
        loading: false,
      }));

      return updated;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 删除题目
  deleteQuestion: async (id) => {
    set({ loading: true });

    try {
      await http.delete(`/questions/${id}`);

      set((state) => ({
        questions: state.questions.filter((q) => Number(q.id) !== Number(id)),
        currentQuestion:
          state.currentQuestion &&
          Number(state.currentQuestion.id) === Number(id)
            ? null
            : state.currentQuestion,
        loading: false,
      }));

      return true;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 当前教师题目
  fetchTeacherQuestions: async () => {
    const teacherId = useTeacherStore.getState().getCurrentTeacherId();
    if (!teacherId) {
      set({ questions: [] });
      return [];
    }

    set({ loading: true });

    try {
      const res = await http.get("/questions");
      const allQuestions = (res || []).map(normalizeQuestion);

      const questions = allQuestions.filter(
        (q) =>
          q.ownerType === "system" || Number(q.teacherId) === Number(teacherId),
      );

      set({
        questions,
        loading: false,
      });

      return questions;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 兼容旧页面的方法
  getQuestionById: (id) =>
    get().questions.find((q) => Number(q.id) === Number(id)) || null,

  getQuestionsBySubjectId: (subjectId) =>
    get().questions.filter((q) => Number(q.subjectId) === Number(subjectId)),

  getQuestionsByChapterId: (chapterId) =>
    get().questions.filter((q) => String(q.chapterId) === String(chapterId)),

  getQuestionsByTeacherId: (teacherId) =>
    get().questions.filter((q) => Number(q.teacherId) === Number(teacherId)),

  clearCurrentQuestion: () =>
    set({
      currentQuestion: null,
    }),
}));
