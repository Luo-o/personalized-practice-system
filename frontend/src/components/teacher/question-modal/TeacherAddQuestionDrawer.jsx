import React, { useMemo, useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Radio,
  Space,
  Tag,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import "./teacher-add-question-drawer.css";

import { useSubjectStore } from "../../../store/modules/subjectStore";

const DIFFS = ["简单", "中等", "困难"];

const KP_POOL_BY_SUBJECT = {
  Python: ["Python基础", "变量", "数据结构", "函数", "异常处理"],
  数据库: ["数据库设计", "SQL", "事务", "索引", "范式"],
  数据结构: ["数组", "链表", "栈", "队列", "树", "图"],
  Java: ["基础语法", "面向对象", "集合", "并发"],
  计算机网络: ["TCP", "UDP", "IP", "HTTP", "路由"],
};

function emptyOptions() {
  return [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ];
}

export default function TeacherAddQuestionDrawer({
  open,
  onClose,
  onSubmit,
  editingQuestion,
}) {
  const [form] = Form.useForm();

  const subjects = useSubjectStore((state) => state.subjects);

  const defaultSubject = subjects[0]?.subject || "";
  const defaultChapters =
    subjects.find((item) => item.subject === defaultSubject)?.chapters || [];
  const defaultChapter = defaultChapters[0] || "";

  const [subject, setSubject] = useState(defaultSubject);
  const [kpSelected, setKpSelected] = useState([]);
  const [kpInput, setKpInput] = useState("");
  const [options, setOptions] = useState(emptyOptions());
  const [correct, setCorrect] = useState("A");
  const [fileList, setFileList] = useState([]);

  const subjectOptions = useMemo(() => {
    return subjects.map((item) => ({
      label: item.subject,
      value: item.subject,
    }));
  }, [subjects]);

  const chapters = useMemo(() => {
    return subjects.find((item) => item.subject === subject)?.chapters || [];
  }, [subjects, subject]);

  const kpPool = useMemo(() => {
    return KP_POOL_BY_SUBJECT[subject] || [];
  }, [subject]);

  const addKpFromInput = () => {
    const v = kpInput.trim();
    if (!v || kpSelected.includes(v)) return;
    setKpSelected((prev) => [...prev, v]);
    setKpInput("");
  };

  const removeKp = (v) => {
    setKpSelected((prev) => prev.filter((x) => x !== v));
  };

  const setOptionText = (key, text) => {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));
  };

  const handleOk = async () => {
    const values = await form.validateFields();

    const filled = options.every((o) => o.text.trim());
    if (!filled) {
      message.warning("请补全 A-D 选项内容");
      return;
    }

    const payload = {
      title: values.stem,
      subject: values.subject,
      difficulty: values.difficulty,
      chapter: values.chapter,
      kps: kpSelected,
      source: values.source,
      images: fileList.map((f) => f.originFileObj || f),
      options,
      correct,
      analysis: values.analysis || "",
    };

    await onSubmit?.(payload);
  };

  useEffect(() => {
    if (!open) return;

    if (editingQuestion) {
      form.setFieldsValue({
        subject: editingQuestion.subject,
        difficulty: editingQuestion.difficulty,
        stem: editingQuestion.title,
        source: editingQuestion.source,
        chapter: editingQuestion.chapter,
        analysis: editingQuestion.analysis,
      });

      setSubject(editingQuestion.subject || defaultSubject);
      setKpSelected(editingQuestion.kps || []);
      setKpInput("");
      setCorrect(editingQuestion.correct || "A");
      setOptions(editingQuestion.options || emptyOptions());
      setFileList(editingQuestion.images || []);
    } else {
      setSubject(defaultSubject);
      setKpSelected([]);
      setKpInput("");
      setCorrect("A");
      setOptions(emptyOptions());
      setFileList([]);

      form.setFieldsValue({
        subject: defaultSubject,
        difficulty: "简单",
        stem: "",
        source: "",
        chapter: defaultChapter,
        analysis: "",
      });
    }
  }, [open, editingQuestion, form, defaultSubject, defaultChapter]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      size="large"
      title={editingQuestion ? "编辑题目" : "添加新题目"}
      className="td-drawer"
      styles={{ body: { padding: 18 } }}
      extra={
        <Button onClick={onClose} type="text">
          关闭
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          subject: defaultSubject,
          difficulty: "简单",
          chapter: defaultChapter,
        }}
      >
        <div className="td-form-row">
          <Form.Item label="科目" name="subject" className="td-form-col">
            <Select
              options={subjectOptions}
              placeholder="请选择科目"
              onChange={(v) => {
                setSubject(v);
                setKpSelected([]);

                const nextChapters =
                  subjects.find((item) => item.subject === v)?.chapters || [];

                form.setFieldValue("chapter", nextChapters[0] || "");
              }}
            />
          </Form.Item>

          <Form.Item label="难度" name="difficulty" className="td-form-col">
            <Select
              options={DIFFS.map((d) => ({ label: d, value: d }))}
              placeholder="请选择难度"
            />
          </Form.Item>
        </div>

        <Form.Item
          label="题干内容"
          name="stem"
          rules={[{ required: true, message: "请输入题干内容" }]}
        >
          <Input.TextArea
            placeholder="请输入题目内容"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          label="来源"
          name="source"
          rules={[{ required: true, message: "请输入题目来源" }]}
        >
          <Input placeholder="请输入题目来源，例如：期末试卷 / 课堂练习 / 历年真题" />
        </Form.Item>

        <Form.Item label="题目解析" name="analysis">
          <Input.TextArea
            placeholder="请输入题目解析"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item label="题目图片（可选，多张）">
          <Upload
            multiple
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: fl }) => setFileList(fl)}
          >
            <div className="td-upload-btn">
              <UploadOutlined />
              <div>上传</div>
            </div>
          </Upload>
        </Form.Item>

        <div className="td-section-title">选项设置（选择题）</div>

        <div className="td-options">
          {options.map((o) => (
            <div key={o.key} className="td-option-row">
              <div className="td-option-key">{o.key}</div>
              <Input
                placeholder={`请输入选项 ${o.key} 的内容`}
                value={o.text}
                onChange={(e) => setOptionText(o.key, e.target.value)}
              />
              <Radio
                checked={correct === o.key}
                onChange={() => setCorrect(o.key)}
              >
                正确
              </Radio>
            </div>
          ))}
        </div>

        <div className="td-form-row">
          <Form.Item label="章节" name="chapter" className="td-form-col">
            <Select
              options={chapters.map((c) => ({ label: c, value: c }))}
              placeholder="请选择章节"
            />
          </Form.Item>

          <Form.Item label="知识点" className="td-form-col">
            <div className="td-kp-box">
              <div className="td-kp-pool">
                {kpPool.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`td-kp-chip ${kpSelected.includes(k) ? "is-active" : ""}`}
                    onClick={() => {
                      if (kpSelected.includes(k)) {
                        removeKp(k);
                      } else {
                        setKpSelected((prev) => [...prev, k]);
                      }
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="td-kp-add">
                <Input
                  value={kpInput}
                  onChange={(e) => setKpInput(e.target.value)}
                  placeholder="输入新知识点，回车或点击新增"
                  onPressEnter={(e) => {
                    e.preventDefault();
                    addKpFromInput();
                  }}
                />
                <Button icon={<PlusOutlined />} onClick={addKpFromInput}>
                  新增
                </Button>
              </div>

              <div className="td-kp-selected">
                {kpSelected.length ? (
                  <Space size={6} wrap>
                    {kpSelected.map((k) => (
                      <Tag key={k} closable onClose={() => removeKp(k)}>
                        {k}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <div className="td-muted">可从题库筛选或新增知识点</div>
                )}
              </div>
            </div>
          </Form.Item>
        </div>

        <div className="td-drawer-actions">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" className="td-primary" onClick={handleOk}>
            {editingQuestion ? "保存修改" : "保存题目"}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
