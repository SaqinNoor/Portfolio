import url from 'url';
import githubHandler from './github.mjs';
import contactHandler from './contact.mjs';

const routes = {
  '/api/github': githubHandler,
  '/api/contact': contactHandler,
};

export function createServer() {
  return async (req, res, next) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    req.query = parsed.query || {};

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const body = Buffer.concat(buffers).toString();
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
    }

    res.json = function (body) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };

    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    try {
      const handler = routes[pathname];
      if (handler) {
        await handler(req, res);
      } else {
        res.statusCode = 404;
        res.json({ error: 'Not found' });
      }
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: 'Internal server error', detail: err.message });
    }
  };
}
