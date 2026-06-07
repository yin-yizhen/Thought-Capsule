import { dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import { analyzeIntent } from './ai'; // Assuming we can use OpenAI client from here or just import OpenAI directly
import OpenAI from 'openai';

const WEEKLY_PROMPT = `你正在生成一篇每周复盘，不是在合并每日记日。

请根据这一周的每日记日、任务状态、长期总结更新记录，提炼出本周反复出现的主题、完成事项、未完成事项和值得保留的判断。

不要逐日罗列。
不要强行心理分析。
不要把琐事升华成深层动机。
如果本周记录较少，直接说明记录较少。
如果本周主要是提醒和普通记录，生成轻量复盘。
提醒类内容默认只作为事件，不作为长期想法。
学习心得、方法经验、判断标准应进入“本周反复出现的想法”或“本周值得注意”。
任务完成情况必须以后台任务状态为准，不要猜测。
输出 Markdown。
语气自然、克制、清晰。`;

export function getISOWeekData(date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

export function getWeekRange(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0,0,0,0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23,59,59,999);
  
  return { start, end };
}

function getDailyDiaries(obsidianPath: string, start: Date, end: Date) {
  if (!obsidianPath) return [];
  const diariesDir = path.join(obsidianPath, '每日日记');
  if (!fs.existsSync(diariesDir)) return [];
  
  const days = [];
  let curr = new Date(start);
  while (curr <= end) {
    days.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  
  const contents = [];
  for (const day of days) {
    const file = path.join(diariesDir, `${day}.md`);
    if (fs.existsSync(file)) {
      contents.push(`--- ${day} ---\n${fs.readFileSync(file, 'utf-8')}`);
    }
  }
  return contents;
}

export async function generateWeeklyReview(config: any, weekId: string, range: {start: Date, end: Date}, tasksStore: any, entriesStore: any) {
  const diaries = getDailyDiaries(config.obsidianPath, range.start, range.end);
  
  const tasks = tasksStore.getAll();
  const weekTasks = tasks.filter((t: any) => {
    const d = new Date(t.createdAt);
    return d >= range.start && d <= range.end;
  });
  
  const pendingTasks = weekTasks.filter((t: any) => t.status === 'pending' || t.status === 'delayed');
  const completedTasks = weekTasks.filter((t: any) => t.status === 'completed');
  const cancelledTasks = weekTasks.filter((t: any) => t.status === 'cancelled');

  const payload = {
    period_type: "weekly",
    week_id: weekId,
    start_date: range.start.toISOString().split('T')[0],
    end_date: range.end.toISOString().split('T')[0],
    daily_journals: diaries,
    tasks_completed: completedTasks.map((t: any) => t.originalText),
    tasks_pending: pendingTasks.map((t: any) => t.originalText),
    tasks_cancelled: cancelledTasks.map((t: any) => t.originalText),
  };

  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.apiBaseUrl || undefined,
  });

  const response = await openai.chat.completions.create({
    model: config.modelName || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: WEEKLY_PROMPT },
      { role: 'user', content: JSON.stringify(payload, null, 2) }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message?.content || '';
}
