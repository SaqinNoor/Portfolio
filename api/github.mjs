const GITHUB_API = 'https://api.github.com';
const USERNAME = 'SaqinNoor';
const PER_PAGE = 15;

export default async function handler(req, res) {
  const page = parseInt(req.query.page, 10) || 1;

  const hasToken = !!process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'portfolio-github-feed/1.0',
    ...(hasToken && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
  };

  try {
    const endpoint = `${GITHUB_API}/users/${USERNAME}/${hasToken ? 'events' : 'events/public'}?page=${page}&per_page=${PER_PAGE}`;

    let data;

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const cacheKey = `github_events_${page}`;
      const kvUrl = `${process.env.KV_REST_API_URL}/get/${cacheKey}`;

      try {
        const kvRes = await fetch(kvUrl, {
          headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        });
        const kvBody = await kvRes.json();
        if (kvBody.result) {
          data = JSON.parse(kvBody.result);
        }
      } catch {
        // KV miss or error — fall through to API fetch
      }
    }

    if (!data) {
      const apiRes = await fetch(endpoint, { headers });
      if (!apiRes.ok) {
        const errBody = await apiRes.text();
        return res.status(apiRes.status).json({
          error: `GitHub API responded with ${apiRes.status}`,
          detail: errBody,
        });
      }
      data = await apiRes.json();

      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const cacheKey = `github_events_${page}`;
        const kvUrl = `${process.env.KV_REST_API_URL}/set/${cacheKey}/300`;
        try {
          await fetch(kvUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
        } catch {
          // cache write failure is non-fatal
        }
      }
    }

    const events = data.map(ev => ({
      id: ev.id,
      type: ev.type,
      repo: ev.repo.name,
      url: ev.repo.url.replace('api.github.com/repos', 'github.com'),
      timestamp: ev.created_at,
      payload: extractPayload(ev, hasToken),
    }));

    const hasMore = data.length === PER_PAGE;

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');
    return res.status(200).json({ events, page, hasMore });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

function extractPayload(ev, isAuthed) {
  switch (ev.type) {
    case 'PushEvent': {
      const commits = (ev.payload.commits || []).slice(0, 3);
      const full = isAuthed && commits.length > 0;
      return {
        action: 'pushed',
        full,
        count: ev.payload.size || 0,
        commits: full ? commits.map(c => ({
          message: c.message.split('\n')[0],
          url: `https://github.com/${ev.repo.name}/commit/${c.sha}`,
        })) : [],
        branch: (ev.payload.ref || '').replace('refs/heads/', ''),
        head: full ? '' : (ev.payload.head || '').slice(0, 7),
      };
    }
    case 'WatchEvent':
      return { action: 'starred' };
    case 'ForkEvent':
      return { action: 'forked', forkUrl: ev.payload.forkee?.html_url };
    case 'PullRequestEvent': {
      const pr = ev.payload.pull_request;
      return {
        action: ev.payload.action,
        number: ev.payload.number,
        title: pr?.title,
        url: pr?.html_url,
        state: pr?.state,
        merged: pr?.merged,
      };
    }
    case 'IssuesEvent': {
      const issue = ev.payload.issue;
      return {
        action: ev.payload.action,
        title: issue?.title,
        url: issue?.html_url,
        state: issue?.state,
      };
    }
    case 'CreateEvent':
      return { action: 'created', refType: ev.payload.ref_type, ref: ev.payload.ref };
    case 'DeleteEvent':
      return { action: 'deleted', refType: ev.payload.ref_type, ref: ev.payload.ref };
    case 'MemberEvent':
      return { action: ev.payload.action, member: ev.payload.member?.login };
    case 'PublicEvent':
      return { action: 'made public' };
    case 'ReleaseEvent':
      return { action: 'released', tag: ev.payload.release?.tag_name, url: ev.payload.release?.html_url };
    default:
      return { action: ev.type };
  }
}
