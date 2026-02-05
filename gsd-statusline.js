#!/usr/bin/env node
// Claude Code Statusline - Enhanced Edition v3
// Shows: model | folder | context progress | rate limit status | tasks

const fs = require("fs");
const path = require("path");
const os = require("os");

// ANSI color helpers
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  boldBlue: "\x1b[1;34m",
  boldCyan: "\x1b[1;36m",
  boldGreen: "\x1b[1;32m",
  boldYellow: "\x1b[1;33m",
  boldRed: "\x1b[1;31m",
  boldMagenta: "\x1b[1;35m",
  dimWhite: "\x1b[2;37m",
  dimCyan: "\x1b[2;36m",
  dimGray: "\x1b[2;90m",
};

const sep = `${c.dimWhite}│${c.reset}`;

// Format tokens with k/M suffix
const formatTokens = (tokens) => {
  if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + "M";
  if (tokens >= 1000) return Math.round(tokens / 1000) + "k";
  return tokens.toString();
};

// Build a progress bar
const buildBar = (percent, width = 10) => {
  const filled = Math.min(
    width,
    Math.max(0, Math.round((percent / 100) * width)),
  );
  return "█".repeat(filled) + "░".repeat(width - filled);
};

// Read JSON from stdin
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const homeDir = os.homedir();

    // === MODEL ===
    const modelName = data.model?.display_name || data.model?.name || "Claude";
    const modelIcon = modelName.toLowerCase().includes("opus")
      ? "🔮"
      : modelName.toLowerCase().includes("sonnet")
        ? "🎵"
        : "🤖";
    const modelDisplay = `${modelIcon} ${c.boldBlue}${modelName}${c.reset}`;

    // === FOLDER ===
    const dir = data.workspace?.current_dir || process.cwd();
    const dirname = dir.replace(homeDir, "~");
    const folderParts = dirname.split("/");
    const shortFolder =
      folderParts.length > 3 ? `…/${folderParts.slice(-2).join("/")}` : dirname;
    const folderDisplay = `${c.cyan}${shortFolder}${c.reset}`;

    // === CONTEXT WINDOW ===
    // Use Claude's provided remaining_percentage directly (it's accurate)
    const contextSize = data.context_window?.context_window_size || 200000;
    const remainingPercent = data.context_window?.remaining_percentage;
    let contextDisplay = "";

    if (remainingPercent != null) {
      // Calculate used from remaining (Claude provides remaining_percentage)
      const usedPercent = Math.round(100 - remainingPercent);
      const leftPercent = Math.round(remainingPercent);

      // Get actual token count for display
      const currentUsage = data.context_window?.current_usage;
      let usedTokens = 0;
      if (currentUsage) {
        usedTokens =
          (currentUsage.input_tokens || 0) +
          (currentUsage.output_tokens || 0) +
          (currentUsage.cache_read_input_tokens || 0) +
          (currentUsage.cache_creation_input_tokens || 0);
      }
      // If we don't have current_usage, estimate from percentage
      if (usedTokens === 0 && usedPercent > 0) {
        usedTokens = Math.round((usedPercent / 100) * contextSize);
      }

      const usedStr = formatTokens(usedTokens);
      const maxStr = formatTokens(contextSize);

      // Color the bar based on how much is LEFT (lower = worse)
      const bar = buildBar(usedPercent);
      let coloredBar;
      if (leftPercent > 50) {
        coloredBar = `${c.green}${bar}${c.reset}`;
      } else if (leftPercent > 20) {
        coloredBar = `${c.yellow}${bar}${c.reset}`;
      } else {
        coloredBar = `${c.red}${bar}${c.reset}`;
      }

      contextDisplay = `${c.yellow}Ctx:${c.reset} ${coloredBar} ${usedStr}/${maxStr} ${c.dim}(${usedPercent}% used,${c.reset} ${leftPercent > 50 ? c.green : leftPercent > 20 ? c.yellow : c.red}${leftPercent}% left${c.reset}${c.dim})${c.reset}`;
    } else {
      const maxStr = formatTokens(contextSize);
      const bar = buildBar(0);
      contextDisplay = `${c.yellow}Ctx:${c.reset} ${c.dim}${bar} 0/${maxStr} (new)${c.reset}`;
    }

    // === RATE LIMIT / USAGE STATUS ===
    // Check if there's rate limit info in the data
    let usageDisplay = "";
    const rateLimit = data.rate_limit || data.usage_limit;

    if (rateLimit) {
      // If Claude provides rate limit info, use it
      const used = rateLimit.used || 0;
      const limit = rateLimit.limit || 100;
      const usagePercent = Math.round((used / limit) * 100);
      const bar = buildBar(usagePercent);

      let coloredBar;
      if (usagePercent < 50) {
        coloredBar = `${c.green}${bar}${c.reset}`;
      } else if (usagePercent < 80) {
        coloredBar = `${c.yellow}${bar}${c.reset}`;
      } else {
        coloredBar = `${c.red}${bar}${c.reset}`;
      }

      usageDisplay = `${c.magenta}Limit:${c.reset} ${coloredBar} ${usagePercent}%`;
    } else {
      // Fall back to showing session token totals
      const totalInput = data.context_window?.total_input_tokens || 0;
      const totalOutput = data.context_window?.total_output_tokens || 0;
      const sessionTokens = totalInput + totalOutput;

      if (sessionTokens > 0) {
        usageDisplay = `${c.magenta}Session:${c.reset} ${c.dim}${formatTokens(sessionTokens)} tokens${c.reset}`;
      } else {
        // Read from stats-cache.json for today's usage
        try {
          const statsFile = path.join(homeDir, ".claude", "stats-cache.json");
          if (fs.existsSync(statsFile)) {
            const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
            const today = new Date().toISOString().split("T")[0];
            const todayStats = stats.dailyModelTokens?.find(
              (d) => d.date === today,
            );

            if (todayStats) {
              let todayTokens = 0;
              for (const model in todayStats.tokensByModel) {
                todayTokens += todayStats.tokensByModel[model] || 0;
              }
              usageDisplay = `${c.magenta}Today:${c.reset} ${c.dim}${formatTokens(todayTokens)} tokens${c.reset}`;
            }
          }
        } catch (e) {}

        if (!usageDisplay) {
          usageDisplay = `${c.dimGray}--${c.reset}`;
        }
      }
    }

    // === TASKS ===
    const session = data.session_id || "";
    let currentTask = "";
    let nextTask = "";
    const todosDir = path.join(homeDir, ".claude", "todos");

    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs
          .readdirSync(todosDir)
          .filter(
            (f) =>
              f.startsWith(session) &&
              f.includes("-agent-") &&
              f.endsWith(".json"),
          )
          .map((f) => ({
            name: f,
            mtime: fs.statSync(path.join(todosDir, f)).mtime,
          }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          const todos = JSON.parse(
            fs.readFileSync(path.join(todosDir, files[0].name), "utf8"),
          );
          const inProgress = todos.find((t) => t.status === "in_progress");
          const pending = todos.filter((t) => t.status === "pending");

          if (inProgress) {
            currentTask =
              inProgress.activeForm || inProgress.description || "In Progress";
            if (currentTask.length > 40)
              currentTask = currentTask.substring(0, 37) + "...";
          }
          if (pending.length > 0) {
            nextTask =
              pending[0].activeForm || pending[0].description || "Pending";
            if (nextTask.length > 30)
              nextTask = nextTask.substring(0, 27) + "...";
          }
        }
      } catch (e) {}
    }

    let tasksDisplay = "";
    if (currentTask && nextTask) {
      tasksDisplay = `${c.boldMagenta}▶ ${currentTask}${c.reset} ${c.cyan}→${c.reset} ${c.dimCyan}${nextTask}${c.reset}`;
    } else if (currentTask) {
      tasksDisplay = `${c.boldMagenta}▶ ${currentTask}${c.reset}`;
    } else if (nextTask) {
      tasksDisplay = `${c.cyan}Next:${c.reset} ${c.dimCyan}${nextTask}${c.reset}`;
    } else {
      tasksDisplay = `${c.dimGray}No tasks${c.reset}`;
    }

    // === GSD UPDATE CHECK ===
    let gsdUpdate = "";
    const cacheFile = path.join(
      homeDir,
      ".claude",
      "cache",
      "gsd-update-check.json",
    );
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (cache.update_available) {
          gsdUpdate = `${c.boldYellow}⬆${c.reset} ${sep} `;
        }
      } catch (e) {}
    }

    // === OUTPUT - Two lines ===
    // Line 1: Model | Folder | Tasks
    // Line 2: Context | Session
    const line1 = `${gsdUpdate}${modelDisplay} ${sep} ${folderDisplay} ${sep} ${tasksDisplay}`;
    const line2 = `${contextDisplay} ${sep} ${usageDisplay}`;

    process.stdout.write(`${line1}\n${line2}`);
  } catch (e) {
    // Silent fail
  }
});
