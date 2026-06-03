if (window.pendo && typeof window.pendo.initialize === "function") {
  window.pendo.initialize({
    visitor: { id: "" }
  });
}

const samples = {
  saas: {
    product: "Early-stage product feedback",
    audience: "Product builders and small teams",
    feedback: `Interview 1: I get a lot of user comments from support, app reviews, and sales calls, but I do not know what to do with them after the meeting.

Support ticket: Users keep asking for a clearer onboarding path. They say the dashboard is powerful, but they do not know which action matters first.

App review: I like the product, but I wish it explained why a feature is recommended. The suggestions feel useful but a little random.

Sales note: Small teams want a simple way to turn feedback into a roadmap without spending hours in spreadsheets.

Survey response: The biggest problem is prioritization. Everything feels important, so we end up debating opinions instead of evidence.

Founder note: I want a one-page summary I can share with my team. It should include themes, pain points, and what we should build next.

Customer call: Please make it easier to export insights. I need to paste summaries into Notion, docs, or a weekly product update.

PM note: The team does not need a perfect research repository. We need a fast way to move from raw notes to decisions.`
  },
  reviews: {
    product: "Mobile app review analysis",
    audience: "Consumer app product teams",
    feedback: `App review: The app looks clean, but I cannot find where to change my plan after signing up.

App review: Notifications are helpful, but there are too many of them and I want more control.

App review: I love the weekly summary, but it would be better if I could share it with my coach.

App review: The first screen after login is confusing. I do not know whether I should track a habit, read insights, or invite a friend.

Survey note: Users say they trust the recommendations more when the app explains the data behind them.

Support note: Several users asked for an export option because they want to keep a copy in their own notes app.

Product note: Retention seems strongest when users complete the first setup flow in one session.`
  },
  support: {
    product: "Support ticket triage",
    audience: "Customer success and product teams",
    feedback: `Support ticket: Customers keep asking why their import failed, but the error message only says something went wrong.

Support ticket: Admins want a way to see which teammates have not finished setup.

Customer call: The dashboard has the right data, but it takes too many clicks to find the account health view.

Support ticket: Users often ask whether they can export a CSV for monthly reporting.

CSM note: The highest-value accounts want faster answers about adoption, usage gaps, and renewal risk.

Support ticket: The help docs are detailed, but users want the product to guide them before they need to search docs.

Product note: We need a better way to turn recurring tickets into roadmap candidates.`
  }
};

const patterns = [
  {
    key: "prioritization",
    label: "Prioritization confusion",
    terms: ["priority", "prioritize", "prioritization", "roadmap", "important", "decide", "decision", "debating", "candidates"],
    opportunity: "Help teams convert noisy feedback into ranked opportunities with visible reasoning.",
    mvp: "Evidence-backed priority ranking",
    story: "As a product builder, I want feedback themes ranked by urgency and evidence so I can choose the next MVP bet with confidence.",
    experiment: "Give three product builders the same feedback set and compare whether SignalBrief helps them converge on the same top priority."
  },
  {
    key: "clarity",
    label: "Lack of clarity",
    terms: ["clear", "confusing", "explain", "random", "why", "understand", "know", "onboarding", "error", "guide"],
    opportunity: "Make the next best action obvious and explain why each recommendation matters.",
    mvp: "Plain-language rationale for each insight",
    story: "As a user, I want each recommendation explained in simple language so I understand what action to take next.",
    experiment: "Ask users to read the generated rationale and mark whether they would trust the recommendation."
  },
  {
    key: "fragmentation",
    label: "Scattered feedback sources",
    terms: ["support", "reviews", "sales", "survey", "comments", "calls", "notes", "spreadsheets", "tickets", "import"],
    opportunity: "Create one lightweight place where mixed feedback can become structured product signals.",
    mvp: "Paste-anything feedback intake",
    story: "As a maker, I want to paste notes from many sources into one workflow so I can find patterns without manual cleanup.",
    experiment: "Test whether users can paste five mixed sources and still understand the resulting clusters without extra setup."
  },
  {
    key: "sharing",
    label: "Hard to share decisions",
    terms: ["share", "summary", "export", "notion", "docs", "weekly", "team", "one-page", "csv", "reporting"],
    opportunity: "Turn analysis into a concise brief that can be shared with teams and stakeholders.",
    mvp: "One-page brief and Markdown export",
    story: "As a PM, I want a concise product brief I can share with my team so feedback becomes a decision artifact.",
    experiment: "Give the exported brief to a teammate and ask whether they can explain the top opportunity in one minute."
  },
  {
    key: "speed",
    label: "Slow manual workflow",
    terms: ["hours", "fast", "spending", "manual", "repository", "move from", "raw notes", "workflow", "clicks", "faster"],
    opportunity: "Reduce the time between collecting feedback and making a product decision.",
    mvp: "One-click feedback-to-brief generation",
    story: "As a founder, I want a fast first draft from raw notes so I can spend more time judging the decision than formatting it.",
    experiment: "Time how long it takes a user to move from raw notes to a shareable brief with and without SignalBrief."
  }
];

const fallbackThemes = [
  "Unclear user need",
  "Workflow friction",
  "Decision bottleneck",
  "Collaboration gap",
  "Missing confidence signal"
];

const state = {
  markdown: ""
};

const input = document.querySelector("#feedbackInput");
const productArea = document.querySelector("#productArea");
const targetUser = document.querySelector("#targetUser");
const sampleSelect = document.querySelector("#sampleSelect");
const loadSample = document.querySelector("#loadSample");
const generateBrief = document.querySelector("#generateBrief");
const copyMarkdown = document.querySelector("#copyMarkdown");
const copyBrief = document.querySelector("#copyBrief");
const copyRoadmap = document.querySelector("#copyRoadmap");
const copyStories = document.querySelector("#copyStories");
const downloadMarkdown = document.querySelector("#downloadMarkdown");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const results = document.querySelector("#results");
const emptyState = document.querySelector("#emptyState");
const toast = document.querySelector("#toast");

loadSample.addEventListener("click", () => {
  loadSelectedSample();
  showToast("Sample feedback loaded.");
  input.focus();
});

sampleSelect.addEventListener("change", () => {
  loadSelectedSample();
});

generateBrief.addEventListener("click", () => {
  const raw = input.value.trim();
  if (!raw) {
    showToast("Paste feedback or load a sample first.");
    return;
  }

  setGenerating(true);
  window.setTimeout(() => {
    const analysis = analyzeFeedback(raw, productArea.value.trim(), targetUser.value.trim());
    renderAnalysis(analysis);
    setGenerating(false);
    trackEvent("brief_generated", {
      sample: sampleSelect.value,
      signals: analysis.clusters.length,
      confidence: analysis.overallConfidence
    });
  }, 420);
});

copyMarkdown.addEventListener("click", async () => {
  await copyText(state.markdown, "Full brief copied.", "all_markdown_copied");
});

copyBrief.addEventListener("click", async () => {
  await copyText(state.briefMarkdown, "Brief copied.", "brief_copied");
});

copyRoadmap.addEventListener("click", async () => {
  await copyText(state.roadmapMarkdown, "Roadmap copied.", "roadmap_copied");
});

copyStories.addEventListener("click", async () => {
  await copyText(state.storiesMarkdown, "Stories copied.", "stories_copied");
});

downloadMarkdown.addEventListener("click", () => {
  if (!state.markdown) {
    showToast("Generate a brief first.");
    return;
  }

  const blob = new Blob([state.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "signalbrief-product-brief.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  trackEvent("markdown_downloaded", { sample: sampleSelect.value });
  showToast("Markdown downloaded.");
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
    trackEvent("result_tab_opened", { tab: button.dataset.tab });
  });
});

function loadSelectedSample() {
  const sample = samples[sampleSelect.value] || samples.saas;
  input.value = sample.feedback;
  productArea.value = sample.product;
  targetUser.value = sample.audience;
}

function analyzeFeedback(raw, product, audience) {
  const snippets = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const lower = raw.toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const scored = patterns
    .map((pattern) => {
      const hits = pattern.terms.reduce((total, term) => {
        const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
        return total + (raw.match(regex) || []).length;
      }, 0);
      const evidenceQuotes = findEvidenceQuotes(snippets, pattern.terms);

      return {
        ...pattern,
        score: hits,
        confidence: getConfidence(hits, snippets.length),
        evidenceQuotes,
        evidence: evidenceQuotes[0] || ""
      };
    })
    .sort((a, b) => b.score - a.score);

  const active = scored.filter((item) => item.score > 0).slice(0, 4);
  const clusters = active.length ? active : createFallbackClusters(snippets);
  const opportunities = clusters.slice(0, 3).map((cluster, index) => ({
    title: cluster.opportunity || `Clarify ${cluster.label.toLowerCase()}`,
    why: cluster.evidence || "This theme appears repeatedly in the submitted feedback.",
    confidence: cluster.confidence || (index === 0 ? "High" : index === 1 ? "Medium" : "Directional"),
    experiment: cluster.experiment || "Validate this opportunity with three target users before building."
  }));

  const priorities = buildPriorities(clusters);
  const stories = clusters.slice(0, 4).map((cluster) => cluster.story || `As a ${audience || "user"}, I want ${cluster.label.toLowerCase()} addressed so I can move faster with less uncertainty.`);
  const mainTheme = clusters[0]?.label || "Feedback clarity";
  const secondaryTheme = clusters[1]?.label || "Decision support";
  const overallConfidence = getOverallConfidence(clusters, snippets.length);

  return {
    product: product || "Product feedback workflow",
    audience: audience || "Product builders",
    wordCount,
    snippetCount: snippets.length,
    clusters,
    opportunities,
    priorities,
    stories,
    overallConfidence,
    summaryTitle: `${mainTheme} is the strongest signal`,
    summaryText: `The feedback suggests ${audience || "the target users"} need a faster path from raw notes to product decisions. The best MVP angle is to combine ${mainTheme.toLowerCase()} with ${secondaryTheme.toLowerCase()}, then package the result as a shareable one-page brief.`,
    sourceTone: detectTone(lower),
    nextExperiment: opportunities[0]?.experiment || "Run a short usability test with three target users."
  };
}

function findEvidenceQuotes(snippets, terms) {
  return snippets
    .filter((snippet) => {
      const lower = snippet.toLowerCase();
      return terms.some((term) => lower.includes(term));
    })
    .slice(0, 2)
    .map((snippet) => trimText(snippet.replace(/^[^:]{1,28}:\s*/, ""), 170));
}

function createFallbackClusters(snippets) {
  return fallbackThemes.slice(0, 3).map((label, index) => ({
    key: label.toLowerCase().replaceAll(" ", "-"),
    label,
    score: Math.max(1, snippets.length - index),
    confidence: index === 0 ? "Medium" : "Directional",
    evidenceQuotes: snippets[index] ? [trimText(snippets[index], 170)] : [],
    evidence: snippets[index] ? trimText(snippets[index], 170) : "The submitted feedback points to this area as a possible product signal.",
    opportunity: `Explore how ${label.toLowerCase()} affects the user's ability to make progress.`,
    mvp: `${label} diagnostic`,
    story: `As a user, I want help with ${label.toLowerCase()} so I can make progress without guessing.`,
    experiment: `Interview users about ${label.toLowerCase()} and confirm whether it blocks progress.`
  }));
}

function buildPriorities(clusters) {
  const first = clusters[0] || patterns[0];
  const second = clusters[1] || patterns[1];
  const third = clusters[2] || patterns[3];

  return [
    {
      phase: "Now",
      className: "now",
      title: first.mvp || "Generate the first product brief",
      detail: "Focus on the highest-signal pain point and make the output immediately useful."
    },
    {
      phase: "Next",
      className: "next",
      title: second.mvp || "Improve evidence and rationale",
      detail: "Add clearer explanations so users can understand why each recommendation appears."
    },
    {
      phase: "Later",
      className: "later",
      title: third.mvp || "Add team sharing workflow",
      detail: "Support export, collaboration, and follow-up experiments once the core value is proven."
    }
  ];
}

function detectTone(lower) {
  const urgentWords = ["urgent", "blocked", "broken", "frustrated", "confusing", "hard", "problem", "failed", "too many"];
  const positiveWords = ["like", "love", "useful", "powerful", "help", "easier", "clean", "trust"];
  const urgent = urgentWords.filter((word) => lower.includes(word)).length;
  const positive = positiveWords.filter((word) => lower.includes(word)).length;

  if (urgent > positive) {
    return "Pain-led";
  }

  if (positive > urgent) {
    return "Opportunity-led";
  }

  return "Mixed";
}

function renderAnalysis(analysis) {
  emptyState.hidden = true;
  results.hidden = false;

  document.querySelector("#summaryTitle").textContent = analysis.summaryTitle;
  document.querySelector("#summaryText").textContent = analysis.summaryText;
  document.querySelector("#clusterCount").textContent = `${analysis.clusters.length} themes`;

  renderMetrics(analysis);
  renderClusters(analysis.clusters);
  renderOpportunities(analysis.opportunities);
  renderPriorities(analysis.priorities);
  renderStories(analysis.stories);
  renderProductBrief(analysis);

  state.markdown = toMarkdown(analysis);
  state.briefMarkdown = toBriefMarkdown(analysis);
  state.roadmapMarkdown = toRoadmapMarkdown(analysis);
  state.storiesMarkdown = toStoriesMarkdown(analysis);
  setActiveTab("summary");
  showToast("Brief generated.");
}

function renderMetrics(analysis) {
  const metrics = [
    ["Sources", analysis.snippetCount],
    ["Words", analysis.wordCount],
    ["Signals", analysis.clusters.length],
    ["Confidence", analysis.overallConfidence]
  ];

  document.querySelector("#metricRow").innerHTML = metrics
    .map(([label, value]) => `<div class="metric"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`)
    .join("");
}

function renderClusters(clusters) {
  document.querySelector("#clusterList").innerHTML = clusters
    .map(
      (cluster) => `
        <article class="cluster-item">
          <div class="item-title-row">
            <strong>${escapeHtml(cluster.label)}</strong>
            <span class="confidence-pill">${escapeHtml(cluster.confidence || "Directional")}</span>
          </div>
          <p>${escapeHtml(cluster.evidence || "This theme appears in the feedback and should be validated with users.")}</p>
          ${renderQuotes(cluster.evidenceQuotes)}
        </article>
      `
    )
    .join("");
}

function renderQuotes(quotes = []) {
  if (!quotes.length) {
    return "";
  }

  return `
    <div class="quote-list">
      ${quotes.map((quote) => `<blockquote>${escapeHtml(quote)}</blockquote>`).join("")}
    </div>
  `;
}

function renderOpportunities(opportunities) {
  document.querySelector("#opportunityList").innerHTML = opportunities
    .map(
      (item, index) => `
        <article class="opportunity-item">
          <span class="rank">${index + 1}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.why)}</p>
            <p class="experiment"><span>Experiment:</span> ${escapeHtml(item.experiment)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPriorities(priorities) {
  document.querySelector("#priorityGrid").innerHTML = priorities
    .map(
      (item) => `
        <article class="priority-item ${escapeHtml(item.className)}">
          <strong>${escapeHtml(item.phase)}: ${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
        </article>
      `
    )
    .join("");
}

function renderStories(stories) {
  document.querySelector("#storyList").innerHTML = stories.map((story) => `<li>${escapeHtml(story)}</li>`).join("");
}

function renderProductBrief(analysis) {
  const rows = [
    ["Target user", analysis.audience],
    ["Problem", `${analysis.audience} struggle to turn mixed feedback into clear product priorities.`],
    ["Proposed solution", "A focused workflow that analyzes feedback, identifies patterns, ranks opportunities, and creates a one-page brief."],
    ["MVP bet", analysis.priorities[0].title],
    ["Confidence", `${analysis.overallConfidence}. The current signal strength comes from ${analysis.snippetCount} feedback sources.`],
    ["Risk / assumption", "The analysis is only as good as the feedback sample. More diverse sources should improve confidence."],
    ["Success metric", "A user can move from raw notes to a shareable product brief in under five minutes."],
    ["Next experiment", analysis.nextExperiment]
  ];

  document.querySelector("#productBrief").innerHTML = rows
    .map(
      ([label, value]) => `
        <div class="brief-row">
          <strong>${escapeHtml(label)}</strong>
          <p>${escapeHtml(value)}</p>
        </div>
      `
    )
    .join("");
}

function toMarkdown(analysis) {
  const clusterText = analysis.clusters
    .map((cluster) => {
      const quotes = (cluster.evidenceQuotes || []).map((quote) => `  - Evidence: "${quote}"`).join("\n");
      return `- **${cluster.label} (${cluster.confidence}):** ${cluster.evidence}${quotes ? `\n${quotes}` : ""}`;
    })
    .join("\n");
  const opportunityText = analysis.opportunities.map((item, index) => `${index + 1}. **${item.title}** - ${item.why}\n   - Experiment: ${item.experiment}`).join("\n");
  const priorityText = analysis.priorities.map((item) => `- **${item.phase}: ${item.title}** - ${item.detail}`).join("\n");
  const storyText = analysis.stories.map((story) => `- ${story}`).join("\n");

  return `# SignalBrief Product Brief

## Decision summary
${analysis.summaryText}

## Pain point clusters
${clusterText}

## Opportunity areas
${opportunityText}

## MVP priorities
${priorityText}

## User stories
${storyText}

## One-page brief
- **Target user:** ${analysis.audience}
- **Problem:** ${analysis.audience} struggle to turn mixed feedback into clear product priorities.
- **Proposed solution:** A focused workflow that analyzes feedback, identifies patterns, ranks opportunities, and creates a one-page brief.
- **MVP bet:** ${analysis.priorities[0].title}
- **Confidence:** ${analysis.overallConfidence}
- **Risk / assumption:** The analysis is only as good as the feedback sample. More diverse sources should improve confidence.
- **Success metric:** A user can move from raw notes to a shareable product brief in under five minutes.
- **Next experiment:** ${analysis.nextExperiment}
`;
}

function toBriefMarkdown(analysis) {
  return `# One-page product brief

- **Target user:** ${analysis.audience}
- **Problem:** ${analysis.audience} struggle to turn mixed feedback into clear product priorities.
- **Proposed solution:** A focused workflow that analyzes feedback, identifies patterns, ranks opportunities, and creates a one-page brief.
- **MVP bet:** ${analysis.priorities[0].title}
- **Confidence:** ${analysis.overallConfidence}
- **Risk / assumption:** The analysis is only as good as the feedback sample. More diverse sources should improve confidence.
- **Success metric:** A user can move from raw notes to a shareable product brief in under five minutes.
- **Next experiment:** ${analysis.nextExperiment}
`;
}

function toRoadmapMarkdown(analysis) {
  const priorities = analysis.priorities.map((item) => `- **${item.phase}: ${item.title}** - ${item.detail}`).join("\n");
  const opportunities = analysis.opportunities.map((item, index) => `${index + 1}. **${item.title}**\n   - Why: ${item.why}\n   - Experiment: ${item.experiment}`).join("\n");

  return `# Roadmap draft

## Opportunity areas
${opportunities}

## MVP priorities
${priorities}
`;
}

function toStoriesMarkdown(analysis) {
  return `# User stories

${analysis.stories.map((story) => `- ${story}`).join("\n")}
`;
}

async function copyText(text, successMessage, eventName) {
  if (!text) {
    showToast("Generate a brief first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    trackEvent(eventName, { sample: sampleSelect.value });
    showToast(successMessage);
  } catch {
    showToast("Copy failed. Select the brief text manually.");
  }
}

function setActiveTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
}

function getConfidence(hits, sourceCount) {
  if (hits >= 4 || (hits >= 3 && sourceCount >= 6)) {
    return "High";
  }

  if (hits >= 2) {
    return "Medium";
  }

  return "Directional";
}

function getOverallConfidence(clusters, sourceCount) {
  const strongSignals = clusters.filter((cluster) => cluster.score >= 3).length;
  if (strongSignals >= 2 && sourceCount >= 6) {
    return "High";
  }

  if (clusters.length >= 3 && sourceCount >= 4) {
    return "Medium";
  }

  return "Directional";
}

function setGenerating(isGenerating) {
  generateBrief.disabled = isGenerating;
  generateBrief.textContent = isGenerating ? "Analyzing..." : "Generate brief";
  generateBrief.classList.toggle("is-loading", isGenerating);
}

function trackEvent(name, data = {}) {
  if (window.pendo && typeof window.pendo.track === "function") {
    window.pendo.track(name, data);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function trimText(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}...` : text;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadSelectedSample();

if (new URLSearchParams(window.location.search).get("demo") === "1") {
  window.requestAnimationFrame(() => {
    generateBrief.click();
  });
}
