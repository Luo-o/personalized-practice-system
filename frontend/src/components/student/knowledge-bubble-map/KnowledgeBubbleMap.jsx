import React from "react";
import {
  forceSimulation,
  forceCollide,
  forceLink,
  forceManyBody,
  forceCenter,
  forceRadial,
} from "d3-force";
import { Select } from "antd";
import "./knowledge-bubble-map.css";

const CHAPTER_RADIUS = 60;
const KNOWLEDGE_RADIUS = 34;

export default function KnowledgeBubbleMap({
  data = [],
  width = 320,
  height = 300,
  onClickNode,
  title = "全部知识点",
  subjects = [],
  subject = "",
  onChangeSubject,

  open = false,
  onClose,
  overlay = false,
  overlayMaxWidth = 1200,
  overlayHeightVh = 86,
}) {
  if (!overlay) {
    return (
      <BubbleMapBody
        data={data}
        width={width}
        height={height}
        onClickNode={onClickNode}
        title={title}
        subjects={subjects}
        subject={subject}
        onChangeSubject={onChangeSubject}
        showClose={false}
        onClose={null}
        fit={false}
      />
    );
  }

  if (!open) return null;

  return (
    <div
      className="kbm-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose && onClose();
      }}
    >
      <div
        className="kbm-panel"
        style={{ maxWidth: overlayMaxWidth, height: `${overlayHeightVh}vh` }}
      >
        <BubbleMapBody
          data={data}
          width={0}
          height={0}
          onClickNode={onClickNode}
          title={title}
          subjects={subjects}
          subject={subject}
          onChangeSubject={onChangeSubject}
          showClose
          onClose={onClose}
          fit
        />
      </div>
    </div>
  );
}

class BubbleMapBody extends React.PureComponent {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
    this.svgRef = React.createRef();

    this.nodes = [];
    this.links = [];
    this.sim = null;
    this.raf = 0;
    this.resizeObs = null;

    this.drag = { node: null, ox: 0, oy: 0 };
    this.pan = {
      active: false,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
    };

    const { width, height, fit } = props;
    this.state = {
      boxW: fit ? 0 : width,
      boxH: fit ? 0 : height,
      viewNodes: [],
      viewLinks: [],
      isDragging: false,
      isPanning: false,
      viewX: 0,
      viewY: 0,
    };
  }

  componentDidMount() {
    if (this.props.fit) this.attachResize();
    this.rebuildAndStart();
  }

  componentDidUpdate(prevProps, prevState) {
    const p = this.props;

    const sizeChanged =
      prevState.boxW !== this.state.boxW || prevState.boxH !== this.state.boxH;

    const dataChanged = prevProps.data !== p.data;
    const modeChanged = prevProps.fit !== p.fit;
    const whChanged =
      (!p.fit &&
        (prevProps.width !== p.width || prevProps.height !== p.height)) ||
      modeChanged;

    if (modeChanged) {
      if (p.fit) this.attachResize();
      else this.detachResize();
      if (!p.fit) this.setBoxFromProps();
    }

    if (dataChanged || whChanged || sizeChanged) {
      this.rebuildAndStart();
    }
  }

  componentWillUnmount() {
    this.stopSim();
    this.detachResize();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  attachResize() {
    this.detachResize();
    const el = this.rootRef.current;
    if (!el) return;

    this.resizeObs = new ResizeObserver((entries) => {
      const r = entries[0] && entries[0].contentRect;
      if (!r) return;
      const w = Math.floor(r.width);
      const h = Math.floor(r.height);
      if (w === this.state.boxW && h === this.state.boxH) return;
      this.setState({ boxW: w, boxH: h });
    });

    this.resizeObs.observe(el);
  }

  detachResize() {
    if (!this.resizeObs) return;
    this.resizeObs.disconnect();
    this.resizeObs = null;
  }

  setBoxFromProps() {
    const { width, height } = this.props;
    this.setState({ boxW: width, boxH: height });
  }

  stopSim() {
    if (this.sim) this.sim.stop();
    this.sim = null;
  }

  scheduleViewUpdate() {
    if (this.raf) return;

    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.setState({
        viewNodes: [...this.nodes],
        viewLinks: [...this.links],
      });
    });
  }

  getLayout() {
    const topH = 52;
    const rawW = this.state.boxW || 0;
    const rawH = this.state.boxH || 0;
    const ready = rawW > 0 && rawH > 0;

    const w = Math.max(320, rawW);
    const h = Math.max(260, rawH);
    const svgW = w;
    const svgH = Math.max(200, h - topH);

    return { topH, w, h, svgW, svgH, ready };
  }

  buildGraph(svgW, svgH) {
    const { data } = this.props;
    const centerX = svgW / 2;
    const centerY = svgH / 2;

    const chapterNodes = data.filter((d) => d.type === "chapter");
    const knowledgeNodes = data.filter((d) => d.type === "knowledge");

    const innerRadius = Math.min(svgW, svgH) * 0.16;
    const outerRadius = Math.min(svgW, svgH) * 0.28;

    const chapters = chapterNodes.map((d, index) => {
      const angle =
        chapterNodes.length <= 1
          ? -Math.PI / 2
          : -Math.PI / 2 + (index / chapterNodes.length) * Math.PI * 2;

      return {
        id: String(d.id),
        name: String(d.name ?? ""),
        type: "chapter",
        chapterId: null,
        accuracy: normalizeAccuracy(d.accuracy),
        r: CHAPTER_RADIUS,
        x: centerX + Math.cos(angle) * innerRadius,
        y: centerY + Math.sin(angle) * innerRadius,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      };
    });

    const knowledges = knowledgeNodes.map((d, index) => {
      const angle =
        knowledgeNodes.length <= 1
          ? -Math.PI / 2
          : -Math.PI / 2 + (index / knowledgeNodes.length) * Math.PI * 2;

      return {
        id: String(d.id),
        name: String(d.name ?? ""),
        type: "knowledge",
        chapterId: String(d.chapterId ?? ""),
        accuracy: normalizeAccuracy(d.accuracy),
        r: KNOWLEDGE_RADIUS,
        x: centerX + Math.cos(angle) * outerRadius,
        y: centerY + Math.sin(angle) * outerRadius,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      };
    });

    const nodes = [...chapters, ...knowledges];

    const links = knowledges
      .filter((n) => n.chapterId)
      .map((n) => ({
        source: n.chapterId,
        target: n.id,
      }));

    return { nodes, links };
  }

  rebuildAndStart() {
    const { ready, svgW, svgH } = this.getLayout();

    if (this.props.fit && !ready) {
      this.stopSim();
      if (this.state.viewNodes.length || this.state.viewLinks.length) {
        this.setState({ viewNodes: [], viewLinks: [] });
      }
      return;
    }

    this.stopSim();

    const { nodes, links } = this.buildGraph(svgW, svgH);
    this.nodes = nodes;
    this.links = links;

    this.setState({
      viewNodes: [...nodes],
      viewLinks: [...links],
    });

    const centerX = svgW / 2;
    const centerY = svgH / 2;
    const minSide = Math.min(svgW, svgH);

    const sim = forceSimulation(this.nodes)
      .force("center", forceCenter(centerX, centerY))
      .force(
        "link",
        forceLink(this.links)
          .id((d) => d.id)
          .distance((l) => {
            const target = typeof l.target === "object" ? l.target : null;
            return target?.type === "knowledge" ? 72 : 64;
          })
          .strength(1),
      )
      .force("charge", forceManyBody().strength(-90))
      .force("collide", forceCollide((d) => d.r + 6).iterations(2))
      .force(
        "chapter-ring",
        forceRadial(minSide * 0.16, centerX, centerY).strength((d) =>
          d.type === "chapter" ? 0.18 : 0,
        ),
      )
      .force(
        "knowledge-ring",
        forceRadial(minSide * 0.28, centerX, centerY).strength((d) =>
          d.type === "knowledge" ? 0.12 : 0,
        ),
      )
      .alpha(1)
      .alphaDecay(0.04)
      .on("tick", () => this.scheduleViewUpdate());

    this.sim = sim;
  }

  clientToSvg(clientX, clientY) {
    const svg = this.svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };

    const p = pt.matrixTransform(ctm.inverse());

    return {
      x: p.x - this.state.viewX,
      y: p.y - this.state.viewY,
    };
  }

  pickNodeAt(x, y) {
    const arr = this.nodes;
    for (let i = arr.length - 1; i >= 0; i--) {
      const n = arr[i];
      const dx = x - n.x;
      const dy = y - n.y;
      if (dx * dx + dy * dy <= n.r * n.r) return { node: n, index: i };
    }
    return null;
  }

  onPointerDown = (e) => {
    const { x, y } = this.clientToSvg(e.clientX, e.clientY);
    const hit = this.pickNodeAt(x, y);

    if (hit) {
      const n = hit.node;
      this.drag.node = n;
      this.drag.ox = n.x - x;
      this.drag.oy = n.y - y;

      this.setState({ isDragging: true });

      n.fx = n.x;
      n.fy = n.y;
      if (this.sim) this.sim.alphaTarget(0.22).restart();

      const arr = this.nodes;
      arr.splice(hit.index, 1);
      arr.push(n);
      this.setState({ viewNodes: [...arr] });
    } else {
      this.pan.active = true;
      this.pan.startX = e.clientX;
      this.pan.startY = e.clientY;
      this.pan.originX = this.state.viewX;
      this.pan.originY = this.state.viewY;
      this.setState({ isPanning: true });
    }

    e.currentTarget.setPointerCapture &&
      e.currentTarget.setPointerCapture(e.pointerId);
  };

  onPointerMove = (e) => {
    const n = this.drag.node;

    if (n) {
      const { x, y } = this.clientToSvg(e.clientX, e.clientY);
      n.fx = x + this.drag.ox;
      n.fy = y + this.drag.oy;
      return;
    }

    if (this.pan.active) {
      const dx = e.clientX - this.pan.startX;
      const dy = e.clientY - this.pan.startY;

      this.setState({
        viewX: this.pan.originX + dx,
        viewY: this.pan.originY + dy,
      });
    }
  };

  onPointerUp = () => {
    const n = this.drag.node;
    if (n) {
      this.drag.node = null;
      this.setState({ isDragging: false });
      n.fx = null;
      n.fy = null;
      if (this.sim) this.sim.alphaTarget(0);
    }

    this.pan.active = false;
    this.setState({ isPanning: false });
  };

  render() {
    const {
      title,
      subjects,
      subject,
      onChangeSubject,
      onClickNode,
      showClose,
      onClose,
      fit,
      width,
    } = this.props;

    const { ready, svgW, svgH } = this.getLayout();
    const { isDragging, isPanning, viewX, viewY } = this.state;

    return (
      <div
        ref={this.rootRef}
        className={`kbm-wrap ${fit ? "kbm-fit" : ""}`}
        style={fit ? { width: "100%", height: "100%" } : { width }}
      >
        <div className="kbm-top">
          <div className="kbm-top-left">
            <div className="kbm-title">{title}</div>

            <Select
              className="kbm-subject-select"
              value={subject}
              placeholder="选择科目"
              size="small"
              options={subjects}
              onChange={(v) => onChangeSubject && onChangeSubject(v)}
              popupMatchSelectWidth={false}
              getPopupContainer={(trigger) => trigger.parentElement}
            />
          </div>

          {showClose ? (
            <button
              type="button"
              className="kbm-close"
              onClick={() => onClose && onClose()}
              aria-label="close"
            >
              ×
            </button>
          ) : null}
        </div>

        {ready ? (
          <svg
            ref={this.svgRef}
            className={`kbm-svg ${isDragging ? "is-dragging" : ""} ${isPanning ? "is-panning" : ""}`}
            width={svgW}
            height={svgH}
            onPointerDown={this.onPointerDown}
            onPointerMove={this.onPointerMove}
            onPointerUp={this.onPointerUp}
            onPointerCancel={this.onPointerUp}
          >
            <g transform={`translate(${viewX}, ${viewY})`}>
              <g className="kbm-links">
                {this.state.viewLinks.map((l, idx) => {
                  const s = typeof l.source === "object" ? l.source : null;
                  const t = typeof l.target === "object" ? l.target : null;
                  if (!s || !t) return null;

                  const p = getLineEndpoints(s, t);

                  return (
                    <line
                      key={`${s.id}-${t.id}-${idx}`}
                      className="kbm-link"
                      x1={p.x1}
                      y1={p.y1}
                      x2={p.x2}
                      y2={p.y2}
                    />
                  );
                })}
              </g>

              <g className="kbm-nodes">
                {this.state.viewNodes.map((n) => (
                  <Bubble
                    key={n.id}
                    node={n}
                    onClick={() => onClickNode && onClickNode(n)}
                  />
                ))}
              </g>
            </g>
          </svg>
        ) : (
          <div className="kbm-skeleton" />
        )}
      </div>
    );
  }
}

function Bubble({ node, onClick }) {
  const { id, name, accuracy, x, y, r, type } = node;
  const a = clamp01(accuracy);
  const level = a >= 0.8 ? "good" : a >= 0.6 ? "mid" : "bad";
  const fillH = 2 * r * a;
  const rectY = r - fillH;
  const clipId = `kbm_clip_${safeId(id)}`;
  const fontSize = type === "chapter" ? 13 : 12;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g
        className={`kbm-bubble ${type === "chapter" ? "is-chapter" : "is-knowledge"}`}
        onClick={onClick}
      >
        <circle
          className={`kbm-circle kbm-base--${level}`}
          cx={0}
          cy={0}
          r={r}
        />

        <clipPath id={clipId}>
          <circle cx={0} cy={0} r={r} />
        </clipPath>

        <rect
          className={`kbm-fill kbm-fill--${level}`}
          x={-r}
          y={rectY}
          width={2 * r}
          height={fillH}
          clipPath={`url(#${clipId})`}
        />

        <circle className="kbm-circle-stroke" cx={0} cy={0} r={r} />

        <text
          className="kbm-text"
          x={0}
          y={-4}
          textAnchor="middle"
          fontSize={fontSize}
        >
          {truncateText(name, 20)}
        </text>

        <text
          className="kbm-percent"
          x={0}
          y={14}
          textAnchor="middle"
          fontSize={11}
        >
          {Math.round(a * 100)}%
        </text>

        <title>{`${name}\n正确率：${Math.round(a * 100)}%`}</title>
      </g>
    </g>
  );
}

function getLineEndpoints(source, target) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  const ux = dx / len;
  const uy = dy / len;
  const gap = 2;

  return {
    x1: source.x + ux * (source.r + gap),
    y1: source.y + uy * (source.r + gap),
    x2: target.x - ux * (target.r + gap),
    y2: target.y - uy * (target.r + gap),
  };
}

function normalizeAccuracy(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return clamp01(n > 1 ? n / 100 : n);
}

function truncateText(text, maxLen = 6) {
  const s = String(text ?? "");
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function clamp01(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeId(s) {
  return String(s).replace(/[^a-zA-Z0-9_-]/g, "_");
}
