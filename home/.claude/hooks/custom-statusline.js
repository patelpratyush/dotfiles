#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  try {
    const j = JSON.parse(input);
    const parts = [];
    const home = os.homedir();

    // ANSI colors
    const C = {
      reset: '\x1b[0m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
      cyan: '\x1b[36m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      orange: '\x1b[38;5;208m',
      red: '\x1b[31m',
      magenta: '\x1b[35m',
      gold: '\x1b[33;1m',
      white: '\x1b[37m',
    };

    const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(0) + 'k' : String(n));

    // 1. Model (cyan)
    const model = (j.model?.display_name || 'Claude').replace(/^Claude\s+/, '');
    parts.push(`${C.cyan}[${model}]${C.reset}`);

    // 2. Folder from root (pwd-style: ../../sapn or apps/web)
    const currentDir = j.workspace?.current_dir || j.cwd || process.cwd();
    const projectDir = j.workspace?.project_dir || currentDir;
    let folderDisplay = '~';
    if (currentDir && projectDir) {
      try {
        const rel = path.relative(projectDir, currentDir);
        if (rel === '' || rel === '.') {
          folderDisplay = path.basename(projectDir);
        } else if (rel.startsWith('..')) {
          // Outside project: show ../../basename (pwd-style)
          folderDisplay = '../../' + path.basename(currentDir);
        } else {
          folderDisplay = rel;
        }
      } catch {
        folderDisplay = path.basename(currentDir);
      }
    } else {
      const segs = currentDir.split(path.sep).filter(Boolean);
      folderDisplay = segs.length > 2 ? '../../' + (segs.slice(-1)[0] || '').slice(0, 12) : segs.slice(-1)[0] || '~';
    }
    parts.push(`${C.dim}${folderDisplay}${C.reset}`);

    // 3. Context: progress bar + 100k/200k + 50% used 50% left
    const ctx = j.context_window;
    const usedPct = ctx?.used_percentage ?? null;
    const remainPct = ctx?.remaining_percentage ?? (usedPct != null ? 100 - usedPct : null);
    const ctxSize = ctx?.context_window_size ?? 200000;
    const usage = ctx?.current_usage;

    if (usedPct != null || usage) {
      const u = Math.min(100, Math.round(usedPct ?? 0));
      const r = Math.min(100, Math.round(remainPct ?? 100 - u));

      // Token counts: prefer current_usage for "current" context, else approximate from percentage
      let usedTokens = 0;
      let totalTokens = ctxSize;
      if (usage) {
        usedTokens =
          (usage.input_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0);
      } else {
        usedTokens = Math.round((u / 100) * ctxSize);
      }
      const remainingTokens = Math.max(0, ctxSize - usedTokens);

      // Progress bar
      const barWidth = 10;
      const filled = Math.min(barWidth, Math.round((u / 100) * barWidth));
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

      // Color by usage: green < 50%, yellow 50–70%, orange 70–90%, red 90%+
      let barColor = C.green;
      if (u >= 90) barColor = C.red;
      else if (u >= 70) barColor = C.orange;
      else if (u >= 50) barColor = C.yellow;

      const ctxStr = `${barColor}${bar}${C.reset} ${C.dim}${fmt(usedTokens)}/${fmt(totalTokens)}${C.reset} ${barColor}${u}% used${C.reset} ${C.green}${r}% left${C.reset}`;
      parts.push(ctxStr);
    }

    // 4. Current chat cost (cost.total_cost_usd from docs; fallback session.cost_usd)
    const cost = j.cost?.total_cost_usd ?? j.session?.cost_usd ?? null;
    if (cost != null) {
      const costStr = cost < 1 ? (cost * 100).toFixed(0) + '¢' : '$' + cost.toFixed(2);
      parts.push(`${C.gold}${costStr}${C.reset}`);
    }

    // 5. Optional: active task/form (magenta)
    const sid = j.session_id || '';
    const todosDir = path.join(home, '.claude', 'todos');
    if (sid && fs.existsSync(todosDir)) {
      try {
        const files = fs
          .readdirSync(todosDir)
          .filter((f) => f.startsWith(sid) && f.includes('-agent-') && f.endsWith('.json'))
          .sort((a, b) => fs.statSync(path.join(todosDir, b)).mtime - fs.statSync(path.join(todosDir, a)).mtime);
        if (files.length) {
          const todo = JSON.parse(fs.readFileSync(path.join(todosDir, files[0]), 'utf8')).find((t) => t.status === 'in_progress');
          if (todo?.activeForm) parts.push(`${C.magenta}${todo.activeForm}${C.reset}`);
        }
      } catch {}
    }

    process.stdout.write(parts.join(' │ '));
  } catch (e) {
    process.stdout.write('');
  }
});
