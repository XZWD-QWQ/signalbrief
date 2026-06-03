(() => {
  const languageToggle = document.querySelector('#languageToggle');
  if (!languageToggle) return;

  const ui = {
    en: {
      prototypeLabel: 'World Product Day prototype', statusFeedback: 'Feedback', statusSignals: 'Signals', statusBrief: 'Brief', inputEyebrow: 'Input', inputTitle: 'Paste messy feedback', sampleSaas: 'SaaS onboarding', sampleReviews: 'App reviews', sampleSupport: 'Support tickets', loadSample: 'Load sample', feedbackLabel: 'User interviews, support notes, reviews, survey comments, or sales call fragments', productAreaLabel: 'Product area', targetUserLabel: 'Target user', generateBrief: 'Generate brief', outputEyebrow: 'Output', outputTitle: 'Product decision brief', copyAll: 'Copy all', emptyText: 'Generate a brief to see pain points, opportunities, MVP priorities, and user stories.', copyBrief: 'Copy brief', copyRoadmap: 'Copy roadmap', copyStories: 'Copy stories', downloadMd: 'Download .md', tabSummary: 'Summary', tabEvidence: 'Evidence', tabRoadmap: 'Roadmap', tabBrief: 'Brief', decisionSummary: 'Decision summary', painClusters: 'Pain point clusters', opportunityAreas: 'Opportunity areas', ranked: 'Ranked', mvpPriorities: 'MVP priorities', nowNextLater: 'Now / Next / Later', userStories: 'User stories', readyToRefine: 'Ready to refine', onePageBrief: 'One-page product brief', draft: 'Draft', briefNoteTitle: 'Use this brief as a draft.', briefNoteText: 'Validate the top opportunity with users before turning it into roadmap work.', languageButton: '中文'
    },
    zh: {
      prototypeLabel: '世界产品日原型', statusFeedback: '反馈', statusSignals: '信号', statusBrief: '简报', inputEyebrow: '输入', inputTitle: '粘贴杂乱反馈', sampleSaas: 'SaaS 引导反馈', sampleReviews: '应用评论', sampleSupport: '客服工单', loadSample: '载入样例', feedbackLabel: '用户访谈、客服记录、评论、问卷反馈或销售通话片段', productAreaLabel: '产品领域', targetUserLabel: '目标用户', generateBrief: '生成简报', outputEyebrow: '输出', outputTitle: '产品决策简报', copyAll: '复制全部', emptyText: '生成简报后，你会看到痛点聚类、机会点、MVP 优先级和用户故事。', copyBrief: '复制简报', copyRoadmap: '复制路线图', copyStories: '复制用户故事', downloadMd: '下载 .md', tabSummary: '摘要', tabEvidence: '证据', tabRoadmap: '路线图', tabBrief: '简报', decisionSummary: '决策摘要', painClusters: '痛点聚类', opportunityAreas: '机会点', ranked: '已排序', mvpPriorities: 'MVP 优先级', nowNextLater: '现在 / 下一步 / 以后', userStories: '用户故事', readyToRefine: '可继续细化', onePageBrief: '一页产品简报', draft: '草稿', briefNoteTitle: '把这份简报当作初稿使用。', briefNoteText: '在进入路线图之前，先用真实用户验证最高优先级的机会点。', languageButton: 'English'
    }
  };

  const zhSamples = {
    saas: {
      product: '早期产品反馈',
      audience: '产品经理、创业者和小团队',
      feedback: `用户访谈 1：我会从客服、应用评论和销售电话里收到很多用户反馈，但开完会之后不知道该怎么处理这些信息。\n\n客服工单：用户一直希望有更清晰的新手引导。他们说仪表盘功能很强，但不知道第一步应该做什么。\n\n应用评论：我喜欢这个产品，但希望它解释为什么推荐某个功能。建议看起来有用，但有点随机。\n\n销售记录：小团队想要一种简单方法，把反馈变成路线图，而不是花很多时间整理表格。\n\n问卷回复：最大的问题是优先级。所有事情看起来都很重要，所以团队经常在争论观点，而不是看证据。\n\n创始人笔记：我想要一页可以分享给团队的总结，里面要有主题、痛点和下一步应该做什么。\n\n客户电话：请让导出洞察更简单。我需要把总结粘贴到 Notion、文档或每周产品更新里。\n\nPM 笔记：团队不需要一个完美的研究资料库。我们需要一种快速方法，把原始笔记变成决策。`
    },
    reviews: {
      product: '移动应用评论分析',
      audience: '消费类应用产品团队',
      feedback: `应用评论：这个应用看起来很干净，但注册之后我找不到在哪里修改套餐。\n\n应用评论：通知挺有用，但数量太多了，我希望能有更多控制权。\n\n应用评论：我喜欢每周总结，但如果能分享给我的教练就更好了。\n\n应用评论：登录后的第一个页面有点困惑。我不知道应该先记录习惯、阅读洞察，还是邀请朋友。\n\n问卷记录：用户说，当应用解释推荐背后的数据时，他们会更信任这些建议。\n\n客服记录：有几个用户想要导出功能，因为他们想把结果保存到自己的笔记软件里。\n\n产品笔记：当用户一次性完成首次设置流程时，留存看起来最好。`
    },
    support: {
      product: '客服工单分诊',
      audience: '客户成功和产品团队',
      feedback: `客服工单：客户一直在问为什么导入失败，但错误提示只说“出了点问题”。\n\n客服工单：管理员想看到哪些队友还没有完成设置。\n\n客户电话：仪表盘里有需要的数据，但要点太多次才能找到账号健康视图。\n\n客服工单：用户经常问能不能导出 CSV，用于每月汇报。\n\nCSM 记录：高价值客户想更快了解采用情况、使用缺口和续约风险。\n\n客服工单：帮助文档很详细，但用户希望产品能先主动引导，而不是让他们自己搜索文档。\n\n产品笔记：我们需要更好的方法，把反复出现的工单变成路线图候选项。`
    }
  };

  const zhPatterns = {
    prioritization: { label: '优先级不清晰', terms: ['优先级', '路线图', '决策', '重要', '证据', '争论', '候选'], opportunity: '帮助团队把杂乱反馈转化为带有证据依据的机会排序。', mvp: '基于证据的优先级排序', story: '作为产品建设者，我希望按紧急程度和证据强度排序反馈主题，这样我能更有信心地选择下一个 MVP 方向。', experiment: '让三位产品建设者分析同一组反馈，比较 SignalBrief 是否能帮助他们收敛到相同的最高优先级。' },
    clarity: { label: '缺少清晰解释', terms: ['清晰', '困惑', '解释', '随机', '为什么', '不知道', '引导', '错误', '指导'], opportunity: '让下一步行动更明确，并解释每条建议为什么重要。', mvp: '用简单语言解释每条洞察', story: '作为用户，我希望每条推荐都用简单语言解释，这样我能理解下一步该做什么。', experiment: '让用户阅读生成的解释，并判断他们是否信任这条推荐。' },
    fragmentation: { label: '反馈来源分散', terms: ['客服', '评论', '销售', '问卷', '反馈', '电话', '笔记', '表格', '工单', '导入', '多来源'], opportunity: '创建一个轻量入口，把多来源反馈转化为结构化产品信号。', mvp: '任意内容粘贴式反馈入口', story: '作为创造者，我希望能把多个来源的笔记粘贴到同一个流程里，这样不用手动清洗也能发现模式。', experiment: '测试用户能否粘贴五类混合来源，并在无需额外设置的情况下理解生成的聚类。' },
    sharing: { label: '决策难以分享', terms: ['分享', '总结', '导出', '文档', '每周', '团队', '一页', '汇报'], opportunity: '把分析结果变成可以分享给团队和利益相关方的简洁简报。', mvp: '一页简报和 Markdown 导出', story: '作为产品经理，我希望得到一份可以分享给团队的简洁产品简报，让反馈真正变成决策材料。', experiment: '把导出的简报发给队友，观察他能否在一分钟内讲清楚最高优先级的机会点。' },
    speed: { label: '手动流程太慢', terms: ['很多时间', '快速', '手动', '资料库', '原始笔记', '流程', '点击', '更快'], opportunity: '缩短从收集反馈到做出产品决策之间的时间。', mvp: '一键从反馈生成简报', story: '作为创始人，我希望从原始笔记快速得到初稿，这样我能把更多时间用在判断决策，而不是整理格式。', experiment: '分别记录用户使用和不使用 SignalBrief 时，从原始笔记到可分享简报需要多长时间。' }
  };

  const originalPatternText = new Map(patterns.map((pattern) => [pattern.key, {
    label: pattern.label,
    terms: [...pattern.terms],
    opportunity: pattern.opportunity,
    mvp: pattern.mvp,
    story: pattern.story,
    experiment: pattern.experiment
  }]));

  const originalLoadSelectedSample = loadSelectedSample;
  const originalAnalyzeFeedback = analyzeFeedback;
  const originalRenderMetrics = renderMetrics;
  const originalRenderOpportunities = renderOpportunities;
  const originalRenderProductBrief = renderProductBrief;
  const originalToMarkdown = toMarkdown;
  const originalToBriefMarkdown = toBriefMarkdown;
  const originalToRoadmapMarkdown = toRoadmapMarkdown;
  const originalToStoriesMarkdown = toStoriesMarkdown;
  const originalSetGenerating = setGenerating;

  let language = localStorage.getItem('signalbrief-language') || 'en';

  function label(key) {
    return ui[language][key] || ui.en[key] || key;
  }

  function applyStaticText() {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = label(element.dataset.i18n);
    });
    languageToggle.textContent = label('languageButton');
    generateBrief.textContent = generateBrief.disabled ? (language === 'zh' ? '分析中...' : 'Analyzing...') : label('generateBrief');
  }

  function applyPatternLanguage() {
    patterns.forEach((pattern) => {
      const original = originalPatternText.get(pattern.key);
      if (!original) return;
      Object.assign(pattern, original);
      pattern.terms = [...original.terms];
      if (language === 'zh' && zhPatterns[pattern.key]) {
        const zh = zhPatterns[pattern.key];
        pattern.label = zh.label;
        pattern.terms = [...original.terms, ...zh.terms];
        pattern.opportunity = zh.opportunity;
        pattern.mvp = zh.mvp;
        pattern.story = zh.story;
        pattern.experiment = zh.experiment;
      }
    });
  }

  function zhConfidence(value) {
    if (value === 'High') return '高';
    if (value === 'Medium') return '中等';
    if (value === 'Directional') return '方向性';
    return value;
  }

  loadSelectedSample = function localizedLoadSelectedSample() {
    if (language !== 'zh') {
      originalLoadSelectedSample();
      return;
    }
    const sample = zhSamples[sampleSelect.value] || zhSamples.saas;
    input.value = sample.feedback;
    productArea.value = sample.product;
    targetUser.value = sample.audience;
  };

  analyzeFeedback = function localizedAnalyzeFeedback(raw, product, audience) {
    applyPatternLanguage();
    const analysis = originalAnalyzeFeedback(raw, product, audience);
    if (language !== 'zh') return analysis;

    analysis.clusters.forEach((cluster) => { cluster.confidence = zhConfidence(cluster.confidence); });
    analysis.opportunities.forEach((item) => { item.confidence = zhConfidence(item.confidence); });
    analysis.overallConfidence = zhConfidence(analysis.overallConfidence);
    const mainTheme = analysis.clusters[0]?.label || '反馈清晰度';
    const secondaryTheme = analysis.clusters[1]?.label || '决策支持';
    analysis.summaryTitle = `${mainTheme}是最强信号`;
    analysis.summaryText = `这些反馈说明，${audience || '目标用户'}需要一种更快的方法，把原始反馈转化为产品决策。最适合的 MVP 方向是把${mainTheme}和${secondaryTheme}结合起来，并输出成一份可以分享的一页简报。`;
    analysis.nextExperiment = analysis.opportunities[0]?.experiment || '和三位目标用户做一次简短可用性测试。';
    return analysis;
  };

  renderMetrics = function localizedRenderMetrics(analysis) {
    if (language !== 'zh') {
      originalRenderMetrics(analysis);
      return;
    }
    const metrics = [['来源', analysis.snippetCount], ['词数', analysis.wordCount], ['信号', analysis.clusters.length], ['置信度', analysis.overallConfidence]];
    document.querySelector('#metricRow').innerHTML = metrics.map(([name, value]) => `<div class="metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(name)}</span></div>`).join('');
  };

  renderOpportunities = function localizedRenderOpportunities(opportunities) {
    if (language !== 'zh') {
      originalRenderOpportunities(opportunities);
      return;
    }
    document.querySelector('#opportunityList').innerHTML = opportunities.map((item, index) => `
      <article class="opportunity-item">
        <span class="rank">${index + 1}</span>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.why)}</p>
          <p class="experiment"><span>验证实验:</span> ${escapeHtml(item.experiment)}</p>
        </div>
      </article>
    `).join('');
  };

  renderProductBrief = function localizedRenderProductBrief(analysis) {
    if (language !== 'zh') {
      originalRenderProductBrief(analysis);
      return;
    }
    const rows = [
      ['目标用户', analysis.audience],
      ['问题', `${analysis.audience}很难把混合反馈转化为清晰的产品优先级。`],
      ['建议方案', '一个聚焦的工作流：分析反馈、识别模式、排序机会点，并生成一页产品简报。'],
      ['MVP 假设', analysis.priorities[0].title],
      ['置信度', `${analysis.overallConfidence}。当前信号强度来自 ${analysis.snippetCount} 条反馈来源。`],
      ['风险 / 假设', '分析质量取决于反馈样本。更多样化的来源可以提高置信度。'],
      ['成功指标', '用户能在五分钟内从原始笔记得到可分享的产品简报。'],
      ['下一步实验', analysis.nextExperiment]
    ];
    document.querySelector('#productBrief').innerHTML = rows.map(([name, value]) => `<div class="brief-row"><strong>${escapeHtml(name)}</strong><p>${escapeHtml(value)}</p></div>`).join('');
  };

  toMarkdown = function localizedMarkdown(analysis) {
    if (language !== 'zh') return originalToMarkdown(analysis);
    const clusters = analysis.clusters.map((cluster) => {
      const quotes = (cluster.evidenceQuotes || []).map((quote) => `  - 证据: "${quote}"`).join('\n');
      return `- **${cluster.label} (${cluster.confidence}):** ${cluster.evidence}${quotes ? `\n${quotes}` : ''}`;
    }).join('\n');
    const opportunities = analysis.opportunities.map((item, index) => `${index + 1}. **${item.title}** - ${item.why}\n   - 验证实验: ${item.experiment}`).join('\n');
    const priorities = analysis.priorities.map((item) => `- **${item.phase}: ${item.title}** - ${item.detail}`).join('\n');
    const stories = analysis.stories.map((story) => `- ${story}`).join('\n');
    return `# SignalBrief 产品简报\n\n## 决策摘要\n${analysis.summaryText}\n\n## 痛点聚类\n${clusters}\n\n## 机会点\n${opportunities}\n\n## MVP 优先级\n${priorities}\n\n## 用户故事\n${stories}\n\n## 一页产品简报\n- **目标用户：** ${analysis.audience}\n- **问题：** ${analysis.audience}很难把混合反馈转化为清晰的产品优先级。\n- **建议方案：** 一个聚焦的工作流：分析反馈、识别模式、排序机会点，并生成一页产品简报。\n- **MVP 假设：** ${analysis.priorities[0].title}\n- **置信度：** ${analysis.overallConfidence}\n- **风险 / 假设：** 分析质量取决于反馈样本。更多样化的来源可以提高置信度。\n- **成功指标：** 用户能在五分钟内从原始笔记得到可分享的产品简报。\n- **下一步实验：** ${analysis.nextExperiment}\n`;
  };

  toBriefMarkdown = function localizedBriefMarkdown(analysis) {
    if (language !== 'zh') return originalToBriefMarkdown(analysis);
    return `# 一页产品简报\n\n- **目标用户：** ${analysis.audience}\n- **问题：** ${analysis.audience}很难把混合反馈转化为清晰的产品优先级。\n- **建议方案：** 一个聚焦的工作流：分析反馈、识别模式、排序机会点，并生成一页产品简报。\n- **MVP 假设：** ${analysis.priorities[0].title}\n- **置信度：** ${analysis.overallConfidence}\n- **风险 / 假设：** 分析质量取决于反馈样本。更多样化的来源可以提高置信度。\n- **成功指标：** 用户能在五分钟内从原始笔记得到可分享的产品简报。\n- **下一步实验：** ${analysis.nextExperiment}\n`;
  };

  toRoadmapMarkdown = function localizedRoadmapMarkdown(analysis) {
    if (language !== 'zh') return originalToRoadmapMarkdown(analysis);
    const opportunities = analysis.opportunities.map((item, index) => `${index + 1}. **${item.title}**\n   - 原因: ${item.why}\n   - 验证实验: ${item.experiment}`).join('\n');
    const priorities = analysis.priorities.map((item) => `- **${item.phase}: ${item.title}** - ${item.detail}`).join('\n');
    return `# 路线图草稿\n\n## 机会点\n${opportunities}\n\n## MVP 优先级\n${priorities}\n`;
  };

  toStoriesMarkdown = function localizedStoriesMarkdown(analysis) {
    if (language !== 'zh') return originalToStoriesMarkdown(analysis);
    return `# 用户故事\n\n${analysis.stories.map((story) => `- ${story}`).join('\n')}\n`;
  };

  setGenerating = function localizedSetGenerating(isGenerating) {
    if (language !== 'zh') {
      originalSetGenerating(isGenerating);
      return;
    }
    generateBrief.disabled = isGenerating;
    generateBrief.textContent = isGenerating ? '分析中...' : '生成简报';
    generateBrief.classList.toggle('is-loading', isGenerating);
  };

  languageToggle.addEventListener('click', () => {
    language = language === 'en' ? 'zh' : 'en';
    localStorage.setItem('signalbrief-language', language);
    applyStaticText();
    applyPatternLanguage();
    loadSelectedSample();
    if (!results.hidden) {
      renderAnalysis(analyzeFeedback(input.value.trim(), productArea.value.trim(), targetUser.value.trim()));
    }
    trackEvent('language_switched', { language });
  });

  applyStaticText();
  applyPatternLanguage();
  loadSelectedSample();
})();
