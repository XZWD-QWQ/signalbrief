(() => {
  const labels = {
    en: {
      productTagline: 'Bilingual product decision assistant for turning feedback into evidence-backed action.',
      confidenceScoreLabel: 'Decision confidence',
      transformationLabel: 'Before / After',
      beforeLabel: 'Before',
      afterLabel: 'After',
      beforeState: 'Messy feedback is scattered across interviews, tickets, reviews, and notes.',
      afterState: 'SignalBrief turns it into ranked product opportunities, MVP priorities, and a shareable brief.',
      confidenceSummary: (count) => `Built from ${count} feedback sources and repeated evidence patterns.`,
      scoreTitle: 'Decision confidence',
      scorePrefix: 'Score',
      whyPrefix: 'Why',
      beforePrefix: 'Before',
      afterPrefix: 'After',
      evidence: 'traceable evidence quotes',
      sources: 'distinct feedback sources',
      signals: 'repeated product signals',
      strong: 'high-frequency themes support prioritization',
      directional: 'Current sample is best treated as directional',
      enough: 'Sample is large enough for an initial decision',
      more: 'Add more real feedback to raise confidence',
      strongest: 'The strongest signal is'
    },
    zh: {
      productTagline: '双语产品决策助手，把杂乱反馈变成有证据支撑的行动。',
      confidenceScoreLabel: '决策置信度',
      transformationLabel: '转化前 / 转化后',
      beforeLabel: '转化前',
      afterLabel: '转化后',
      beforeState: '反馈分散在访谈、工单、评论和笔记里，很难直接变成决策。',
      afterState: 'SignalBrief 将其整理成排序后的机会点、MVP 优先级和可分享简报。',
      confidenceSummary: (count) => `基于 ${count} 条反馈来源和重复出现的证据模式生成。`,
      scoreTitle: '决策置信度',
      scorePrefix: '分数',
      whyPrefix: '依据',
      beforePrefix: '转化前',
      afterPrefix: '转化后',
      evidence: '条可追溯证据引用',
      sources: '条独立反馈来源',
      signals: '个重复出现的产品信号',
      strong: '个高频主题支撑优先级',
      directional: '当前样本适合作为方向性判断',
      enough: '样本长度足够形成初步判断',
      more: '建议继续加入更多真实反馈提高置信度',
      strongest: '当前最强信号是：'
    }
  };

  const getLang = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const text = (key) => labels[getLang()][key];

  function ensureAwardMarkup() {
    if (!document.querySelector('.product-tagline')) {
      document.querySelector('.brand-lockup h1')?.insertAdjacentHTML('afterend', '<p class="product-tagline" data-award-i18n="productTagline"></p>');
    }

    if (!document.querySelector('#confidenceScore')) {
      document.querySelector('#metricRow')?.insertAdjacentHTML('afterend', `
        <div class="decision-grid">
          <section class="decision-card confidence-card">
            <p class="card-label" data-award-i18n="confidenceScoreLabel">Decision confidence</p>
            <div class="confidence-score" id="confidenceScore"></div>
            <p id="confidenceSummary"></p>
            <ul class="confidence-reasons" id="confidenceReasons"></ul>
          </section>
          <section class="decision-card transformation-card">
            <p class="card-label" data-award-i18n="transformationLabel">Before / After</p>
            <div class="transformation-grid">
              <div><strong data-award-i18n="beforeLabel">Before</strong><p id="beforeState"></p></div>
              <div><strong data-award-i18n="afterLabel">After</strong><p id="afterState"></p></div>
            </div>
          </section>
        </div>
      `);
    }
  }

  function applyAwardLabels() {
    document.querySelectorAll('[data-award-i18n]').forEach((node) => {
      node.textContent = text(node.dataset.awardI18n);
    });
    const tagline = document.querySelector('.product-tagline');
    if (tagline) tagline.textContent = text('productTagline');
  }

  function confidenceScore(analysis) {
    const sourceCount = analysis.snippetCount || 0;
    const wordCount = analysis.wordCount || 0;
    const clusters = analysis.clusters || [];
    const quotes = clusters.reduce((total, cluster) => total + ((cluster.evidenceQuotes || []).length), 0);
    const strongSignals = clusters.filter((cluster) => cluster.score >= 3).length;
    return Math.min(95, Math.min(sourceCount * 5, 35) + Math.min(clusters.length * 9 + strongSignals * 6, 40) + Math.min(quotes * 5, 20) + (wordCount > 120 ? 5 : wordCount > 60 ? 3 : 1));
  }

  function confidenceReasons(analysis) {
    const lang = getLang();
    const sourceCount = analysis.snippetCount || 0;
    const wordCount = analysis.wordCount || 0;
    const clusters = analysis.clusters || [];
    const quotes = clusters.reduce((total, cluster) => total + ((cluster.evidenceQuotes || []).length), 0);
    const strongSignals = clusters.filter((cluster) => cluster.score >= 3).length;
    if (lang === 'zh') {
      return [
        `${sourceCount} ${text('sources')}`,
        `${clusters.length} ${text('signals')}`,
        `${quotes} ${text('evidence')}`,
        strongSignals > 0 ? `${strongSignals} ${text('strong')}` : text('directional'),
        wordCount > 120 ? text('enough') : text('more')
      ];
    }
    return [
      `${sourceCount} ${text('sources')}`,
      `${clusters.length} ${text('signals')}`,
      `${quotes} ${text('evidence')}`,
      strongSignals > 0 ? `${strongSignals} ${text('strong')}` : text('directional'),
      wordCount > 120 ? text('enough') : text('more')
    ];
  }

  function renderAwardPanel(analysis) {
    ensureAwardMarkup();
    applyAwardLabels();
    const score = confidenceScore(analysis);
    const reasons = confidenceReasons(analysis);
    const mainTheme = analysis.clusters?.[0]?.label || (getLang() === 'zh' ? '最高优先级机会' : 'the highest-priority opportunity');

    document.querySelector('#confidenceScore').textContent = `${score}/100`;
    document.querySelector('#confidenceSummary').textContent = labels[getLang()].confidenceSummary(analysis.snippetCount || 0);
    document.querySelector('#confidenceReasons').innerHTML = reasons.slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');
    document.querySelector('#beforeState').textContent = text('beforeState');
    document.querySelector('#afterState').textContent = getLang() === 'zh'
      ? `${text('afterState')} ${text('strongest')}${mainTheme}。`
      : `${text('afterState')} ${text('strongest')} ${mainTheme}.`;
  }

  function enhanceMarkdown(markdown, analysis) {
    const score = confidenceScore(analysis);
    const reasons = confidenceReasons(analysis).join(getLang() === 'zh' ? '；' : '; ');
    if (getLang() === 'zh') {
      const block = `## 决策置信度\n- **分数：** ${score}/100\n- **依据：** ${reasons}\n\n## 转化前 / 转化后\n- **转化前：** ${text('beforeState')}\n- **转化后：** ${text('afterState')}\n\n`;
      return markdown.replace('## 痛点聚类', `${block}## 痛点聚类`);
    }
    const block = `## Decision confidence\n- **Score:** ${score}/100\n- **Why:** ${reasons}\n\n## Before / After\n- **Before:** ${text('beforeState')}\n- **After:** ${text('afterState')}\n\n`;
    return markdown.replace('## Pain point clusters', `${block}## Pain point clusters`);
  }

  ensureAwardMarkup();
  applyAwardLabels();

  const originalRenderAnalysis = renderAnalysis;
  renderAnalysis = function awardRenderAnalysis(analysis) {
    originalRenderAnalysis(analysis);
    renderAwardPanel(analysis);
  };

  const originalToMarkdown = toMarkdown;
  toMarkdown = function awardToMarkdown(analysis) {
    return enhanceMarkdown(originalToMarkdown(analysis), analysis);
  };

  document.querySelector('#languageToggle')?.addEventListener('click', () => {
    window.setTimeout(applyAwardLabels, 0);
  });
})();
