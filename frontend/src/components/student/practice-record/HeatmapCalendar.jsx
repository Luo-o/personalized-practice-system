import React, { useMemo } from "react";

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(String(v).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function getDayCountMap(records) {
  const map = {};

  records.forEach((r) => {
    const d = parseDate(r.submitted_at);
    if (!d) return;

    const key = formatDate(d);
    map[key] = (map[key] || 0) + Number(r.total_count || 0);
  });

  return map;
}

function buildHeatmapData(records, days = 140) {
  const countMap = getDayCountMap(records);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const list = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDate(d);

    list.push({
      date: key,
      count: countMap[key] || 0,
      weekDay: d.getDay(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    });
  }

  return list;
}

function getHeatLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export default function HeatmapCalendar({ records = [] }) {
  const heatmapData = useMemo(() => buildHeatmapData(records, 140), [records]);

  const weeks = useMemo(() => {
    const columns = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      columns.push(heatmapData.slice(i, i + 7));
    }
    return columns;
  }, [heatmapData]);

  const totalSolved = useMemo(
    () => records.reduce((sum, r) => sum + Number(r.total_count || 0), 0),
    [records],
  );

  const activeDays = useMemo(
    () => heatmapData.filter((item) => item.count > 0).length,
    [heatmapData],
  );

  return (
    <section className="pr-panel pr-heatmap-panel">
      <div className="pr-panel-head pr-panel-head--between">
        <div>
          <h3 className="pr-panel-title">练习热力图</h3>
          <p className="pr-panel-subtitle">展示最近 140 天每日完成的题量</p>
        </div>

        <div className="pr-heatmap-summary">
          <span>累计刷题 {totalSolved} 题</span>
          <span>活跃 {activeDays} 天</span>
        </div>
      </div>

      <div className="pr-heatmap-wrap">
        <div className="pr-heatmap-grid">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="pr-heatmap-column">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`pr-heatmap-cell level-${getHeatLevel(cell.count)}`}
                  title={`${cell.date}：${cell.count} 题`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="pr-heatmap-legend">
          <span>少</span>
          <div className="pr-legend-box level-0" />
          <div className="pr-legend-box level-1" />
          <div className="pr-legend-box level-2" />
          <div className="pr-legend-box level-3" />
          <div className="pr-legend-box level-4" />
          <span>多</span>
        </div>
      </div>
    </section>
  );
}
