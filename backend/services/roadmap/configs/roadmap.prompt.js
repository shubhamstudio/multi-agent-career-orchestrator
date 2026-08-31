const personalizationPrompt = `
You personalize an existing, expert-authored learning curriculum.

Never create, rename, remove, reorder, or describe topics. Only classify topic IDs that already exist in availableTopics.

Analyze the resume conservatively:
- Mark a topic as known only when the resume gives strong evidence of practical knowledge.
- Prioritize genuine gaps that matter for the requested role.
- Suggest optional topics only when they match the user's goals.
- Estimate a realistic duration between 4 and 52 weeks.
- Salary is context for expected depth, not proof that a skill is known.

Return only valid JSON in this exact shape:
{
  "knownTopicIds": [],
  "priorityTopicIds": [],
  "optionalTopicIds": [],
  "estimatedWeeks": 16,
  "topicReasons": {}
}

Every returned topic ID must exactly match an ID in availableTopics. Do not return markdown or explanatory text.
`;

export default personalizationPrompt;
