import React from "react";
import {
  forceSimulation,
  forceCollide,
  forceX,
  forceY,
  forceManyBody,
} from "d3-force";
import { Select } from "antd";
import "./knowledge-bubble-map.css";

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
    this.sim = null;
    this.raf = 0;
    this.resizeObs = null;
    this.drag = { node: null, ox: 0, oy: 0 };

    const { width, height, fit } = props;
    this.state = {
      boxW: fit ? 0 : width,
      boxH: fit ? 0 : height,
      viewNodes: [],
      isDragging: false,
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
      this.setState({ viewNodes: [...this.nodes] });
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

  buildNodes(svgW, svgH) {
    const { data } = this.props;

    const minR = 20;
    const maxR = 64;
    const centerX = svgW / 2;
    const centerY = svgH / 2;

    const sizes = data.map((d) =>
      typeof d.size === "number" ? Math.max(d.size, 1) : 1,
    );
    const sMin = sizes.length ? Math.min(...sizes) : 1;
    const sMax = sizes.length ? Math.max(...sizes) : 1;

    const scaleR = (s) => {
      if (sMax === sMin) return (minR + maxR) / 2;
      const t = (s - sMin) / (sMax - sMin);
      return minR + t * (maxR - minR);
    };

    return data.map((d) => {
      const id = String(d.id);
      const name = String(d.name ?? "");
      const rawAcc = Number(d.accuracy);
      const acc01 = clamp01(
        Number.isFinite(rawAcc) ? (rawAcc > 1 ? rawAcc / 100 : rawAcc) : 0,
      );

      const size = typeof d.size === "number" ? Math.max(d.size, 1) : 1;
      const r = scaleR(size);

      const jx = (hash01(id) - 0.5) * 30;
      const jy = (hash01(id + "_y") - 0.5) * 30;

      return {
        id,
        name,
        accuracy: acc01,
        r,
        x: centerX + jx,
        y: centerY + jy,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
      };
    });
  }

  rebuildAndStart() {
    const { ready, svgW, svgH } = this.getLayout();

    if (this.props.fit && !ready) {
      this.stopSim();
      if (this.state.viewNodes.length) this.setState({ viewNodes: [] });
      return;
    }

    this.stopSim();

    this.nodes = this.buildNodes(svgW, svgH);
    this.setState({ viewNodes: [...this.nodes] });

    const centerX = svgW / 2;
    const centerY = svgH / 2;
    const padding = 4;

    const sim = forceSimulation(this.nodes)
      .force("x", forceX(centerX).strength(0.08))
      .force("y", forceY(centerY).strength(0.08))
      .force("collide", forceCollide((d) => d.r + padding).iterations(2))
      .force(
        "charge",
        forceManyBody().strength(-Math.max(18, Math.min(svgW, svgH) * 0.03)),
      )
      .alpha(1)
      .alphaDecay(0.03)
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
    return { x: p.x, y: p.y };
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
    if (!hit) return;

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

    e.currentTarget.setPointerCapture &&
      e.currentTarget.setPointerCapture(e.pointerId);
  };

  onPointerMove = (e) => {
    const n = this.drag.node;
    if (!n) return;
    const { x, y } = this.clientToSvg(e.clientX, e.clientY);
    n.fx = x + this.drag.ox;
    n.fy = y + this.drag.oy;
  };

  endDrag = () => {
    const n = this.drag.node;
    if (!n) return;
    this.drag.node = null;
    this.setState({ isDragging: false });
    n.fx = null;
    n.fy = null;
    if (this.sim) this.sim.alphaTarget(0);
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
            className={`kbm-svg ${this.state.isDragging ? "is-dragging" : ""}`}
            width={svgW}
            height={svgH}
            onPointerDown={this.onPointerDown}
            onPointerMove={this.onPointerMove}
            onPointerUp={this.endDrag}
            onPointerCancel={this.endDrag}
          >
            {this.state.viewNodes.map((n) => (
              <Bubble
                key={n.id}
                node={n}
                onClick={() => onClickNode && onClickNode(n)}
              />
            ))}
          </svg>
        ) : (
          <div className="kbm-skeleton" />
        )}
      </div>
    );
  }
}

function Bubble({ node, onClick }) {
  const { id, name, accuracy, x, y, r } = node;
  const a = clamp01(accuracy);
  const level = a >= 0.8 ? "good" : a >= 0.6 ? "mid" : "bad";
  const fillH = 2 * r * a;
  const rectY = r - fillH;
  const clipId = `kbm_clip_${safeId(id)}`;
  const fontSize = clamp(r * 0.28, 10, 18);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g className="kbm-bubble" onClick={onClick}>
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
          y={fontSize * 0.32}
          textAnchor="middle"
          fontSize={fontSize}
        >
          {name}
        </text>

        <title>{`${name}\n正确率：${Math.round(a * 100)}%`}</title>
      </g>
    </g>
  );
}

function clamp01(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function safeId(s) {
  return String(s).replace(/[^a-zA-Z0-9_-]/g, "_");
}
