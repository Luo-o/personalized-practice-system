import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Select, Upload, message } from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useSubjectStore } from "../../../store";
import "./teacher-question-import-card.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8088";

function getFilenameFromDisposition(disposition, fallbackName) {
  if (!disposition) return fallbackName;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallbackName;
}

async function downloadByFetch(path, fallbackName) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`下载失败（${response.status}）`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("接口返回了网页内容，当前前端没有正确请求到后端接口");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  const filename = getFilenameFromDisposition(disposition, fallbackName);

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function TeacherQuestionImportCard({
  onImportSuccess,
  onClose,
}) {
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [skipReview] = useState(true);
  const [dedup] = useState(true);
  const [clearExisting] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(undefined);

  const subjects = useSubjectStore((s) => s.subjects);
  const fetchSubjects = useSubjectStore((s) => s.fetchSubjects);

  useEffect(() => {
    if (!subjects.length) {
      fetchSubjects().catch((error) => {
        console.error("获取科目失败：", error);
        message.error(error?.message || "获取科目失败");
      });
    }
  }, [subjects.length, fetchSubjects]);

  const fileList = useMemo(() => {
    return importFile ? [importFile] : [];
  }, [importFile]);

  const subjectOptions = useMemo(() => {
    return (subjects || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [subjects]);

  const handleDownloadJson = async () => {
    try {
      setDownloadingJson(true);
      await downloadByFetch(
        "/api/question-bank/template/json",
        "sample_questions.json",
      );
    } catch (error) {
      console.error("下载示例 JSON 失败：", error);
      message.error(error?.message || "下载示例 JSON 失败");
    } finally {
      setDownloadingJson(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      await downloadByFetch(
        "/api/question-bank/template/zip",
        "sample_question_import.zip",
      );
    } catch (error) {
      console.error("下载示例 ZIP 失败：", error);
      message.error(error?.message || "下载示例 ZIP 失败");
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleImport = async () => {
    if (!selectedSubjectId) {
      message.warning("请先选择导入科目");
      return;
    }

    if (!importFile) {
      message.warning("请先选择 zip 压缩包");
      return;
    }

    try {
      setImporting(true);

      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("subjectId", String(selectedSubjectId));
      formData.append("skipReview", String(skipReview));
      formData.append("dedup", String(dedup));
      formData.append("clearExisting", String(clearExisting));

      const response = await fetch(`${API_BASE}/api/question-bank/import-zip`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "批量导入失败");
      }

      const data = result?.data || {};

      message.success(
        `导入完成：成功 ${data.inserted || 0} 题，重复跳过 ${data.skipped_duplicate || 0} 题`,
      );

      setImportFile(null);

      if (typeof onImportSuccess === "function") {
        await onImportSuccess(data);
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("批量导入失败：", error);
      message.error(error?.message || "批量导入失败");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="tb-import-panel">
      <div className="tb-import-head">
        <div>
          <div className="tb-import-title">批量导入题目zip</div>
          <div className="tb-import-desc">
            请先选择导入科目，再上传 zip 压缩包。压缩包内部需包含
            <code>questions.json</code>
            ，如题目含图片，请同时提供
            <code>images/</code> 文件夹。
          </div>
        </div>

        <div className="tb-import-head-actions">
          <Button
            icon={<DownloadOutlined />}
            loading={downloadingJson}
            onClick={handleDownloadJson}
          >
            示例 JSON
          </Button>

          <Button
            icon={<DownloadOutlined />}
            loading={downloadingZip}
            onClick={handleDownloadZip}
          >
            示例 ZIP
          </Button>

          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={importing}
            onClick={handleImport}
          >
            开始导入
          </Button>
        </div>
      </div>

      <div className="tb-import-body">
        <div className="tb-import-subject-row">
          <div className="tb-import-subject-label">导入科目</div>
          <Select
            className="tb-import-subject-select"
            placeholder="请选择要导入到哪个科目"
            value={selectedSubjectId}
            onChange={setSelectedSubjectId}
            options={subjectOptions}
            showSearch
            optionFilterProp="label"
          />
        </div>

        <Upload.Dragger
          accept=".zip,application/zip,application/x-zip-compressed"
          beforeUpload={(file) => {
            const lowerName = String(file?.name || "").toLowerCase();
            if (!lowerName.endsWith(".zip")) {
              message.error("仅支持上传 zip 压缩包");
              return Upload.LIST_IGNORE;
            }
            setImportFile(file);
            return false;
          }}
          onRemove={() => {
            setImportFile(null);
          }}
          fileList={fileList}
          maxCount={1}
          className="tb-import-dragger"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽上传题目资源包</p>
          <p className="ant-upload-hint">压缩包结构示例：</p>
          <pre className="tb-import-structure">
            {`your-bank.zip
              ├─ questions.json
       └─ images/
                ├─ q1.png
                └─ q2.jpg`}
          </pre>
        </Upload.Dragger>

        <div className="tb-import-note">
          <div className="tb-import-note-title">questions.json 说明</div>
          <div className="tb-import-note-text">
            题目图片字段请使用压缩包内相对路径，例如：
            <code>images/q1.png</code>
            。导入时会统一按你当前选择的“导入科目”覆盖
            <code>subject_id</code>。
          </div>
        </div>
      </div>
    </div>
  );
}
