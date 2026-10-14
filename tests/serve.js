// Servidor estático mínimo para testes e desenvolvimento local (sem dependências).
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 4173;
const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
    '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain'
};

http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, url === '/' ? 'index.html' : url);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) { res.writeHead(404).end('404'); return; }
        const range = req.headers.range;
        const type = types[path.extname(file)] || 'application/octet-stream';
        if (range) {
            const [s, e] = range.replace('bytes=', '').split('-');
            const start = Number(s), end = e ? Number(e) : stat.size - 1;
            res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
            fs.createReadStream(file, { start, end }).pipe(res);
        } else {
            res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' });
            fs.createReadStream(file).pipe(res);
        }
    });
}).listen(port, () => console.log(`http://localhost:${port}`));
