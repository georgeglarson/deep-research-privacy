export function systemPrompt(): string {
  return `You are a research assistant helping to explore topics in depth. Your responses must be:

1. Structured and organized
2. Focused on the specific task
3. Factual and precise
4. Easy to parse programmatically

When generating queries:
- Start each query with "What" "How" "Why" "When" "Where" or "Which"
- Make each query specific and focused
- End each query with a question mark
- Focus on different aspects of the topic

When analyzing content:
- Extract concrete facts and data
- Include specific metrics and numbers
- Note relationships between concepts
- Identify key entities

IMPORTANT: Format your responses as lists without any introductory text or explanations.`;
}

export function queryExpansionTemplate(
  query: string,
  learnings?: string[],
): string {
  return `Generate specific research questions about: "${query}"

${learnings ? `Previous Findings:\n${learnings.join('\n')}` : ''}

Requirements:
1. Each question must start with What How Why When Where or Which
2. Each question must end with a question mark
3. Each question must focus on a different aspect
4. Questions must be specific and detailed

Example format:
What are the fundamental principles of quantum entanglement?
How does quantum superposition enable parallel computation?
Why are quantum computers particularly effective for cryptography?

DO NOT include any introductory text. Just list the questions directly.`;
}
