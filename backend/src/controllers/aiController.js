const { query } = require('../config/db');

// In-memory rate limiter: max 5 requests per user per hour
const rateLimitMap = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count += 1;
  return true;
};

const summarizeProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Maximum 5 AI requests per hour.',
      });
    }

    const projectResult = await query(
      'SELECT id, name FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({ error: 'Project not found or access denied' });
    }

    const project = projectResult.rows[0];

    const tasksResult = await query(
      'SELECT title, description, status FROM tasks WHERE project_id = $1 ORDER BY status, created_at',
      [projectId]
    );

    const tasks = tasksResult.rows;

    if (tasks.length === 0) {
      return res.json({
        summary: 'No tasks yet. Add tasks to get AI insights.',
        tasksAnalyzed: 0,
        projectName: project.name,
      });
    }

    const taskList = tasks
      .map(t => `- [${t.status.toUpperCase()}] ${t.title}: ${t.description || 'No description'}`)
      .join('\n');

    const prompt = `You are a project management assistant. Analyze these tasks and provide a concise, actionable summary.

Project: ${project.name}

Tasks:
${taskList}

Provide a summary with:
1. Overall project health (1 sentence)
2. What's blocking progress (if any)
3. Recommended next 3 actions
4. Completion percentage estimate

Be direct and actionable. Maximum 150 words.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let summary;
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errBody = await response.text();
        if (process.env.NODE_ENV !== 'production') {
          console.error('Anthropic API error:', response.status, errBody);
        }
        return res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again later.',
        });
      }

      const data = await response.json();
      summary = data.content[0].text;
    } catch (error) {
      clearTimeout(timeout);
      // Log full error server-side only — never send to client
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AI Controller Error]', error.message);
      }
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        return res.status(504).json({
          error: 'AI service timed out. Please try again.',
        });
      }
      if (error.status === 429) {
        return res.status(429).json({
          error: 'AI rate limit reached. Please wait a moment.',
        });
      }
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Please try again later.',
      });
    }

    res.json({ summary, tasksAnalyzed: tasks.length, projectName: project.name });
  } catch (err) {
    next(err);
  }
};

module.exports = { summarizeProject };
