const sampleFeedback = `Interview 1: I get a lot of user comments from support, app reviews, and sales calls, but I do not know what to do with them after the meeting.

Support ticket: Users keep asking for a clearer onboarding path. They say the dashboard is powerful, but they do not know which action matters first.

App review: I like the product, but I wish it explained why a feature is recommended. The suggestions feel useful but a little random.

Sales note: Small teams want a simple way to turn feedback into a roadmap without spending hours in spreadsheets.

Survey response: The biggest problem is prioritization. Everything feels important, so we end up debating opinions instead of evidence.

Founder note: I want a one-page summary I can share with my team. It should include themes, pain points, and what we should build next.

Customer call: Please make it easier to export insights. I need to paste summaries into Notion, docs, or a weekly product update.

PM note: The team does not need a perfect research repository. We need a fast way to move from raw notes to decisions.`;

const patterns = [
  {
    key: "prioritization",
    label: "Prioritization confusion",
    terms: ["priority", "prioritize", "prioritization", "roadmap", "important", "decide", "decision", "debating"],
    opportunity: "Help teams convert noisy feedback into ranked opportunities with visible reasoning.",
    mvp: "Evidence-backed priority ranking",
    story: "As a product builder, I want feedback themes ranked by urgency and evidence so I can choose the next MVP bet with confidence."
  },
  {
    key: "clarity",
    label: "Lack of clarity",
    terms: ["clear", "confusing", "explain", "random", "why", "understand", "know", "onboarding"],
    opportunity: "Make the next best action obvious and explain why each recommendation matters.",
    mvp: "Plain-language rationale for each insight",
    story: "As a user, I want each recommendation explained in simple language so I understand what action to take next."
  },
  {
    key: "fragmentation",
    label: "Scattered feedback sources",
    terms: ["support", "reviews", "sales", "survey", "comments", "calls", "notes", "spreadsheets"],
    opportunity: "Create one lightweight place where mixed feedback can become structured product signals.",
    mvp: "Paste-anything feedback intake",
    story: "As a maker, I want to paste notes from many sources into one workflow so I can find patterns without manual cleanup."
  },
  {
    key: "sharing",
    label: "Hard to share decisions",
    terms: ["share", "summary", "export", "notion", "docs", "weekly", "team", "one-page"],
    opportunity: "Turn analysis into a concise brief that can be shared with teams and stakeholders.",
    mvp: "One-page brief and Markdown export",
    story: "As a PM, I want a concise product brief I can share with my team so feedback becomes a decision artifact."
  },
  {
    key: "speed",
    label: "Slow manual workflow",
    terms: ["hours", "fast", "spending", "manual", "repository", "move from", "raw notes", "workflow"],
    opportunity: "Reduce the time between collecting feedback and making a product decision.",
    mvp: "One-click feedback-to-brief generation",
    story: "As a founder, I want a fast first draft from raw notes so I can spend more time judging the decision than formatting it."
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
const loadSample = document.querySelector("#loadSample");
const generateBrief = document.querySelector("#generateBrief");
const copyMarkdown = document.querySelector("#copyMarkdown");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#emptyState");
const toast = document.querySelector("#toast");

loadSample.addEventListener("click", () => {
  const feedbackFieldWasEmpty = input.value.trim().length === 0;
  const previousFeedbackLength = input.value.length;

  input.value = sampleFeedback;
  showToast("Sample feedback loaded.");
  input.focus();

  pendo.track("sample_feedback_loaded", {
    feedbackFieldWasEmpty,
    previousFeedbackLength
  });
});

generateBrief.addEventListener("click", () => {
  const raw = input.value.trim();
  if (!raw) {
    showToast("Paste feedback or load the sample first.");
    return;
  }

  const isSampleFeedback = raw === sampleFeedback.trim();
  const words = raw.split(/\s+/).filter(Boolean);
  const lines = raw.split(/\n+/).filter((l) => l.trim());

  pendo.track("feedback_submitted", {
    feedbackLength: raw.length,
    wordCount: words.length,
    lineCount: lines.length,
    productAreaValue: productArea.value.trim() || "",
    targetUserValue: targetUser.value.trim() || "",
    isSampleFeedback,
    containsMultipleSources: lines.length > 1
  });

  const analysis = analyzeFeedback(raw, productArea.value.trim(), targetUser.value.trim());
  renderAnalysis(analysis);

  pendo.track("brief_generated", {
    wordCount: analysis.wordCount,
    snippetCount: analysis.snippetCount,
    clusterCount: analysis.clusters.length,
    sourceTone: analysis.sourceTone,
    productArea: productArea.value.trim() || "",
    targetUser: targetUser.value.trim() || "",
    topSignalLabel: analysis.clusters[0]?.label || "",
    topSignalScore: analysis.clusters[0]?.score || 0,
    opportunityCount: analysis.opportunities.length,
    storyCount: analysis.stories.length,
    usedSampleFeedback: isSampleFeedback
  });
});

copyMarkdown.addEventListener("click", async () => {
  if (!state.markdown) {
    showToast("Generate a brief first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(state.markdown);
    showToast("Markdown copied.");

    pendo.track("brief_markdown_copied", {
      markdownLength: state.markdown.length,
      clusterCount: (state.markdown.match(/\*\*.*?:\*\*/g) || []).length,
      productArea: productArea.value.trim() || "",
      targetUser: targetUser.value.trim() || "",
      sourceTone: document.querySelector("#metricRow")?.textContent.includes("Pain-led") ? "Pain-led" : document.querySelector("#metricRow")?.textContent.includes("Opportunity-led") ? "Opportunity-led" : "Mixed"
    });
  } catch {
    showToast("Copy failed. Select the brief text manually.");
  }
});

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

      return {
        ...pattern,
        score: hits,
        evidence: findEvidence(snippets, pattern.terms)
      };
    })
    .sort((a, b) => b.score - a.score);

  const active = scored.filter((item) => item.score > 0).slice(0, 4);
  const clusters = active.length ? active : createFallbackClusters(snippets);
  const usedFallbackClusters = active.length === 0;

  pendo.track("signal_analysis_completed", {
    totalPatternsMatched: scored.filter((item) => item.score > 0).length,
    activeClusterCount: clusters.length,
    usedFallbackClusters,
    topClusterKey: clusters[0]?.key || "",
    topClusterScore: clusters[0]?.score || 0,
    secondClusterKey: clusters[1]?.key || "",
    secondClusterScore: clusters[1]?.score || 0,
    sourceTone: detectTone(lower)
  });
  const opportunities = clusters.slice(0, 3).map((cluster, index) => ({
    title: cluster.opportunity || `Clarify ${cluster.label.toLowerCase()}`,
    why: cluster.evidence || "This theme appears repeatedly in the submitted feedback.",
    confidence: index === 0 ? "High" : index === 1 ? "Medium" : "Directional"
  }));

  const priorities = buildPriorities(clusters);
  const stories = clusters.slice(0, 4).map((cluster) => cluster.story || `As a ${audience || "user"}, I want ${cluster.label.toLowerCase()} addressed so I can move faster with less uncertainty.`);
  const mainTheme = clusters[0]?.label || "Feedback clarity";
  const secondaryTheme = clusters[1]?.label || "Decision support";

  return {
    product: product || "Product feedback workflow",
    audience: audience || "Product builders",
    wordCount,
    snippetCount: snippets.length,
    clusters,
    opportunities,
    priorities,
    stories,
    summaryTitle: `${mainTheme} is the strongest signal`,
    summaryText: `The feedback suggests ${audience || "the target users"} need a faster path from raw notes to product decisions. The best MVP angle is to combine ${mainTheme.toLowerCase()} with ${secondaryTheme.toLowerCase()}, then package the result as a shareable one-page brief.`,
    sourceTone: detectTone(lower)
  };
}

function findEvidence(snippets, terms) {
  const found = snippets.find((snippet) => {
    const lower = snippet.toLowerCase();
    return terms.some((term) => lower.includes(term));
  });

  return found ? trimText(found.replace(/^[^:]{1,28}:\s*/, ""), 150) : "";
}

function createFallbackClusters(snippets) {
  return fallbackThemes.slice(0, 3).map((label, index) => ({
    key: label.toLowerCase().replaceAll(" ", "-"),
    label,
    score: Math.max(1, snippets.length - index),
    evidence: snippets[index] ? trimText(snippets[index], 150) : "The submitted feedback points to this area as a possible product signal.",
    opportunity: `Explore how ${label.toLowerCase()} affects the user's ability to make progress.`,
    mvp: `${label} diagnostic`,
    story: `As a user, I want help with ${label.toLowerCase()} so I can make progress without guessing.`
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
  const urgentWords = ["urgent", "blocked", "broken", "frustrated", "confusing", "hard", "problem"];
  const positiveWords = ["like", "love", "useful", "powerful", "help", "easier"];
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
  showToast("Brief generated.");
}

function renderMetrics(analysis) {
  const metrics = [
    ["Sources", analysis.snippetCount],
    ["Words", analysis.wordCount],
    ["Signals", analysis.clusters.length],
    ["Tone", analysis.sourceTone]
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
          <strong>${escapeHtml(cluster.label)}</strong>
          <p>${escapeHtml(cluster.evidence || "This theme appears in the feedback and should be validated with users.")}</p>
        </article>
      `
    )
    .join("");
}

function renderOpportunities(opportunities) {
  document.querySelector("#opportunityList").innerHTML = opportunities
    .map(
      (item, index) => `
        <article class="opportunity-item">
          <span class="rank">${index + 1}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.why)} Confidence: ${escapeHtml(item.confidence)}.</p>
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
    ["Proposed solution", `A focused workflow that analyzes feedback, identifies patterns, ranks opportunities, and creates a one-page brief.`],
    ["MVP bet", analysis.priorities[0].title],
    ["Success metric", "A user can move from raw notes to a shareable product brief in under five minutes."],
    ["Next experiment", "Give three product builders the sample workflow and ask whether the output changes what they would build next."]
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
  const clusterText = analysis.clusters.map((cluster) => `- **${cluster.label}:** ${cluster.evidence}`).join("\n");
  const opportunityText = analysis.opportunities.map((item, index) => `${index + 1}. **${item.title}** - ${item.why} Confidence: ${item.confidence}.`).join("\n");
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
- **Success metric:** A user can move from raw notes to a shareable product brief in under five minutes.
- **Next experiment:** Give three product builders the sample workflow and ask whether the output changes what they would build next.
`;
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

input.value = sampleFeedback;

if (new URLSearchParams(window.location.search).get("demo") === "1") {
  pendo.track("demo_brief_auto_generated", {
    referrer: document.referrer || "",
    urlParams: window.location.search
  });

  window.requestAnimationFrame(() => {
    generateBrief.click();
  });
}
