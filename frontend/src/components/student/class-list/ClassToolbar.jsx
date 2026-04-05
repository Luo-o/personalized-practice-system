import React from "react";
import { Button, Input, Tabs } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";

export default function ClassToolbar({
  activeTab,
  onTabChange,
  keyword,
  onKeywordChange,
  onJoinClick,
}) {
  return (
    <div className="class-toolbar">
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="class-list-tabs"
        items={[
          {
            key: "class-list",
            label: "班级列表",
          },
        ]}
      />

      <div className="class-toolbar-actions">
        <Input
          allowClear
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="请搜索课程"
          className="class-search-input"
        />

        <Button
          type="default"
          icon={<PlusOutlined />}
          className="class-join-btn"
          onClick={onJoinClick}
        >
          加入课程
        </Button>
      </div>
    </div>
  );
}
