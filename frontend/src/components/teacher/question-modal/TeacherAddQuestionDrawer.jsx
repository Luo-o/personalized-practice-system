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
import { useSubjectStore } from "../../../store";
import "./teacher-add-question-drawer.css";

const DIFFS = ["简单", "中等", "困难"];

function emptyOptions() {
  return [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ];
}

function toUploadFileList(images = []) {
  return images.map((img, index) => ({
    uid: `existing-${index}`,
    name: `image-${index + 1}`,
    status: "done",
    url: img.imageUrl || img.url || "",
  }));
}

export default function TeacherAddQuestionDrawer({
  open,
  onClose,
  onSubmit,
  editingQuestion,
}) {
  const [form] = Form.useForm();

  const subjects = useSubjectStore((state) => state.subjects);
  const chapters = useSubjectStore((state) => state.chapters);
  const chapterTree = useSubjectStore((state) => state.chapterTree);
  const fetchSubjects = useSubjectStore((state) => state.fetchSubjects);
  const fetchSubjectDetail = useSubjectStore(
    (state) => state.fetchSubjectDetail,
  );

  const defaultSubjectId = subjects[0]?.id;
  const defaultChapterId = chapters[0]?.id;

  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [kpSelected, setKpSelected] = useState([]);
  const [kpInput, setKpInput] = useState("");
  const [options, setOptions] = useState(emptyOptions());
  const [correct, setCorrect] = useState("A");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open && !subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
      });
    }
  }, [open, subjects.length, fetchSubjects]);

  useEffect(() => {
    if (!open) return;
    if (!subjectId && defaultSubjectId) {
      setSubjectId(defaultSubjectId);
    }
  }, [open, subjectId, defaultSubjectId]);

  useEffect(() => {
    if (!open || !subjectId) return;

    fetchSubjectDetail(subjectId).catch((error) => {
      console.error("获取科目详情失败：", error);
    });
  }, [open, subjectId, fetchSubjectDetail]);

  const subjectOptions = useMemo(() => {
    return subjects.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [subjects]);

  const chapterOptions = useMemo(() => {
    return chapters.map((c) => ({
      label: c.name,
      value: c.id,
    }));
  }, [chapters]);

  const kpPool = useMemo(() => {
    return chapterTree.flatMap((chapter) => chapter.knowledgePoints || []);
  }, [chapterTree]);

  const addKpFromInput = () => {
    const v = kpInput.trim();
    if (!v) return;

    const exists = kpPool.some((kp) => kp.name === v);
    if (exists) {
      const matched = kpPool.find((kp) => kp.name === v);
      if (matched && !kpSelected.some((item) => item.id === matched.id)) {
        setKpSelected((prev) => [...prev, matched]);
      }
    } else {
      const temp = {
        id: `temp-${Date.now()}`,
        name: v,
      };
      setKpSelected((prev) => [...prev, temp]);
    }

    setKpInput("");
  };

  const removeKp = (id) => {
    setKpSelected((prev) => prev.filter((x) => String(x.id) !== String(id)));
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

    const hasNewUpload = fileList.some((f) => !!f.originFileObj && !f.url);
    if (hasNewUpload) {
      message.warning("当前后端暂未支持图片文件直传，新上传图片将被忽略");
    }

    const payload = {
      title: values.stem,
      subjectId: values.subjectId,
      difficulty: values.difficulty,
      chapterId: values.chapterId,
      knowledgePointIds: kpSelected
        .filter((kp) => !String(kp.id).startsWith("temp-"))
        .map((kp) => kp.id),
      source: values.source,
      images: fileList
        .filter((f) => f.url)
        .map((f, index) => ({
          url: f.url,
          sortOrder: index + 1,
        })),
      options,
      correct,
      analysis: values.analysis || "",
      isReal: values.isReal,
    };

    await onSubmit?.(payload);
  };

  useEffect(() => {
    if (!open) return;

    if (editingQuestion) {
      const nextSubjectId = editingQuestion.subjectId || defaultSubjectId;
      setSubjectId(nextSubjectId);

      form.setFieldsValue({
        subjectId: nextSubjectId,
        difficulty: editingQuestion.difficulty,
        stem: editingQuestion.title,
        source: editingQuestion.source,
        chapterId: editingQuestion.chapterId,
        analysis: editingQuestion.analysis,
        isReal: editingQuestion.isReal ?? false,
      });

      setKpSelected(editingQuestion.knowledgePoints || []);
      setKpInput("");
      setCorrect(editingQuestion.correct || "A");
      setOptions(
        editingQuestion.options?.length
          ? editingQuestion.options.map((item) => ({
              key: item.key,
              text: item.text,
            }))
          : emptyOptions(),
      );
      setFileList(toUploadFileList(editingQuestion.images || []));
    } else {
      setSubjectId(defaultSubjectId);
      setKpSelected([]);
      setKpInput("");
      setCorrect("A");
      setOptions(emptyOptions());
      setFileList([]);

      form.setFieldsValue({
        subjectId: defaultSubjectId,
        difficulty: "简单",
        stem: "",
        source: "教师录入",
        chapterId: defaultChapterId,
        analysis: "",
        isReal: false,
      });
    }
  }, [open, editingQuestion, form, defaultSubjectId, defaultChapterId]);

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
          subjectId: defaultSubjectId,
          difficulty: "简单",
          chapterId: defaultChapterId,
          source: "教师录入",
        }}
      >
        <div className="td-form-row">
          <Form.Item
            label="科目"
            name="subjectId"
            className="td-form-col"
            rules={[{ required: true, message: "请选择科目" }]}
          >
            <Select
              options={subjectOptions}
              placeholder="请选择科目"
              onChange={(v) => {
                setSubjectId(v);
                setKpSelected([]);
                form.setFieldValue("chapterId", undefined);
              }}
            />
          </Form.Item>

          <Form.Item
            label="难度"
            name="difficulty"
            className="td-form-col"
            rules={[{ required: true, message: "请选择难度" }]}
          >
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

        <Form.Item label="真题标注" name="isReal" initialValue={false}>
          <Radio.Group>
            <Radio value={true}>真题</Radio>
            <Radio value={false}>非真题</Radio>
          </Radio.Group>
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
          <Form.Item
            label="章节"
            name="chapterId"
            className="td-form-col"
            rules={[{ required: true, message: "请选择章节" }]}
          >
            <Select options={chapterOptions} placeholder="请选择章节" />
          </Form.Item>

          <Form.Item label="知识点" className="td-form-col">
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
                    <Tag key={k.id} closable onClose={() => removeKp(k.id)}>
                      {k.name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <div className="td-muted">可从当前科目知识点中选择</div>
              )}
            </div>
            <div className="td-kp-box">
              <div className="td-kp-pool">
                {kpPool.map((k) => {
                  const active = kpSelected.some(
                    (item) => String(item.id) === String(k.id),
                  );

                  return (
                    <button
                      key={k.id}
                      type="button"
                      className={`td-kp-chip ${active ? "is-active" : ""}`}
                      onClick={() => {
                        if (active) {
                          removeKp(k.id);
                        } else {
                          setKpSelected((prev) => [...prev, k]);
                        }
                      }}
                    >
                      {k.name}
                    </button>
                  );
                })}
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
