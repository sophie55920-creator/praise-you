// ==============================================================================
// server.js (로컬 개발 및 미리보기용 간이 서버)
// 설명: Vercel CLI 로그인 없이도 내 컴퓨터 브라우저에서 웹사이트를 즉시 열어볼 수 있도록
//       정적 파일(HTML/CSS/JS)과 서버리스 함수(/api)를 로컬에서 실행해 주는 서버입니다.
// ==============================================================================

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// API 핸들러 불러오기
const praiseHandler = require('./api/praise');
const feedbackHandler = require('./api/feedback');
const quoteHandler = require('./api/quote');

// MIME 타입 매핑
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // 헬퍼: JSON 응답 함수
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  };

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. API 라우팅 처리 (/api/...)
  if (pathname.startsWith('/api/')) {
    // 요청 본문(body) 수집
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      if (bodyData) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      try {
        if (pathname === '/api/praise') {
          return await praiseHandler(req, res);
        } else if (pathname === '/api/feedback') {
          return await feedbackHandler(req, res);
        } else if (pathname === '/api/quote') {
          return await quoteHandler(req, res);
        } else {
          return res.status(404).json({ success: false, message: 'API 경로를 찾을 수 없습니다.' });
        }
      } catch (err) {
        console.error('API Error:', err);
        return res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
      }
    });
    return;
  }

  // 2. 정적 파일 라우팅 처리 (public/...)
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.join(__dirname, 'public', filePath);

  // 보안 검증 (상위 디렉터리 접근 방지)
  if (!safePath.startsWith(path.join(__dirname, 'public'))) {
    res.statusCode = 403;
    return res.end('Access denied');
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('404 Not Found');
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`🌸 [너를 칭찬해] 로컬 개발 서버가 시작되었습니다!`);
  console.log(`👉 브라우저 접속 주소: http://localhost:${PORT}`);
});

