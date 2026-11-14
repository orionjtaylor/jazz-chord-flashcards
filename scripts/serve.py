#!/usr/bin/env python3
"""Local test server that behaves like GitHub Pages.

/learn serves learn.html, /library serves library.html, and unknown paths get 404.html
(with a 404 status), so routing and the generated pages can be tested before deploying.
Binds to 127.0.0.1 only.

    python3 scripts/serve.py          # then open http://127.0.0.1:8765
"""
import http.server, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        fs = os.path.join(ROOT, path.lstrip('/'))
        if path != '/' and not os.path.exists(fs) and os.path.exists(fs.rstrip('/') + '.html'):
            self.path = path.rstrip('/') + '.html'
        elif path != '/' and not os.path.exists(fs):
            body = open(os.path.join(ROOT, '404.html'), 'rb').read()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()

    def log_message(self, *a):
        pass

print(f'Serving {ROOT} at http://127.0.0.1:{PORT}')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
