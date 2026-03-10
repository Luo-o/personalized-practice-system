import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import "./account-settings-modal.css";

export default function AccountSettingsModal({
  open,
  onClose,
  user,
  onSubmit,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: user?.name || "",
      studentId: user?.studentId || "",
      password: "",
      password2: "",
    });
  }, [open, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const nextPassword = values.password?.trim();

      if (!nextPassword) {
        message.warning("请输入新密码");
        return;
      }

      if (typeof onSubmit === "function") {
        await onSubmit(nextPassword);
      } else {
        message.success("密码已更新（示例）");
      }

      onClose?.();
      form.resetFields(["password", "password2"]);
    } catch (e) {
      // 表单校验失败时不处理
      console.log("表单校验失败:", e);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      closable
      closeIcon={<span className="asm-close">×</span>}
      className="asm-modal"
      title={null}
    >
      <div className="asm-head">
        <div className="asm-title">账号设置</div>
      </div>

      <Form form={form} layout="vertical" className="asm-form">
        <Form.Item label="姓名" name="name">
          <Input disabled />
        </Form.Item>

        <Form.Item label="学号" name="studentId">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="password"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码至少 6 位" },
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="password2"
          dependencies={["password"]}
          rules={[
            { required: true, message: "请再次输入新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="再次输入新密码" />
        </Form.Item>

        <div className="asm-actions">
          <Button onClick={onClose} className="asm-btn">
            取消
          </Button>
          <Button type="primary" onClick={handleOk} className="asm-btn">
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
