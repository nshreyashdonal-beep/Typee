import { FINGER_COLORS } from "../data/fingerMap";

// Finger heights (in pixels) from pinky to index, used to draw each hand.
const FINGER_ORDER_LEFT = [
  { name: "pinky", height: 46, label: "left pinky" },
  { name: "ring", height: 62, label: "left ring" },
  { name: "middle", height: 74, label: "left middle" },
  { name: "index", height: 60, label: "left index" },
];
const FINGER_ORDER_RIGHT = [
  { name: "index", height: 60, label: "right index" },
  { name: "middle", height: 74, label: "right middle" },
  { name: "ring", height: 62, label: "right ring" },
  { name: "pinky", height: 46, label: "right pinky" },
];

// Draws one hand (left or right) as a simple labeled SVG illustration.
export default function GuideHand({ side }) {
  const order = side === "left" ? FINGER_ORDER_LEFT : FINGER_ORDER_RIGHT;

  const fingerWidth = 30;
  const gap = 14;
  const baseY = 140;
  const palmHeight = 60;
  const padding = 60;
  const totalFingersWidth = order.length * fingerWidth + (order.length - 1) * gap;
  const palmWidth = totalFingersWidth + 24;
  const startX = padding + 12;
  const palmX = padding;
  const thumbWidth = 44;
  const thumbHeight = 30;

  const svgWidth = palmX + palmWidth + thumbWidth + padding;
  const svgHeight = baseY + palmHeight + 50;

  const thumbColor = FINGER_COLORS["either thumb"];
  const thumbY = baseY + palmHeight - thumbHeight - 6;
  const thumbX = side === "left" ? palmX + palmWidth - 6 : palmX - thumbWidth + 6;
  const thumbLabelX = thumbX + thumbWidth / 2;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ overflow: "visible" }}
    >
      {/* palm */}
      <rect x={palmX} y={baseY} width={palmWidth} height={palmHeight} rx="18" fill="#3A3A32" />

      {/* thumb */}
      <rect x={thumbX} y={thumbY} width={thumbWidth} height={thumbHeight} rx="14" fill={thumbColor} />
      <text x={thumbLabelX} y={thumbY + thumbHeight + 18} textAnchor="middle" fontSize="12" fill="#8A8578">
        thumb
      </text>

      {/* fingers */}
      {order.map((f, i) => {
        const x = startX + i * (fingerWidth + gap);
        const y = baseY - f.height;
        const color = FINGER_COLORS[f.label];
        return (
          <g key={f.label}>
            <rect x={x} y={y} width={fingerWidth} height={f.height} rx="13" fill={color} />
            <text x={x + fingerWidth / 2} y={y - 10} textAnchor="middle" fontSize="12" fill="#8A8578">
              {f.name}
            </text>
          </g>
        );
      })}

      {/* hand label */}
      <text
        x={palmX + palmWidth / 2}
        y={baseY + palmHeight + 40}
        textAnchor="middle"
        fontSize="14"
        fill="#EAE6DD"
        fontWeight="600"
      >
        {side === "left" ? "Left hand" : "Right hand"}
      </text>
    </svg>
  );
}
