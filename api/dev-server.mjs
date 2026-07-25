import url from 'url';
import handler from './github.mjs';

export function createServer() {
  return async (req, res, next) => {
    const parsed = url.parse(req.url, true);
    req.query = parsed.query || {};

    const originalJson = res.json;
    res.json = function (body) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };

    const originalStatus = res.status;
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    try {
      await handler(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error', detail: err.message }));
    }
  };
}
