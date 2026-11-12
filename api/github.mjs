const GITHUB_API = 'https://api.github.com';
const USERNAME = 'SaqinNoor';
const PER_PAGE = 15;       // feed page size
const MAX_ITEMS = 60;      // total feed depth (4 pages)
const COMMIT_REPOS = 4;    // recently-pushed repos scanned for commits
const LOOKBACK_DAYS = 90;  // commit lookback window

// NOTE: The GitHub Events API (/users/:user/events, Atom feed) stopped emitting
// events for this account entirely (verified 2026-11-12: pushes produced no
// events, while other accounts stream normally). Since GitHub's Oct 2025
// payload reduction it also strips `pull_request` and commit lists from event
// payloads. The feed therefore no longer uses the Events API at all — it is
// built from sources that keep working: the Search API (PRs, issues) and
// per-repo commit history (pushes).

export default async function handler(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const scope = req.query.scope || 'events';

  const hasToken = !!process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'portfolio-github-feed/1.0',
    Accept: 'application/vnd.github+json',
    ...(hasToken && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
  };

  try {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300');

    const repos = await fetchRepos(headers);

    if (scope === 'full') {
      const feed = await buildFeed(headers, 1, repos);
      return res.status(200).json({
        stats: computeStats(repos),
        languages: computeLanguages(repos),
        topRepos: computeTopRepos(repos),
        events: feed.events,
        hasMore: feed.hasMore,
      });
    }

    const feed = await buildFeed(headers, page, repos);
    return res.status(200).json({ events: feed.events, page, hasMore: feed.hasMore });
  } catch (err) {
    const status = err.status && err.status >= 400 ? err.status : 500;
    return res.status(status).json({ error: 'GitHub feed error', detail: err.message });
  }
}

function fail(res, name) {
  const err = new Error(`${name} API responded with ${res.status}`);
  err.status = res.status;
  return err;
}

async function fetchRepos(headers) {
  const res = await fetch(`${GITHUB_API}/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers });
  if (!res.ok) throw fail(res, 'repos');
  return res.json();
}

function apiRepoName(item) {
  return (item.repository_url || '').replace('https://api.github.com/repos/', '');
}

function feedItemFromSearchPr(pr) {
  return {
    id: `pr-${pr.id}`,
    type: 'PullRequestEvent',
    repo: apiRepoName(pr),
    url: pr.html_url,
    timestamp: pr.created_at,
    payload: {
      action: pr.state === 'closed' ? 'closed' : 'opened',
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      merged: !!(pr.pull_request && pr.pull_request.merged_at),
    },
  };
}

function feedItemFromSearchIssue(issue) {
  return {
    id: `issue-${issue.id}`,
    type: 'IssuesEvent',
    repo: apiRepoName(issue),
    url: issue.html_url,
    timestamp: issue.created_at,
    payload: {
      action: issue.state === 'closed' ? 'closed' : 'opened',
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
    },
  };
}

function feedItemFromCommit(commit, repoFullName) {
  return {
    id: `commit-${commit.sha}`,
    type: 'CommitEvent',
    repo: repoFullName,
    url: `https://github.com/${repoFullName}`,
    timestamp: commit.commit.author.date,
    payload: {
      message: (commit.commit.message || '').split('\n')[0],
      url: commit.html_url,
      sha: (commit.sha || '').slice(0, 7),
    },
  };
}

async function buildFeed(headers, page, repos) {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString();
  const commitRepos = repos.filter(r => !r.fork && !r.archived).slice(0, COMMIT_REPOS);

  const [prsRes, issuesRes, ...commitResList] = await Promise.all([
    fetch(`${GITHUB_API}/search/issues?q=author:${USERNAME}+type:pr&sort=created&order=desc&per_page=30`, { headers }),
    fetch(`${GITHUB_API}/search/issues?q=author:${USERNAME}+type:issue&sort=created&order=desc&per_page=30`, { headers }),
    ...commitRepos.map(r =>
      fetch(`${GITHUB_API}/repos/${r.full_name}/commits?author=${USERNAME}&per_page=15&since=${since}`, { headers })),
  ]);

  if (!prsRes.ok) throw fail(prsRes, 'PR search');
  if (!issuesRes.ok) throw fail(issuesRes, 'issue search');

  const [prs, issues, ...commitLists] = await Promise.all([
    prsRes.json(),
    issuesRes.json(),
    ...commitResList.map(r => (r.ok ? r.json() : [])),
  ]);

  const items = [
    ...(prs.items || []).map(feedItemFromSearchPr),
    ...(issues.items || []).map(feedItemFromSearchIssue),
  ];

  commitResList.forEach((_, i) => {
    const repoFullName = commitRepos[i].full_name;
    (Array.isArray(commitLists[i]) ? commitLists[i] : []).forEach(c => {
      if (c && c.commit && c.commit.author && c.commit.author.date) {
        items.push(feedItemFromCommit(c, repoFullName));
      }
    });
  });

  items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const all = items.slice(0, MAX_ITEMS);
  const start = (page - 1) * PER_PAGE;
  const events = all.slice(start, start + PER_PAGE);
  return {
    events,
    hasMore: start + events.length < all.length,
  };
}

function computeStats(repos) {
  return {
    totalRepos: repos.length,
    totalStars: repos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
    totalForks: repos.reduce((s, r) => s + (r.forks_count || 0), 0),
    languageCount: computeLanguages(repos).length,
  };
}

function computeLanguages(repos) {
  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });
  const totalLangRepos = Object.values(langMap).reduce((a, b) => a + b, 0);
  return Object.entries(langMap)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / totalLangRepos) * 100) }))
    .sort((a, b) => b.count - a.count);
}

function computeTopRepos(repos) {
  return repos
    .filter(r => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      language: r.language,
      url: r.html_url,
      description: r.description,
    }));
}
