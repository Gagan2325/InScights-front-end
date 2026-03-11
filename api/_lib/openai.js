const OpenAI = require('openai');
const { buildSystemPrompt, buildGenerationPrompt } = require('./prompts');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateContent(brief) {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildGenerationPrompt(brief);

  let rawContent = '';

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    rawContent = completion.choices[0]?.message?.content || '';

    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.pairs || !Array.isArray(parsed.pairs)) {
      throw new Error('Invalid response structure: missing pairs array');
    }

    return parsed;

  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('AI returned malformed content. Please try again.');
    }
    throw err;
  }
}

module.exports = { generateContent };
