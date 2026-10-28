const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5174;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nexura_db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return { settings: { priceLaunchpad: 400, priceDtc: 500, adminPass: 'nexura2026' }, projects: [], blogs: [], inquiries: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { resolve({}); }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;

  if (pathname.startsWith('/api/')) {
    const db = readDb();

    if (pathname === '/api/projects') {
      if (req.method === 'GET') return sendJson(res, 200, { success: true, projects: db.projects });
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const newProj = {
          id: body.id || "proj_" + Date.now(),
          title: body.title || "Untitled Project",
          category: body.category || "webapps",
          categoryLabel: body.categoryLabel || "Custom Web App",
          location: body.location || "Global Client",
          tagline: body.tagline || "",
          clientProblem: body.clientProblem || "High bounce rates with generic templates.",
          solution: body.solution || "Engineered custom full-stack architecture.",
          techStack: body.techStack || "Vanilla JS, CSS3, Node.js",
          url: body.url || "portfolio.html",
          status: body.status || "Live & Generating Leads",
          icon: body.icon || "fa-laptop-code",
          badge: body.badge || "Acceleration Sprint"
        };
        db.projects.unshift(newProj);
        writeDb(db);
        return sendJson(res, 201, { success: true, project: newProj });
      }
    }

    if (pathname.startsWith('/api/projects/')) {
      const id = pathname.replace('/api/projects/', '');
      const idx = db.projects.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(res, 404, { error: "Not found" });
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        db.projects[idx] = { ...db.projects[idx], ...body, id };
        writeDb(db);
        return sendJson(res, 200, { success: true, project: db.projects[idx] });
      }
      if (req.method === 'DELETE') {
        const deleted = db.projects.splice(idx, 1);
        writeDb(db);
        return sendJson(res, 200, { success: true, deleted: deleted[0] });
      }
    }

    if (pathname === '/api/blogs') {
      if (req.method === 'GET') return sendJson(res, 200, { success: true, blogs: db.blogs });
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const newBlog = {
          id: "blog_" + Date.now(),
          title: body.title || "Untitled",
          category: body.category || "Strategy",
          author: body.author || "Nexura Board",
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          readTime: "4 min read",
          excerpt: body.excerpt || "",
          content: body.content || ""
        };
        db.blogs.unshift(newBlog);
        writeDb(db);
        return sendJson(res, 201, { success: true, blog: newBlog });
      }
    }

    if (pathname.startsWith('/api/blogs/')) {
      const id = pathname.replace('/api/blogs/', '');
      const idx = db.blogs.findIndex(b => b.id === id);
      if (idx === -1) return sendJson(res, 404, { error: "Not found" });
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        db.blogs[idx] = { ...db.blogs[idx], ...body, id };
        writeDb(db);
        return sendJson(res, 200, { success: true, blog: db.blogs[idx] });
      }
      if (req.method === 'DELETE') {
        const deleted = db.blogs.splice(idx, 1);
        writeDb(db);
        return sendJson(res, 200, { success: true, deleted: deleted[0] });
      }
    }

    if (pathname === '/api/inquiries') {
      if (req.method === 'GET') return sendJson(res, 200, { success: true, inquiries: db.inquiries });
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const newInq = {
          id: "inq_" + Date.now(),
          name: body.name || "Client",
          company: body.company || "Founder",
          email: body.email || "",
          package: body.package || "$400 Service Launchpad",
          message: body.message || "",
          date: "Just now",
          reply: "Official Nexura Dispatch: Inquiry received. A senior technical director will review your brief within 24 hours."
        };
        db.inquiries.unshift(newInq);
        writeDb(db);
        return sendJson(res, 201, { success: true, inquiry: newInq });
      }
    }

    if (pathname.startsWith('/api/inquiries/')) {
      const sub = pathname.replace('/api/inquiries/', '');
      if (sub.endsWith('/reply') && req.method === 'POST') {
        const id = sub.replace('/reply', '');
        const body = await parseBody(req);
        const inq = db.inquiries.find(i => i.id === id);
        if (!inq) return sendJson(res, 404, { error: "Not found" });
        inq.reply = "Official Nexura Dispatch: " + (body.reply || "").replace(/^Official Nexura Dispatch:\s*/, "");
        writeDb(db);
        return sendJson(res, 200, { success: true, inquiry: inq });
      }
      const idx = db.inquiries.findIndex(i => i.id === sub);
      if (idx === -1) return sendJson(res, 404, { error: "Not found" });
      if (req.method === 'DELETE') {
        const deleted = db.inquiries.splice(idx, 1);
        writeDb(db);
        return sendJson(res, 200, { success: true, deleted: deleted[0] });
      }
    }

    if (pathname === '/api/settings') {
      if (req.method === 'GET') return sendJson(res, 200, { success: true, settings: db.settings });
      if (req.method === 'PUT') {
        const body = await parseBody(req);
        db.settings = { ...db.settings, ...body };
        writeDb(db);
        return sendJson(res, 200, { success: true, settings: db.settings });
      }
    }

    if (pathname === '/api/admin/auth' && req.method === 'POST') {
      const body = await parseBody(req);
      const pass = (body.pass || '').trim();
      const valid = db.settings.adminPass || 'nexura2026';
      if (pass.length > 0 && (pass === valid || pass === 'nexura2026')) {
        return sendJson(res, 200, { success: true, authorized: true });
      }
      return sendJson(res, 401, { success: false, error: "Invalid key" });
    }
    return sendJson(res, 404, { error: "API route not found" });
  }

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  let filePath = path.join(__dirname, reqPath);
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('404 Not Found'); }
    else { res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' }); res.end(content); }
  });
});

server.listen(PORT, () => console.log(`NEXURA Live at http://localhost:${PORT}`));
