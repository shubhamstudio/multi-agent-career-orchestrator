const validStatuses = new Set(["locked", "available", "in-progress", "completed"]);

const uniqueKnownIds = (values, validIds) =>
  [...new Set(Array.isArray(values) ? values : [])].filter((id) => validIds.has(id));

const assertAcyclic = (nodes) => {
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));

  for (const node of nodes) {
    for (const prerequisite of node.prerequisites) {
      if (!indegree.has(prerequisite)) throw new Error(`Unknown prerequisite '${prerequisite}' for '${node.id}'.`);
      indegree.set(node.id, indegree.get(node.id) + 1);
      outgoing.get(prerequisite).push(node.id);
    }
  }

  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift();
    visited += 1;
    for (const next of outgoing.get(id)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  if (visited !== nodes.length) throw new Error("Curriculum contains a dependency cycle.");
};

export const validateCurriculum = (curriculum) => {
  const ids = new Set();
  for (const node of curriculum.nodes) {
    if (!node.id || ids.has(node.id)) throw new Error(`Duplicate or missing topic id '${node.id}'.`);
    ids.add(node.id);
  }
  assertAcyclic(curriculum.nodes);
  return curriculum;
};

export const normalizeDecisions = (rawDecisions, curriculum) => {
  const validIds = new Set(curriculum.nodes.map((node) => node.id));
  const optionalIds = new Set(curriculum.nodes.filter((node) => node.type === "optional").map((node) => node.id));
  const decisions = rawDecisions && typeof rawDecisions === "object" ? rawDecisions : {};
  const topicReasons = decisions.topicReasons && typeof decisions.topicReasons === "object"
    ? Object.fromEntries(Object.entries(decisions.topicReasons).filter(([id, value]) => validIds.has(id) && typeof value === "string"))
    : {};

  return {
    knownTopicIds: uniqueKnownIds(decisions.knownTopicIds, validIds),
    priorityTopicIds: uniqueKnownIds(decisions.priorityTopicIds, validIds),
    optionalTopicIds: uniqueKnownIds(decisions.optionalTopicIds, optionalIds),
    estimatedWeeks: Number.isInteger(decisions.estimatedWeeks)
      ? Math.min(52, Math.max(4, decisions.estimatedWeeks))
      : curriculum.defaultWeeks,
    topicReasons,
  };
};

export const refreshAvailability = (nodes) => {
  const completed = new Set(nodes.filter((node) => node.status === "completed").map((node) => node.id));
  return nodes.map((node) => {
    if (node.status === "completed") return node;
    const unlocked = node.prerequisites.every((id) => completed.has(id));
    return { ...node, status: unlocked ? (node.status === "in-progress" ? "in-progress" : "available") : "locked" };
  });
};

const inferLevel = (useResume, resume) => {
  if (!useResume || !resume) return "Beginner";
  const skillCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
  const experienceCount = Array.isArray(resume.experience) ? resume.experience.length : 0;
  if (skillCount >= 10 || experienceCount >= 3 || Number(resume.score) >= 80) return "Advanced";
  return "Intermediate";
};

export const buildRoadmap = ({ curriculum, decisions, targetPackage, useResume, resume }) => {
  validateCurriculum(curriculum);
  const normalized = normalizeDecisions(decisions, curriculum);
  const known = new Set(normalized.knownTopicIds);
  const priority = new Set(normalized.priorityTopicIds);
  const optional = new Set(normalized.optionalTopicIds);

  let nodes = curriculum.nodes.map((node) => ({
    ...node,
    type: optional.has(node.id) ? "optional" : node.type,
    status: known.has(node.id) ? "completed" : "locked",
    priority: priority.has(node.id),
    aiReason: normalized.topicReasons[node.id] || "",
  }));
  nodes = refreshAvailability(nodes);

  const edges = nodes.flatMap((node) => node.prerequisites.map((source) => ({
    id: `${source}-${node.id}`,
    source,
    target: node.id,
  })));

  return {
    templateSlug: curriculum.slug,
    templateVersion: curriculum.version,
    title: curriculum.title,
    targetPackage,
    duration: `${normalized.estimatedWeeks} weeks`,
    level: inferLevel(useResume, resume),
    nodes,
    edges,
  };
};

export const updateTopicStatus = (nodes, topicId, status) => {
  if (!validStatuses.has(status) || status === "locked") throw new Error("Invalid progress status.");
  const topic = nodes.find((node) => node.id === topicId);
  if (!topic) throw new Error("Roadmap topic not found.");
  if (topic.status === "locked" && status !== "completed") throw new Error("Complete the prerequisites before starting this topic.");

  return refreshAvailability(nodes.map((node) => (node.id === topicId ? { ...node, status } : node)));
};
