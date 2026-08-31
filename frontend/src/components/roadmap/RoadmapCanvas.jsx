import { useEffect, useMemo, useRef, useState } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { FiCheck, FiLock, FiPlay, FiStar } from "react-icons/fi";
import "@xyflow/react/dist/style.css";

const elk = new ELK();
const NODE_WIDTH = 220;
const NODE_HEIGHT = 94;

const statusTheme = {
  locked: { border: "#e2ddd8", background: "#f7f4f1", color: "#9a938e" },
  available: { border: "#d8f45f", background: "#ffffff", color: "#708900" },
  "in-progress": { border: "#d2ff00", background: "#f6ffd9", color: "#536800" },
  completed: { border: "#71d4a8", background: "#effcf6", color: "#23825d" },
};

function TopicNode({ data }) {
  const theme = statusTheme[data.status] || statusTheme.locked;
  const StatusIcon = data.status === "completed" ? FiCheck : data.status === "locked" ? FiLock : FiPlay;

  return (
    <div
      title="Click to open this module"
      className={`relative h-[94px] w-[220px] cursor-pointer rounded-2xl border bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(44,33,27,.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(210,255,0,.13)] ${data.type === "optional" ? "border-dashed" : ""}`}
      style={{ borderColor: theme.border, background: theme.background }}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-2 !border-white !bg-[#b9d700]" />
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#8b8581]">{data.section}</span>
        <div className="flex shrink-0 items-center gap-1">
          {data.priority && <FiStar size={10} className="fill-[#d2ff00] text-[#819e00]" />}
          <span className="grid h-5 w-5 place-items-center rounded-full border border-current/15 bg-white/70" style={{ color: theme.color }}>
            <StatusIcon size={11} />
          </span>
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-4 text-[#171514]">{data.title}</p>
      <div className="mt-1.5 flex items-center justify-between text-[9px]">
        <span style={{ color: theme.color }}>{data.status.replace("-", " ")}</span>
        <span className="text-[#9a938e]">{data.duration}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-2 !border-white !bg-[#b9d700]" />
    </div>
  );
}

const nodeTypes = { topic: TopicNode };

const layoutElements = async (topics, roadmapEdges) => {
  const graph = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.spacing.nodeNode": "48",
      "elk.layered.spacing.nodeNodeBetweenLayers": "72",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    },
    children: topics.map((topic) => ({ id: topic.id, width: NODE_WIDTH, height: NODE_HEIGHT })),
    edges: roadmapEdges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  });

  const positions = new Map((graph.children || []).map((node) => [node.id, { x: node.x, y: node.y }]));
  return {
    nodes: topics.map((topic) => ({
      id: topic.id,
      type: "topic",
      position: positions.get(topic.id) || { x: 0, y: 0 },
      data: topic,
      draggable: false,
      selectable: true,
    })),
    edges: roadmapEdges.map((edge) => ({
      ...edge,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#c8d58b", strokeWidth: 1.5 },
    })),
  };
};

function LayoutCanvas({ topics, roadmapEdges, onSelect }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [layouting, setLayouting] = useState(true);
  const { fitView } = useReactFlow();
  const graphKey = useMemo(
    () => `${topics.map(({ id }) => id).join("|")}:${roadmapEdges.map(({ source, target }) => `${source}>${target}`).join("|")}`,
    [topics, roadmapEdges],
  );
  const laidOutKey = useRef("");

  useEffect(() => {
    let active = true;
    if (laidOutKey.current === graphKey) {
      setNodes((current) => current.map((node) => ({
        ...node,
        data: topics.find((topic) => topic.id === node.id) || node.data,
      })));
      return () => { active = false; };
    }

    setLayouting(true);
    layoutElements(topics, roadmapEdges).then((layout) => {
      if (!active) return;
      laidOutKey.current = graphKey;
      setNodes(layout.nodes);
      setEdges(layout.edges);
      setLayouting(false);
      requestAnimationFrame(() => fitView({ padding: 0.16, duration: 450 }));
    }).catch((error) => {
      console.error("Roadmap layout failed", error);
      if (active) setLayouting(false);
    });

    return () => { active = false; };
  }, [fitView, graphKey, roadmapEdges, topics]);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-[#ebe6e1] bg-[#fbfaf8] sm:h-[580px]">
      {layouting && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 text-xs text-[#819e00] backdrop-blur-sm">
          Arranging your roadmap…
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect(node.id)}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        fitView
        minZoom={0.35}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e7e1dc" gap={22} size={1} />
        <Controls position="bottom-right" showInteractive={false} className="!overflow-hidden !rounded-xl !border-[#ebe6e1] !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

export default function RoadmapCanvas(props) {
  return (
    <ReactFlowProvider>
      <LayoutCanvas {...props} />
    </ReactFlowProvider>
  );
}
