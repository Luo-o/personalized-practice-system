import React, { useMemo, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useStudentStore } from "../../../store";

const { TextArea } = Input;

function parseStudentText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const students = [];
  const invalidLines = [];
  const seenStudentNos = new Set();

  lines.forEach((line, index) => {
    const parts = line.split(/[,，\t]/).map((item) => item.trim());

    const [
      studentNo,
      name,
      gender = "",
      major = "",
      grade = "",
      className = "",
      phone = "",
      email = "",
    ] = parts;

    if (!studentNo || !name) {
      invalidLines.push(index + 1);
      return;
    }

    if (seenStudentNos.has(studentNo)) {
      invalidLines.push(index + 1);
      return;
    }

    seenStudentNos.add(studentNo);

    students.push({
      key: studentNo,
      studentNo,
      name,
      gender,
      major,
      grade,
      className,
      phone,
      email,
    });
  });

  return {
    students,
    invalidLines,
  };
}

export default function StudentManageModal({
  open,
  classes = [],
  onClose,
  onSuccess,
}) {
  const searchStudents = useStudentStore((s) => s.searchStudents);
  const batchCreateStudents = useStudentStore((s) => s.batchCreateStudents);
  const batchAddStudentsToClass = useStudentStore(
    (s) => s.batchAddStudentsToClass,
  );

  const [activeTab, setActiveTab] = useState("create");

  const [batchText, setBatchText] = useState("");
  const [previewStudents, setPreviewStudents] = useState([]);
  const [creating, setCreating] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentRowKeys, setSelectedStudentRowKeys] = useState([]);
  const [targetClassId, setTargetClassId] = useState(null);
  const [adding, setAdding] = useState(false);

  const classOptions = useMemo(() => {
    return classes.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [classes]);

  const selectedStudentIds = useMemo(() => {
    return selectedStudentRowKeys
      .map((key) => {
        const target = studentList.find(
          (item) => String(item.id) === String(key),
        );
        return target?.id;
      })
      .filter(Boolean);
  }, [selectedStudentRowKeys, studentList]);

  const handlePreview = () => {
    const result = parseStudentText(batchText);

    if (result.invalidLines.length) {
      message.warning(
        `第 ${result.invalidLines.join("、")} 行格式不正确或学号重复，已自动忽略`,
      );
    }

    setPreviewStudents(result.students);

    if (!result.students.length) {
      message.warning("没有可导入的学生数据");
      return;
    }

    message.success(`已解析 ${result.students.length} 条学生数据`);
  };

  const handleBatchCreate = async () => {
    if (!previewStudents.length) {
      message.warning("请先解析学生数据");
      return;
    }

    try {
      setCreating(true);

      const res = await batchCreateStudents(previewStudents);

      const createdCount =
        res?.createdCount ?? res?.created ?? previewStudents.length;
      const skippedCount = res?.skippedCount ?? res?.skipped?.length ?? 0;

      if (skippedCount > 0) {
        message.warning(
          `创建完成，成功 ${createdCount} 条，跳过 ${skippedCount} 条重复学号`,
        );
      } else {
        message.success(`批量创建成功，共 ${createdCount} 名学生`);
      }

      setBatchText("");
      setPreviewStudents([]);
      onSuccess?.();
    } catch (error) {
      console.error("批量创建学生失败：", error);
      message.error(error?.message || "批量创建学生失败");
    } finally {
      setCreating(false);
    }
  };

  const handleSearchStudents = async () => {
    const keyword = searchKeyword.trim();

    if (!keyword) {
      message.warning("请输入学生学号或姓名");
      return;
    }

    try {
      setSearching(true);

      const list = await searchStudents(keyword);

      setStudentList(Array.isArray(list) ? list : []);
      setSelectedStudentRowKeys([]);

      if (!list?.length) {
        message.info("未搜索到匹配学生");
      }
    } catch (error) {
      console.error("搜索学生失败：", error);
      message.error(error?.message || "搜索学生失败");
    } finally {
      setSearching(false);
    }
  };

  const handleBatchAddToClass = async () => {
    if (!targetClassId) {
      message.warning("请选择目标班级");
      return;
    }

    if (!selectedStudentIds.length) {
      message.warning("请选择要添加的学生");
      return;
    }

    try {
      setAdding(true);

      await batchAddStudentsToClass({
        classId: targetClassId,
        studentIds: selectedStudentIds,
      });

      message.success(`已添加 ${selectedStudentIds.length} 名学生到班级`);

      setSelectedStudentRowKeys([]);
      onSuccess?.();
    } catch (error) {
      console.error("批量添加学生失败：", error);
      message.error(error?.message || "批量添加学生失败");
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    if (creating || searching || adding) return;
    onClose?.();
  };

  return (
    <Modal
      title="学生管理"
      open={open}
      onCancel={handleClose}
      width={920}
      footer={null}
      centered
      destroyOnClose={false}
      styles={{
        body: {
          height: 680,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        items={[
          {
            key: "create",
            label: "批量创建学生",
            children: (
              <div className="student-manage-panel">
                <div className="student-manage-scroll">
                  <div className="student-manage-tip">
                    每行一名学生，格式为：学号，姓名，性别，专业，年级，班级名称，手机号，邮箱。
                    其中学号和姓名必填。学号需要保持唯一，重复学号会被忽略。
                  </div>

                  <TextArea
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    rows={8}
                    placeholder={`示例：\n20220001，张三，男，软件工程，2022，软件工程1班，13800000001，zhangsan@example.com\n20220002，李四，女，软件工程，2022，软件工程1班，13800000002，lisi@example.com`}
                  />

                  <div className="student-manage-actions">
                    <Space>
                      <Button icon={<UploadOutlined />} onClick={handlePreview}>
                        解析预览
                      </Button>
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        loading={creating}
                        onClick={handleBatchCreate}
                      >
                        批量创建学生
                      </Button>
                    </Space>
                  </div>

                  <Table
                    rowKey="studentNo"
                    size="small"
                    dataSource={previewStudents}
                    pagination={{ pageSize: 5 }}
                    columns={[
                      {
                        title: "学号",
                        dataIndex: "studentNo",
                      },
                      {
                        title: "姓名",
                        dataIndex: "name",
                      },
                      {
                        title: "性别",
                        dataIndex: "gender",
                        render: (value) => value || "-",
                      },
                      {
                        title: "专业",
                        dataIndex: "major",
                        render: (value) => value || "-",
                      },
                      {
                        title: "年级",
                        dataIndex: "grade",
                        render: (value) => value || "-",
                      },
                      {
                        title: "班级名称",
                        dataIndex: "className",
                        render: (value) =>
                          value ? <Tag color="blue">{value}</Tag> : "-",
                      },
                      {
                        title: "手机号",
                        dataIndex: "phone",
                        render: (value) => value || "-",
                      },
                      {
                        title: "邮箱",
                        dataIndex: "email",
                        render: (value) => value || "-",
                      },
                    ]}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "add",
            label: "添加学生到班级",
            children: (
              <div className="student-manage-panel">
                <div className="student-manage-scroll">
                  <div className="student-manage-search-row">
                    <Input
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onPressEnter={handleSearchStudents}
                      placeholder="请输入学生学号或姓名"
                      prefix={<SearchOutlined />}
                      allowClear
                    />

                    <Button
                      type="primary"
                      loading={searching}
                      onClick={handleSearchStudents}
                    >
                      搜索
                    </Button>
                  </div>

                  <div className="student-manage-class-row">
                    <Select
                      value={targetClassId}
                      onChange={setTargetClassId}
                      placeholder="请选择要加入的班级"
                      options={classOptions}
                      style={{ minWidth: 260 }}
                    />

                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      loading={adding}
                      onClick={handleBatchAddToClass}
                    >
                      批量加入班级
                    </Button>
                  </div>

                  <Table
                    rowKey={(record) => String(record.id)}
                    size="small"
                    dataSource={studentList}
                    rowSelection={{
                      selectedRowKeys: selectedStudentRowKeys,
                      onChange: setSelectedStudentRowKeys,
                    }}
                    pagination={{ pageSize: 6 }}
                    columns={[
                      {
                        title: "学号",
                        dataIndex: "studentNo",
                      },
                      {
                        title: "姓名",
                        dataIndex: "name",
                      },
                      {
                        title: "性别",
                        dataIndex: "gender",
                        render: (value) => value || "-",
                      },
                      {
                        title: "专业",
                        dataIndex: "major",
                        render: (value) => value || "-",
                      },
                      {
                        title: "年级",
                        dataIndex: "grade",
                        render: (value) => value || "-",
                      },
                      {
                        title: "所在班级",
                        dataIndex: "className",
                        render: (value) =>
                          value ? <Tag color="blue">{value}</Tag> : "-",
                      },
                    ]}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
