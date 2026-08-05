from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT / "frontend" / "dist"
HOST = "127.0.0.1"
PORT = 5173


class SpaHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        requested = Path(parsed.path.lstrip("/"))
        candidate = (DIST_DIR / requested).resolve()

        if parsed.path.startswith("/assets/") or candidate.exists():
            return super().do_GET()

        self.path = "/index.html"
        return super().do_GET()


def main() -> None:
    if not DIST_DIR.exists():
        raise SystemExit(
            f"Frontend build not found at {DIST_DIR}. Run `npm run build` first."
        )

    handler = partial(SpaHandler, directory=str(DIST_DIR))
    server = ThreadingHTTPServer((HOST, PORT), handler)
    print(f"Serving frontend build from {DIST_DIR} on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
