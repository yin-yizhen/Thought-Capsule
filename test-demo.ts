import fs from 'fs';
import path from 'path';
import { generateReviewDraft } from './electron/review.js';
import { generateWeeklyReview } from './electron/weekly-review.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 提取真实的配置
const config = {
  obsidianPath: path.join(__dirname, 'mock-obsidian'), // 使用临时目录防止污染真实数据
  apiKey: "gg-gcli-1s4-eDPkums67mAkSIDjpNqvWPHFZdfVnpj8TVICsuw",
  apiBaseUrl: "https://gcli.ggchan.dev/v1",
  modelName: "gemini-3-flash-preview",
  parentFolderName: '思维胶囊测试',
  diaryFolderName: '每日日记',
  summaryFolderName: '长期总结',
  customReviewPrompt: ''
};

// 构造连续 7 天的日期
const dates = [];
const today = new Date();
today.setHours(12, 0, 0, 0);
for (let i = 6; i >= 0; i--) {
  const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
  dates.push(d);
}

// 模拟七天的数据
const mockDays = [
  { // Day 1
    entries: [
      { text: "React的useEffect依赖项老是引发无限循环，今天学到了，如果是引用类型，要么放到外部，要么用useMemo包裹一下。", aiResult: { type: "learning", feedback: "已记录你的前端开发心得。" }, timestamp: dates[0].getTime() },
      { text: "下午3点提醒我买猫粮", aiResult: { type: "reminder", feedback: "好的，今天 15:00 提醒你买猫粮。" }, timestamp: dates[0].getTime() + 1000 },
      { text: "明天整理一下之前收藏的AI论文", aiResult: { type: "task", feedback: "已加入待办：整理AI论文。" }, timestamp: dates[0].getTime() + 2000 },
      { text: "一个好点子：思维胶囊能不能加入语音输入功能？", aiResult: { type: "idea", feedback: "已记录你的产品灵感。" }, timestamp: dates[0].getTime() + 3000 }
    ],
    tasks: [
      { id: "t1", originalText: "明天整理一下之前收藏的AI论文", status: "pending", createdAt: dates[0].getTime() }
    ]
  },
  { // Day 2
    entries: [
      { text: "看了《软技能》第一章，觉得程序员确实不能只懂写代码，营销自己也很重要。", aiResult: { type: "learning", feedback: "已记录读书感悟。" }, timestamp: dates[1].getTime() },
      { text: "突然想到可以用 Tauri 替代 Electron，打包体积会小很多，有空研究下。", aiResult: { type: "idea", feedback: "好主意，已记录技术灵感。" }, timestamp: dates[1].getTime() + 1000 },
      { text: "下班去拿快递", aiResult: { type: "task", feedback: "已加入待办。" }, timestamp: dates[1].getTime() + 2000 }
    ],
    tasks: [
      { id: "t1", originalText: "整理一下之前收藏的AI论文", status: "completed", createdAt: dates[0].getTime() },
      { id: "t2", originalText: "下班去拿快递", status: "pending", createdAt: dates[1].getTime() }
    ]
  },
  { // Day 3
    entries: [
      { text: "测试一下提醒：10秒后提醒我喝水", aiResult: { type: "reminder", feedback: "10秒后提醒你喝水。" }, timestamp: dates[2].getTime() },
      { text: "深色模式的配色方案用纯黑不好看，用稍微偏蓝灰的 #1e1e2e 会更有质感。", aiResult: { type: "learning", feedback: "已记录设计心得。" }, timestamp: dates[2].getTime() + 1000 },
      { text: "好累，不想干活了", aiResult: { type: "random", feedback: "休息一下吧！" }, timestamp: dates[2].getTime() + 2000 }
    ],
    tasks: [
      { id: "t2", originalText: "下班去拿快递", status: "completed", createdAt: dates[1].getTime() }
    ]
  },
  { // Day 4
    entries: [
      { text: "读完了关于 RAG 架构的文章，原来分块(chunking)策略对召回率影响这么大，按照语义分块比按字数分块靠谱多了。", aiResult: { type: "learning", feedback: "已记录 RAG 技术学习笔记。" }, timestamp: dates[3].getTime() },
      { text: "周五把本周的周报写了", aiResult: { type: "task", feedback: "已记录周报待办。" }, timestamp: dates[3].getTime() + 1000 },
      { text: "晚上8点提醒我给家里打个电话", aiResult: { type: "reminder", feedback: "今晚 20:00 提醒你打电话。" }, timestamp: dates[3].getTime() + 2000 }
    ],
    tasks: [
      { id: "t3", originalText: "周五把本周的周报写了", status: "pending", createdAt: dates[3].getTime() }
    ]
  },
  { // Day 5
    entries: [
      { text: "发现一个 VSCode 快捷键，Ctrl+D 可以多选相同的词，太方便了。", aiResult: { type: "learning", feedback: "已记录工具技巧。" }, timestamp: dates[4].getTime() },
      { text: "终于把思维胶囊的本地存储逻辑改完了，真不容易。", aiResult: { type: "normal", feedback: "辛苦了！" }, timestamp: dates[4].getTime() + 1000 },
      { text: "周末想去爬山", aiResult: { type: "idea", feedback: "已记录周末出游想法。" }, timestamp: dates[4].getTime() + 2000 }
    ],
    tasks: [
      { id: "t3", originalText: "把本周的周报写了", status: "completed", createdAt: dates[3].getTime() }
    ]
  },
  { // Day 6
    entries: [
      { text: "今天看了些心理学的书，讲到‘延迟满足’，实际上是为了更大的目标放弃眼前的诱惑，这不是一种苦行，而是一种高级的自我投资。", aiResult: { type: "learning", feedback: "非常有深度的心理学思考，已记录。" }, timestamp: dates[5].getTime() },
      { text: "买点水果", aiResult: { type: "task", feedback: "已记入待办：买水果。" }, timestamp: dates[5].getTime() + 1000 }
    ],
    tasks: [
      { id: "t4", originalText: "买点水果", status: "pending", createdAt: dates[5].getTime() }
    ]
  },
  { // Day 7
    entries: [
      { text: "整理一下这周的思路，感觉这周学到了不少东西。", aiResult: { type: "normal", feedback: "周末愉快，是时候复盘了。" }, timestamp: dates[6].getTime() },
      { text: "下午4点提醒我洗衣服", aiResult: { type: "reminder", feedback: "16:00 提醒你洗衣服。" }, timestamp: dates[6].getTime() + 1000 },
      { text: "给项目加个新的炫酷动画效果", aiResult: { type: "idea", feedback: "已记录新特性想法。" }, timestamp: dates[6].getTime() + 2000 }
    ],
    tasks: [
      { id: "t4", originalText: "买点水果", status: "completed", createdAt: dates[5].getTime() }
    ]
  }
];

// 自定义保存函数（支持指定日期，防止全部挤在同一天）
function mockSaveReview(result, config, dateStr) {
  const parentDir = config.parentFolderName;
  const diaryDirName = config.diaryFolderName;
  const summaryDirName = config.summaryFolderName;
  
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
}

async function runTest() {
  console.log('🚀 开始模拟测试...');
  
  // 1. 生成每日复盘
  for (let i = 0; i < mockDays.length; i++) {
    const dateStr = dates[i].toISOString().split('T')[0];
    console.log(`\n⏳ 正在生成 ${dateStr} 的每日复盘 (${i+1}/7)...`);
    const dayData = mockDays[i];
    
    try {
      const result = await generateReviewDraft(dayData.entries, dayData.tasks, config);
      mockSaveReview(result, config, dateStr);
      console.log(`✅ ${dateStr} 每日复盘生成并保存成功！提取了 ${result.longTermUpdates?.length || 0} 条长期总结。`);
    } catch (err) {
      console.error(`❌ ${dateStr} 生成失败:`, err);
    }
  }

  // 2. 汇总生成每周复盘
  console.log('\n⏳ 正在生成每周复盘...');
  
  // mock tasks store
  let allTasks = [];
  mockDays.forEach(d => allTasks.push(...d.tasks));
  // deduplicate tasks by id for the final store
  const uniqueTasks = Array.from(new Map(allTasks.map(item => [item.id, item])).values());
  
  const mockTasksStore = { getAll: () => uniqueTasks };
  const mockEntriesStore = { getAll: () => [] };
  
  const range = { start: dates[0], end: dates[6] };
  try {
    const weeklyResult = await generateWeeklyReview(config, 'mock-week-1', range, mockTasksStore, mockEntriesStore);
    
    const weekDir = path.join(config.obsidianPath, config.parentFolderName, '每周复盘');
    if (!fs.existsSync(weekDir)) fs.mkdirSync(weekDir, { recursive: true });
    fs.writeFileSync(path.join(weekDir, `Week-Review-${range.start.toISOString().split('T')[0]}.md`), weeklyResult);
    
    console.log('✅ 每周复盘生成成功！');
    console.log('\n🎉 测试完成！请查看 mock-obsidian 文件夹下的结果。');
  } catch(err) {
    console.error('❌ 每周复盘生成失败:', err);
  }
}

runTest();
