#!/bin/bash
# usage: verify.sh BASEURL [curl extra args...]
B=$1; shift
fail=0
for p in $(node -e "require(process.cwd()+'/files.json').forEach(f=>console.log(f.path))"); do
  local_md5=$(md5sum "${SITE:-$(dirname "$0")/..}$p" | cut -d' ' -f1)
  remote=$(curl -sS "$@" "$B$p" -o /tmp/vf -w '%{http_code} %{content_type}'); rmd5=$(md5sum /tmp/vf|cut -d' ' -f1)
  [[ "$local_md5" == "$rmd5" ]] && ok=OK || { ok=MISMATCH; fail=1; }
  echo "$ok $remote $p"
done
echo "FAIL=$fail"
