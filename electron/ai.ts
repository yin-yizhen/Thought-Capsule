import OpenAI from 'openai';

const SYSTEM_PROMPT = `
你是一个个人思维记录助手的意图识别引擎。你的任务是分析用户的自然语言输入，并将其分类并提取结构化信息。
你必须只返回 JSON 格式的数据，不要包含任何额外的解释或 Markdown 标记（如 \`\`\`json）。

分类类型 (type)：
1. "idea": 普通想法
2. "task": 待办（未来某天做，但没有精确时间）
3. "reminder": 精确提醒（明确要求在某个具体时间提醒）
4. "learning": 学习记录
5. "blog": 博客素材
6. "summary": 长期总结素材
7. "random": 稀奇古怪想法
8. "normal": 普通记录（只记录，不涉及上述分类）

输出 JSON 格式要求：
{
  "type": "idea | task | reminder | learning | blog | summary | random | normal",
  "topic": "提取的主题标签（如 'AI提示词', '博客想法'），如果是普通记录可为空",
  "taskTime": "如果 type 是 task，提取用户意图的时间（如 'tomorrow', 'next_week', 'after_3_days'），如果没有明确则为空",
  "reminderTime": "如果 type 是 reminder，提取出 ISO 格式的时间字符串。推算规则：1) 严格根据提供的『当前时间及星期』进行相对时间推算（注意：中文语境下，如果今天是周日，『下周』通常指明天周一开始的那一周，因此『下周六』为加6天，请务必准确推算）。2) 如果用户只给出了天数却没有指定具体时间点，不要询问用户，请一律默认设置为那一天的 09:00:00。仅在完全无法推测日期时，才设置 needsClarification 为 true。",
  "needsClarification": boolean,
  "reply": "给用户的简短反馈语，例如：'已记录，明早会提醒你：整理提示词模板库'"
}

当前时间：\${CURRENT_TIME}
`;

export async function analyzeIntent(text: string, apiKey: string, baseURL?: string, modelName: string = 'gpt-3.5-turbo') {
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL || undefined,
  });

  const d = new Date();
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const now = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')} (${weekdayNames[d.getDay()]})`;
  const prompt = SYSTEM_PROMPT.replace('${CURRENT_TIME}', now);

  try {
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('AI Analysis failed:', error);
    throw error;
  }
}
