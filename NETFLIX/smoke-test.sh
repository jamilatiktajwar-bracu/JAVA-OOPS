#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
cleanup() { rm -f -- *.class; }
trap cleanup EXIT
javac -Xlint:all *.java
java NetflixSmokeTest
java NETFLIX_DEMO > /tmp/netflix-demo-smoke.log
grep -q "===== NETFLIX DEMO =====" /tmp/netflix-demo-smoke.log
grep -q "Recommendation engine:" /tmp/netflix-demo-smoke.log
echo "NETFLIX_DEMO_SMOKE_OK"
