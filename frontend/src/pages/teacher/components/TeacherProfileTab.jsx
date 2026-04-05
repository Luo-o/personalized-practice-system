import React, { useEffect, useMemo, useState } from "react";
import {
  IdcardFilled,
  MailFilled,
  PhoneFilled,
  LockFilled,
  RightOutlined,
  MergeFilled,
  LogoutOutlined,
  ContainerFilled,
  SafetyCertificateFilled,
  BankFilled,
  CameraFilled,
} from "@ant-design/icons";
import { Button, Input, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import "./teacher-profile.css";

const TEACHER_AVATAR_OPTIONS = [
  {
    key: "teacher-default",
    label: "默认教师头像",
    value: "/avatars/default-teacher-avatar.svg",
  },
  {
    key: "student-default",
    label: "学生风格头像",
    value: "/avatars/default-student-avatar.svg",
  },
];

function SettingSection({ title, subtitle, children }) {
  return (
    <section className="profile-setting-section">
      <div className="profile-setting-section__header">
        <div className="profile-setting-section__title">{title}</div>
        {subtitle ? (
          <div className="profile-setting-section__subtitle">{subtitle}</div>
        ) : null}
      </div>
      <div className="profile-setting-section__list">{children}</div>
    </section>
  );
}

function SettingItem({ icon, label, value, onClick, danger = false }) {
  return (
    <button
      type="button"
      className={`profile-setting-item ${danger ? "is-danger" : ""}`}
      onClick={onClick}
    >
      <div className="profile-setting-item__left">
        <div className="profile-setting-item__icon">{icon}</div>
        <div className="profile-setting-item__content">
          <div className="profile-setting-item__label">{label}</div>
          <div className="profile-setting-item__value">{value || "未设置"}</div>
        </div>
      </div>

      <div className="profile-setting-item__arrow">
        <RightOutlined />
      </div>
    </button>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

export default function TeacherProfileTab() {
  const navigate = useNavigate();

  const currentUser = useAuthStore((s) => s.currentUser);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const logout = useAuthStore((s) => s.logout);

  const [activeModal, setActiveModal] = useState(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [emailForm, setEmailForm] = useState({
    email: "",
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarForm, setAvatarForm] = useState({
    avatar: "/avatars/default-teacher-avatar.svg",
  });

  useEffect(() => {
    async function init() {
      try {
        if (!currentUser?.id || currentUser?.role !== "teacher") return;
        await refreshMe?.();
      } catch (error) {
        console.error("加载教师个人信息失败：", error);
      }
    }

    init();
  }, [currentUser?.id, currentUser?.role, refreshMe]);

  const profile = useMemo(() => {
    const raw = currentUser?.profile || {};
    return {
      teacherNo: raw.teacher_no || raw.teacherNo || "",
      name: raw.name || "",
      gender: raw.gender || "",
      phone: raw.phone || "",
      email: raw.email || "",
      title: raw.title || "",
      department: raw.department || "",
      avatar: raw.avatar || "/avatars/default-teacher-avatar.svg",
    };
  }, [currentUser]);

  const accountDisplay = useMemo(() => {
    return {
      teacherNo: profile.teacherNo || "未设置",
      email: profile.email || "未设置邮箱",
      phone: profile.phone || "未设置手机号",
      password: "点击修改密码",
    };
  }, [profile]);

  const openEmailModal = () => {
    setEmailForm({
      email: profile.email || "",
    });
    setActiveModal("email");
  };

  const openPhoneModal = () => {
    setPhoneForm({
      phone: profile.phone || "",
    });
    setActiveModal("phone");
  };

  const openPasswordModal = () => {
    setPasswordForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setActiveModal("password");
  };

  const openAvatarModal = () => {
    setAvatarForm({
      avatar: profile.avatar || "/avatars/default-teacher-avatar.svg",
    });
    setActiveModal("avatar");
  };

  const openReadonlyTip = (fieldLabel) => {
    Modal.info({
      title: `修改${fieldLabel}`,
      content: `该信息由系统统一导入，若需要修改，请联系管理人员。`,
      okText: "我知道了",
      centered: true,
    });
  };

  const closeModal = () => {
    if (savingEmail || savingPhone || savingPassword || savingAvatar) return;
    setActiveModal(null);
  };

  const handleSaveEmail = async () => {
    const email = emailForm.email.trim();

    if (!email) {
      message.warning("请输入邮箱");
      return;
    }

    try {
      setSavingEmail(true);

      await updateProfile({
        email,
      });

      await refreshMe?.();
      message.success("邮箱修改成功");
      setActiveModal(null);
    } catch (error) {
      console.error("修改邮箱失败：", error);
      message.error(error?.message || "邮箱修改失败");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePhone = async () => {
    const phone = phoneForm.phone.trim();

    if (!phone) {
      message.warning("请输入手机号");
      return;
    }

    try {
      setSavingPhone(true);

      await updateProfile({
        phone,
      });

      await refreshMe?.();
      message.success("手机号修改成功");
      setActiveModal(null);
    } catch (error) {
      console.error("修改手机号失败：", error);
      message.error(error?.message || "手机号修改失败");
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSavePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword) {
      message.warning("请输入当前密码");
      return;
    }

    if (!newPassword) {
      message.warning("请输入新密码");
      return;
    }

    if (newPassword.length < 6) {
      message.warning("新密码长度不能少于 6 位");
      return;
    }

    if (newPassword !== confirmPassword) {
      message.warning("两次输入的新密码不一致");
      return;
    }

    try {
      setSavingPassword(true);

      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      message.success("密码修改成功");
      setActiveModal(null);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("修改密码失败：", error);
      message.error(error?.message || "修改密码失败");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.warning("请选择图片文件");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.warning("图片大小不能超过 2MB");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarForm({
        avatar: dataUrl,
      });
    } catch (error) {
      console.error("读取头像失败：", error);
      message.error("读取图片失败，请重试");
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarForm.avatar) {
      message.warning("请选择头像");
      return;
    }

    try {
      setSavingAvatar(true);
      await updateProfile({
        avatar: avatarForm.avatar,
      });
      await refreshMe?.();
      message.success("头像修改成功");
      setActiveModal(null);
    } catch (error) {
      console.error("修改头像失败：", error);
      message.error(error?.message || "头像修改失败");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "退出登录",
      content: "确认退出当前账号吗？",
      okText: "退出登录",
      cancelText: "取消",
      centered: true,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          if (typeof logout === "function") {
            await logout();
          }
          message.success("已退出登录");
          navigate("/login", { replace: true });
        } catch (error) {
          console.error("退出登录失败：", error);
          message.error("退出登录失败，请稍后重试");
        }
      },
    });
  };

  return (
    <div className="teacher-profile-page-v2">
      <div className="teacher-profile-page-v2__container teacher-profile-page-v2__container--list">
        <div className="teacher-profile-page-v2__hero">
          <div className="teacher-profile-page-v2__avatar-wrap">
            <img
              className="teacher-profile-page-v2__avatar"
              src={profile.avatar}
              alt="教师头像"
            />
          </div>

          <div className="teacher-profile-page-v2__hero-info">
            <div className="teacher-profile-page-v2__hero-name">
              {profile.name || "未设置姓名"}
            </div>
            <div className="teacher-profile-page-v2__hero-meta">
              {[
                profile.title || "未设置职称",
                profile.department || "未设置院系",
              ].join(" · ")}
            </div>
          </div>

          <Button
            type="primary"
            icon={<CameraFilled />}
            onClick={openAvatarModal}
          >
            更换头像
          </Button>
        </div>

        <SettingSection
          title="账号信息"
          subtitle="你可以使用工号、邮箱或手机号码登录"
        >
          <SettingItem
            icon={<ContainerFilled />}
            label="工号"
            value={accountDisplay.teacherNo}
            onClick={() =>
              Modal.info({
                title: "工号",
                content: "工号为系统字段，不支持自行修改。",
                okText: "我知道了",
                centered: true,
              })
            }
          />

          <SettingItem
            icon={<MailFilled />}
            label="邮箱"
            value={accountDisplay.email}
            onClick={openEmailModal}
          />

          <SettingItem
            icon={<PhoneFilled />}
            label="手机号"
            value={accountDisplay.phone}
            onClick={openPhoneModal}
          />

          <SettingItem
            icon={<LockFilled />}
            label="密码"
            value={accountDisplay.password}
            onClick={openPasswordModal}
          />
        </SettingSection>

        <SettingSection
          title="个人信息"
          subtitle="以下信息由系统导入，若需要修改，请联系管理人员"
        >
          <SettingItem
            icon={<IdcardFilled />}
            label="姓名"
            value={profile.name || "未设置"}
            onClick={() => openReadonlyTip("姓名")}
          />

          <SettingItem
            icon={<MergeFilled />}
            label="性别"
            value={profile.gender || "未设置"}
            onClick={() => openReadonlyTip("性别")}
          />

          <SettingItem
            icon={<SafetyCertificateFilled />}
            label="职称"
            value={profile.title || "未设置"}
            onClick={() => openReadonlyTip("职称")}
          />

          <SettingItem
            icon={<BankFilled />}
            label="院系"
            value={profile.department || "未设置"}
            onClick={() => openReadonlyTip("院系")}
          />
        </SettingSection>

        <SettingSection title="账号管理">
          <SettingItem
            icon={<LogoutOutlined />}
            label="退出登录"
            value=" "
            onClick={handleLogout}
            danger
          />
        </SettingSection>
      </div>

      <Modal
        title="更换头像"
        open={activeModal === "avatar"}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={savingAvatar}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveAvatar}
            loading={savingAvatar}
          >
            保存
          </Button>,
        ]}
        centered
        destroyOnClose
      >
        <div className="profile-modal-body">
          <div className="profile-modal-tip">
            你可以选择默认头像，也可以从本地上传一张图片。
          </div>

          <div className="profile-avatar-preview">
            <img src={avatarForm.avatar} alt="头像预览" />
          </div>

          <div className="profile-avatar-picker">
            {TEACHER_AVATAR_OPTIONS.map((item) => {
              const active = avatarForm.avatar === item.value;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`profile-avatar-option ${active ? "is-active" : ""}`}
                  onClick={() =>
                    setAvatarForm({
                      avatar: item.value,
                    })
                  }
                >
                  <img src={item.value} alt={item.label} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="profile-avatar-upload">
            <label className="profile-avatar-upload__btn">
              从本地选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                hidden
              />
            </label>
            <div className="profile-avatar-upload__tip">
              支持 JPG、PNG、WEBP，建议不超过 2MB
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="修改邮箱"
        open={activeModal === "email"}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={savingEmail}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveEmail}
            loading={savingEmail}
          >
            保存
          </Button>,
        ]}
        centered
        destroyOnClose
      >
        <div className="profile-modal-body">
          <div className="profile-modal-tip">修改后可使用新邮箱登录系统。</div>
          <Input
            value={emailForm.email}
            onChange={(e) =>
              setEmailForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            placeholder="请输入邮箱"
            prefix={<MailFilled />}
          />
        </div>
      </Modal>

      <Modal
        title="修改手机号"
        open={activeModal === "phone"}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={savingPhone}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSavePhone}
            loading={savingPhone}
          >
            保存
          </Button>,
        ]}
        centered
        destroyOnClose
      >
        <div className="profile-modal-body">
          <div className="profile-modal-tip">
            修改后可使用新手机号登录系统。
          </div>
          <Input
            value={phoneForm.phone}
            onChange={(e) =>
              setPhoneForm((prev) => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            placeholder="请输入手机号"
            prefix={<PhoneFilled />}
          />
        </div>
      </Modal>

      <Modal
        title="修改密码"
        open={activeModal === "password"}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal} disabled={savingPassword}>
            取消
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSavePassword}
            loading={savingPassword}
          >
            保存
          </Button>,
        ]}
        centered
        destroyOnClose
      >
        <div className="profile-modal-body">
          <div className="profile-modal-form">
            <Input.Password
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  oldPassword: e.target.value,
                }))
              }
              placeholder="请输入当前密码"
              prefix={<LockFilled />}
            />

            <Input.Password
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="请输入新密码"
              prefix={<LockFilled />}
            />

            <Input.Password
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="请再次输入新密码"
              prefix={<LockFilled />}
            />
          </div>

          <div className="profile-modal-tip">新密码建议不少于 6 位。</div>
        </div>
      </Modal>
    </div>
  );
}
