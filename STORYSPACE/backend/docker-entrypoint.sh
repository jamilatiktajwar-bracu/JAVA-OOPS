#!/bin/sh
set -eu
# Render supplies postgres:// URLs; Spring expects jdbc:postgresql://.
if [ -n "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="$(python3 - <<'PY'
import os
from urllib.parse import urlparse
raw = os.environ.get("DATABASE_URL", "")
if raw.startswith("jdbc:"):
    print(raw)
elif raw.startswith(("postgres://", "postgresql://")):
    u = urlparse(raw)
    host = u.hostname or ""
    port = u.port or 5432
    db = (u.path or "/").lstrip("/")
    suffix = ("?" + u.query) if u.query else ""
    print(f"jdbc:postgresql://{host}:{port}/{db}{suffix}")
else:
    print(raw)
PY
)"
fi
exec java -XX:MaxRAMPercentage=75 -jar /app/storyspace.jar
