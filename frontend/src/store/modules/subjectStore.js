// import { create } from "zustand";

// const initialSubjects = [
//   {
//     id: 1,
//     subject: "计算机网络",
//     chapters: [
//       {
//         id: "1-1",
//         name: "第1章 计算机网络体系结构",
//         knowledgePoints: [
//           "计算机网络的概念",
//           "计算机网络的组成",
//           "计算机网络的功能",
//           "电路交换、报文交换与分组交换",
//           "计算机网络的分类",
//           "计算机网络的性能指标",
//           "计算机网络分层结构",
//           "计算机网络协议、接口、服务的概念",
//           "ISO/OSI参考模型和TCP/IP模型",
//         ],
//       },
//       {
//         id: "1-2",
//         name: "第2章 物理层",
//         knowledgePoints: [
//           "基本概念",
//           "信道的极限容量",
//           "编码与调制",
//           "双绞线、同轴电缆、光纤与无线传输介质",
//           "物理层接口的特性",
//           "中继器",
//           "集线器",
//         ],
//       },
//       {
//         id: "1-3",
//         name: "第3章 数据链路层",
//         knowledgePoints: [
//           "数据链路层所处的地位",
//           "为网络层提供服务",
//           "链路管理",
//           "封装成帧与透明传输",
//           "流量控制",
//           "差错检测",
//           "字符计数法",
//           "字符填充法",
//           "零比特填充法",
//           "违规编码法",
//           "检错编码",
//           "纠错编码",
//           "流量控制与滑动窗口机制",
//           "可靠传输机制",
//           "信道划分介质访问控制",
//           "随机访问介质访问控制",
//           "轮询访问：令牌传递协议",
//           "局域网的基本概念和体系结构",
//           "以太网与IEEE 802.3",
//           "IEEE 802.11无线局域网",
//           "VLAN基本概念与基本原理",
//           "广域网的基本概念",
//           "PPP协议",
//           "网桥的基本概念",
//           "以太网交换机",
//         ],
//       },
//       {
//         id: "1-4",
//         name: "第4章 网络层",
//         knowledgePoints: [
//           "异构网络互连",
//           "路由与转发",
//           "网络层提供的两种服务",
//           "SDN的基本概念",
//           "IPv4分组",
//           "IPv4地址与NAT",
//           "划分子网与路由聚合",
//           "网络层转发分组的过程",
//           "地址解析协议（ARP）",
//           "动态主机配置协议（DHCP）",
//           "网际控制报文协议（ICMP）",
//           "IPv6的特点",
//           "IPv6数据报的基本首部",
//           "IPv6地址",
//           "从IPv4向IPv6过渡",
//           "路由算法",
//           "分层次的路由选择协议",
//           "路由信息协议（RIP）",
//           "开放最短路径优先（OSPF）协议",
//           "边界网关协议（BGP）",
//           "多播的概念",
//           "IP多播地址",
//           "在局域网进行硬件多播",
//           "IGMP与多播路由协议",
//           "移动IP的概念",
//           "移动IP通信过程",
//           "冲突域和广播域",
//           "路由器的组成和功能",
//           "路由表与分组转发",
//         ],
//       },
//       {
//         id: "1-5",
//         name: "第5章 传输层",
//         knowledgePoints: [
//           "传输层的功能",
//           "传输层的寻址与端口",
//           "无连接服务与面向连接服务",
//           "UDP数据报",
//           "UDP检验",
//           "TCP协议的特点",
//           "TCP报文段",
//           "TCP连接管理",
//           "TCP可靠传输",
//           "TCP流量控制",
//           "TCP拥塞控制",
//         ],
//       },
//       {
//         id: "1-6",
//         name: "第6章 应用层",
//         knowledgePoints: [
//           "客户/服务器模型",
//           "P2P模型",
//           "层次域名空间",
//           "域名服务器",
//           "域名解析过程",
//           "FTP的工作原理",
//           "控制连接与数据连接",
//           "电子邮件系统的组成结构",
//           "电子邮件格式与MIME",
//           "SMTP和POP3",
//           "WWW的概念与组成结构",
//           "超文本传输协议（HTTP）",
//         ],
//       },
//     ],
//   },

//   {
//     id: 2,
//     subject: "Python",
//     chapters: [
//       "第1章 变量与数据类型",
//       "第2章 容器",
//       "第3章 函数",
//       "第4章 模块",
//       "第5章 面向对象",
//     ],
//   },

//   {
//     id: 3,
//     subject: "数据结构",
//     chapters: ["第1章 线性表", "第2章 栈和队列", "第3章 树", "第4章 图"],
//   },

//   {
//     id: 4,
//     subject: "数据库",
//     chapters: [
//       "第1章 SQL基础",
//       "第2章 查询",
//       "第3章 事务",
//       "第4章 索引",
//       "第5章 数据库设计",
//     ],
//   },

//   {
//     id: 5,
//     subject: "Java",
//     chapters: [
//       "第1章 基础语法",
//       "第2章 面向对象",
//       "第3章 集合框架",
//       "第4章 多线程",
//     ],
//   },
// ];

// export const useSubjectStore = create((set, get) => ({
//   subjects: initialSubjects,

//   addSubject: (subject) =>
//     set((state) => ({
//       subjects: [...state.subjects, { subject, chapters: [] }],
//     })),

//   addChapter: (subject, chapter) =>
//     set((state) => ({
//       subjects: state.subjects.map((s) =>
//         s.subject === subject
//           ? { ...s, chapters: [...s.chapters, chapter] }
//           : s,
//       ),
//     })),

//   removeChapter: (subject, chapter) =>
//     set((state) => ({
//       subjects: state.subjects.map((s) =>
//         s.subject === subject
//           ? { ...s, chapters: s.chapters.filter((c) => c !== chapter) }
//           : s,
//       ),
//     })),

//   getSubjectByName: (subject) =>
//     get().subjects.find((s) => s.subject === subject) || null,

//   getChaptersBySubject: (subject) => {
//     const s = get().subjects.find((x) => x.subject === subject);
//     return s ? s.chapters : [];
//   },

//   getNormalizedSubjects: () =>
//     get().subjects.map((s, subjectIndex) => ({
//       id: subjectIndex + 1,
//       name: s.subject,
//       subject: s.subject,
//       chapters: s.chapters.map((chapter, chapterIndex) => ({
//         id: Number(`${subjectIndex + 1}${chapterIndex + 1}`),
//         name: chapter,
//         knowledgePoints: [],
//       })),
//     })),
// }));

import { create } from "zustand";
import { http } from "../../api/http";
import { normalizeSubject, normalizeChapter } from "../../api/normalizer";

function groupKnowledgePointsByChapter(knowledgePoints = []) {
  const map = new Map();

  for (const kp of knowledgePoints) {
    const chapterId = kp.chapter_id;
    const chapterName = kp.chapter_name;

    if (!map.has(chapterId)) {
      map.set(chapterId, {
        id: chapterId,
        name: chapterName,
        knowledgePoints: [],
      });
    }

    map.get(chapterId).knowledgePoints.push({
      id: kp.id,
      name: kp.name,
      sortOrder: kp.sort_order,
    });
  }

  return Array.from(map.values());
}

export const useSubjectStore = create((set, get) => ({
  subjects: [],
  chapters: [],
  knowledgePoints: [],
  chapterTree: [],
  loading: false,

  // 获取全部科目
  fetchSubjects: async () => {
    set({ loading: true });

    try {
      const res = await http.get("/subjects");
      const subjects = (res || []).map(normalizeSubject);

      set({
        subjects,
        loading: false,
      });

      return subjects;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取某科目章节
  fetchChaptersBySubjectId: async (subjectId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/subjects/${subjectId}/chapters`);
      const chapters = (res?.chapters || []).map(normalizeChapter);

      set({
        chapters,
        loading: false,
      });

      return chapters;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 获取某科目知识点
  fetchKnowledgePointsBySubjectId: async (subjectId) => {
    set({ loading: true });

    try {
      const res = await http.get(`/subjects/${subjectId}/knowledge-points`);
      const knowledgePoints = res?.knowledgePoints || [];
      const chapterTree = groupKnowledgePointsByChapter(knowledgePoints);

      set({
        knowledgePoints,
        chapterTree,
        loading: false,
      });

      return knowledgePoints;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 一次性拉取某科目的章节 + 知识点
  fetchSubjectDetail: async (subjectId) => {
    set({ loading: true });

    try {
      const [chapterRes, kpRes] = await Promise.all([
        http.get(`/subjects/${subjectId}/chapters`),
        http.get(`/subjects/${subjectId}/knowledge-points`),
      ]);

      const chapters = (chapterRes?.chapters || []).map(normalizeChapter);
      const knowledgePoints = kpRes?.knowledgePoints || [];
      const chapterTree = groupKnowledgePointsByChapter(knowledgePoints);

      set({
        chapters,
        knowledgePoints,
        chapterTree,
        loading: false,
      });

      return {
        chapters,
        knowledgePoints,
        chapterTree,
      };
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // 根据 id 获取科目
  getSubjectById: (id) =>
    get().subjects.find((s) => Number(s.id) === Number(id)) || null,

  // 根据 id 获取章节
  getChapterById: (id) =>
    get().chapters.find((c) => String(c.id) === String(id)) || null,

  // 根据 subjectId 取章节
  getChaptersBySubjectId: (subjectId) =>
    get().chapters.filter((c) => Number(c.subjectId) === Number(subjectId)),

  // 根据 chapterId 取知识点
  getKnowledgePointsByChapterId: (chapterId) =>
    get().knowledgePoints.filter(
      (kp) => String(kp.chapter_id) === String(chapterId),
    ),

  // 获取某科目的树结构
  getChapterTree: () => get().chapterTree,

  clearSubjectDetail: () =>
    set({
      chapters: [],
      knowledgePoints: [],
      chapterTree: [],
    }),
}));
