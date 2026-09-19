import redis from "../configs/redis.js";
import generateCurriculumForRole from "../agents/curriculum.agent.js";
import personalizeRoadmap from "../agents/personalization.agent.js";
import { getCurriculumForRole } from "../data/curricula.js";
import Roadmap from "../models/roadmap.model.js";
import { buildRoadmap, updateTopicStatus } from "../services/roadmap-builder.service.js";

const toPlainObject = (roadmap) => roadmap?.toObject ? roadmap.toObject() : { ...roadmap };

const normalizeRoadmap = (roadmap) => {
  const plain = toPlainObject(roadmap);
  if (Array.isArray(plain.nodes) && plain.nodes.length) {
    delete plain.modules;
    return plain;
  }

  const modules = Array.isArray(plain.modules) ? plain.modules : [];
  const nodes = modules.map((module, index) => ({
    id: `legacy-topic-${index + 1}`,
    title: module.title,
    section: "Learning Path",
    difficulty: module.difficulty,
    duration: module.duration,
    description: module.description,
    prerequisites: index ? [`legacy-topic-${index}`] : [],
    resources: module.article ? [{ type: "article", title: "Read article", url: module.article }] : [],
    type: "required",
    status: index === 0 ? "available" : "locked",
    priority: false,
    aiReason: "",
  }));

  delete plain.modules;
  return {
    ...plain,
    templateSlug: "legacy-generated",
    templateVersion: 0,
    nodes,
    edges: nodes.slice(1).map((node, index) => ({
      id: `legacy-topic-${index + 1}-legacy-topic-${index + 2}`,
      source: `legacy-topic-${index + 1}`,
      target: node.id,
    })),
  };
};

export const generateRoadmap = async (req, res) => {
  try {
    const { role, targetPackage, useResume = false, resume } = req.body;
    const userId = req.headers["x-user-id"];

    if (!role || !targetPackage) {
      return res.status(400).json({ success: false, message: "Role and Target Package are required." });
    }
    if (useResume && !resume) {
      return res.status(400).json({ success: false, message: "Resume data is required." });
    }

    // Curated roadmaps remain deterministic. Other technical role titles receive a
    // separately generated curriculum, then use the same personalization and builder.
    const curriculum = getCurriculumForRole(role)
      || await generateCurriculumForRole({ role: role.trim(), targetPackage });

    const decisions = await personalizeRoadmap({ curriculum, role, targetPackage, useResume, resume });
    const generatedRoadmap = buildRoadmap({ curriculum, decisions, targetPackage, useResume, resume });
    const roadmap = await Roadmap.create({ userId, ...generatedRoadmap });
    const responseRoadmap = normalizeRoadmap(roadmap);

    await redis.set(`roadmap:${roadmap._id}`, JSON.stringify(responseRoadmap), "EX", 60 * 60);
    await redis.del(`userRoadmaps:${userId}`);

    return res.status(201).json({ success: true, message: "Roadmap generated successfully.", data: responseRoadmap });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRoadmap = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const cache = await redis.get(`userRoadmaps:${userId}`);
    if (cache) return res.status(200).json({ success: true, data: JSON.parse(cache) });

    const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
    const normalized = roadmaps.map(normalizeRoadmap);
    await redis.set(`userRoadmaps:${userId}`, JSON.stringify(normalized), "EX", 60 * 60);
    return res.json({ success: true, data: normalized });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoadmapbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];
    const cache = await redis.get(`roadmap:${id}`);
    if (cache) {
      const cachedRoadmap = JSON.parse(cache);
      if (String(cachedRoadmap.userId) === String(userId)) {
        return res.json({ success: true, fromCache: true, data: cachedRoadmap });
      }
    }

    const roadmap = await Roadmap.findOne({ _id: id, userId });
    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

    const normalized = normalizeRoadmap(roadmap);
    await redis.set(`roadmap:${id}`, JSON.stringify(normalized), "EX", 60 * 60);
    return res.json({ success: true, fromCache: false, data: normalized });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoadmapProgress = async (req, res) => {
  try {
    const { id, topicId } = req.params;
    const { status } = req.body;
    const userId = req.headers["x-user-id"];
    const roadmap = await Roadmap.findOne({ _id: id, userId });

    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });
    if (!roadmap.nodes.length) {
      return res.status(400).json({ success: false, message: "Progress tracking is unavailable for legacy roadmaps." });
    }

    roadmap.nodes = updateTopicStatus(roadmap.nodes.map((node) => node.toObject()), topicId, status);
    await roadmap.save();
    const normalized = normalizeRoadmap(roadmap);

    await redis.set(`roadmap:${id}`, JSON.stringify(normalized), "EX", 60 * 60);
    await redis.del(`userRoadmaps:${userId}`);
    return res.json({ success: true, message: "Progress updated.", data: normalized });
  } catch (error) {
    const statusCode = /not found|Invalid|prerequisites/i.test(error.message) ? 400 : 500;
    console.error(error);
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];
    const roadmap = await Roadmap.findOneAndDelete({ _id: id, userId });

    if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });

    await redis.del(`roadmap:${id}`);
    await redis.del(`userRoadmaps:${userId}`);
    return res.json({ success: true, message: "Roadmap deleted" });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};
