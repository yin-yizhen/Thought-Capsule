import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';

const REVIEW_PROMPT = `你是一个帮助用户复盘一天思维过程的 AI 助手。
这是用户今天的所有原始输入记录和任务状态：
{TODAY_DATA}

请根据今天的记录内容，选择适合的复盘模式并生成【今日思维日记】和【长期总结更新】。

### 复盘模式与结构：
1. **轻量记录模式**：如果当天记录大多是精确提醒、测试、生活琐事。
   - 不要强行升华深层心理动机，不要过度推断用户状态。
   - 日记结构应为：## 今天的记录概况、## 今天发生的事、## 今天触发的提醒（如果有）、## 今天沉淀到长期总结的内容（如果有）、## 值得注意。
2. **完整思维日记模式**：如果当天有丰富的想法、学习记录、判断或项目思路。
   - 深入分析并梳理思维过程。
   - 日记结构应为：## 今天的主要思考、## 重要想法、## 今天生成的待办（仅限长期待办 TASK）、## 今天完成的事、## 今天沉淀到长期总结的内容、## 值得继续看的内容。

### 核心分拣规则（非常重要）：
1. **长期总结的判断标准**：只要一条内容满足“以后可能复用、能指导之后怎么做、属于学习心得、方法经验、判断标准”，就**必须**进入长期总结（提取到 longTermUpdates，并在日记的“今天沉淀到长期总结的内容”中提及）。
2. **主题归类规则**：这是目前已经存在的长期总结主题列表：
【{EXISTING_TOPICS}】
请你**尽可能**将新提取的经验归入上述已有的主题中（即使字面不完全一样，只要领域一致就合并）。只有当新经验实在无法归入现有分类时，才创造一个**最宽泛、最通用**的新主题名（如“生活感悟”、“读书笔记”、“技术积累”），绝不能给每条记录都创建一个小分类！
3. **提醒与总结的界限**：“提醒”本身（如：一分钟后收衣服）不进长期总结。但是，从提醒中总结出的**使用方法或经验**（如：我发现一分钟提醒适合处理很小的拖延任务）属于方法经验，必须进入长期总结！
4. **不要一刀切**：即使今天大部分内容是轻量的提醒测试，只要其中混有一条有价值的学习点（如“提示词用英文效果更好”），就必须把这个学习点单独挑出来放进长期总结，绝不能因为当天是“轻量模式”就忽略它！

### 词汇规范：
- **提醒 (Reminder)**：带有明确时间的单次提醒（如“一分钟后提醒我收衣服”）。写入日记的“今天触发的提醒”中。
- **待办 (Task)**：没有具体时间、以后要做的长期待办（如“明天整理提示词模板库”）。写入日记的“今天生成的待办”中。
绝对不要把单次提醒写进“今天生成的待办”里！

请以 JSON 格式返回，不要包含任何额外的解释或 Markdown 标记（如 \`\`\`json），结构如下：
{
  "diaryContent": "这里是生成的日记 Markdown 文本",
  "longTermUpdates": [
    {
      "topic": "主题名",
      "content": "追加的 Markdown 文本内容（绝对不要包含日期标题，程序会自动添加，直接写列表内容即可）"
    }
  ]
}`;

export async function generateReviewDraft(entries: any[], tasks: any[], config: any) {
  if (!config.apiKey) {
    throw new Error('API Key not configured');
  }

  // Get existing topics
  let existingTopicsStr = '目前还没有任何长期总结。';
  if (config.obsidianPath) {
    const parentDir = config.parentFolderName || '提示助手';
    const summaryDirName = config.summaryFolderName || '长期总结';
    const summaryDir = path.join(config.obsidianPath, parentDir, summaryDirName);
    if (fs.existsSync(summaryDir)) {
      const files = fs.readdirSync(summaryDir).filter(f => f.endsWith('.md'));
      if (files.length > 0) {
        existingTopicsStr = files.map(f => f.replace('.md', '')).join('、');
      }
    }
  }

  const todayData = JSON.stringify({ entries, tasks });
  let systemPrompt = REVIEW_PROMPT;
  if (config.customReviewPrompt && config.customReviewPrompt.trim()) {
    systemPrompt = config.customReviewPrompt + `\n\n请严格以 JSON 格式返回，结构同默认要求：\n{ "diaryContent": "...", "longTermUpdates": [{"topic": "...", "content": "..."}] }`;
  }
  const prompt = systemPrompt.replace('{TODAY_DATA}', todayData).replace('{EXISTING_TOPICS}', existingTopicsStr);

  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.apiBaseUrl || undefined,
  });

  const response = await openai.chat.completions.create({
    model: config.modelName || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('AI returned empty');

  const result = JSON.parse(content);

  if (entries && entries.length > 0) {
    let rawLog = '\n\n## 今日原始记录\n\n';
    for (const entry of entries) {
      const time = new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const typeLabel = entry.aiResult?.type || 'normal';
      rawLog += `- **[${time}]** \`${typeLabel}\` ${entry.text}\n`;
      if (entry.aiResult?.feedback) {
        // Some feedback might contain multiple lines, replace newline with blockquote newline
        const safeFeedback = entry.aiResult.feedback.replace(/\n/g, '\n  > ');
        rawLog += `  > ${safeFeedback}\n`;
      }
    }
    result.diaryContent += rawLog;
  }

  return result;
}

export async function saveReview(result: any, config: any) {
  if (!config.obsidianPath) {
    throw new Error('Obsidian Path not configured');
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const parentDir = config.parentFolderName || '提示助手';
  const diaryDirName = config.diaryFolderName || '每日日记';
  const summaryDirName = config.summaryFolderName || '长期总结';
  
  const diaryDir = path.join(config.obsidianPath, parentDir, diaryDirName);
  const summaryDir = path.join(config.obsidianPath, parentDir, summaryDirName);

  if (!fs.existsSync(diaryDir)) fs.mkdirSync(diaryDir, { recursive: true });
  if (!fs.existsSync(summaryDir)) fs.mkdirSync(summaryDir, { recursive: true });

  const diaryPath = path.join(diaryDir, `${dateStr}.md`);
  if (!fs.existsSync(diaryPath)) {
    fs.writeFileSync(diaryPath, `# ${dateStr} 思维日记\n\n`);
  }
  fs.appendFileSync(diaryPath, result.diaryContent + '\n');

  if (result.longTermUpdates && result.longTermUpdates.length > 0) {
    for (const update of result.longTermUpdates) {
      const safeTopic = update.topic.replace(/[<>:"/\\|?*]/g, '_');
      const summaryPath = path.join(summaryDir, `${safeTopic}.md`);
      if (!fs.existsSync(summaryPath)) {
        fs.writeFileSync(summaryPath, `# ${update.topic}\n\n`);
      }
      fs.appendFileSync(summaryPath, '\n\n### ' + dateStr + '\n' + update.content + '\n');
    }
  }

  return true;
}

export function isReviewDoneToday(config: any, targetDateStr?: string): boolean {
  if (!config.obsidianPath) return false;
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
  const parentDir = config.parentFolderName || '提示助手';
  const diaryDir = config.diaryFolderName || '每日日记';
  const diaryPath = path.join(config.obsidianPath, parentDir, diaryDir, `${dateStr}.md`);
  return fs.existsSync(diaryPath);
}
