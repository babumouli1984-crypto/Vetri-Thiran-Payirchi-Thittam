// Lightweight request sanitization:
//  - strips keys beginning with "$" or containing "." (NoSQL operator injection)
//  - escapes "<" and ">" in strings (basic XSS hardening)
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);

  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = clean(value[key]);
    }
    return out;
  }

  if (typeof value === 'string') {
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    const cleaned = clean(req.query);
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, cleaned);
  }
  next();
};

module.exports = sanitize;
