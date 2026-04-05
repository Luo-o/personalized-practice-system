import React from "react";
import { Empty } from "antd";
import ClassCard from "./ClassCard";

export default function ClassGrid({
  classes,
  keyword,
  onGoDetail,
  onQuitClass,
}) {
  return (
    <div className="class-card-grid">
      {classes.length > 0 ? (
        classes.map((item) => (
          <ClassCard
            key={item.id}
            item={item}
            onGoDetail={onGoDetail}
            onQuitClass={onQuitClass}
          />
        ))
      ) : (
        <div className="class-empty-wrap">
          <Empty
            description={
              keyword.trim() ? "没有搜索到相关班级" : "你当前还没有加入任何班级"
            }
          />
        </div>
      )}
    </div>
  );
}
