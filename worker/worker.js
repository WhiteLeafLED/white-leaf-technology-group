// White Leaf site Worker. Static files are served by Workers static assets (env.ASSETS),
// which still applies _headers, _redirects and 404.html. This code only:
//  1. sends the bare domain (whiteleafled.net) to https://www.whiteleafled.net with a 301;
//  2. adds HTTP Range (206) support for /media/* so Safari/iPhone can play the videos.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'whiteleafled.net') {
      return Response.redirect('https://www.whiteleafled.net' + url.pathname + url.search, 301);
    }
    const res = await env.ASSETS.fetch(request);
    if (!url.pathname.startsWith('/media/')) return res;
    const range = request.headers.get('Range');
    if (res.status !== 200) return res;
    const headers = new Headers(res.headers);
    headers.set('Accept-Ranges', 'bytes');
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === '' && m[2] === '')) {
      return new Response(res.body, { status: 200, headers });
    }
    let size = Number(res.headers.get('Content-Length'));
    if (!size) {
      // Asset responses may not carry Content-Length; files are under 25 MiB, so buffer and slice.
      const buf = new Uint8Array(await res.arrayBuffer());
      size = buf.length;
      let s, e;
      if (m[1] === '') { s = Math.max(0, size - Number(m[2])); e = size - 1; }
      else { s = Number(m[1]); e = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
      headers.delete('Content-Encoding');
      if (s >= size || s > e) { headers.set('Content-Range', `bytes */${size}`); headers.delete('Content-Length'); return new Response(null, { status: 416, headers }); }
      headers.set('Content-Range', `bytes ${s}-${e}/${size}`);
      headers.set('Content-Length', String(e - s + 1));
      return new Response(request.method === 'HEAD' ? null : buf.slice(s, e + 1), { status: 206, headers });
    }
    let start, end;
    if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }
    else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
    if (start >= size || start > end) {
      if (res.body) res.body.cancel();
      headers.set('Content-Range', `bytes */${size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    if (request.method === 'HEAD' || !res.body) {
      if (res.body) res.body.cancel();
      return new Response(null, { status: 206, headers });
    }
    // Stream only the requested slice of the file.
    let pos = 0;
    const want = end - start + 1;
    let sent = 0;
    const reader = res.body.getReader();
    const body = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.close(); return; }
          const chunkStart = pos, chunkEnd = pos + value.length;
          pos = chunkEnd;
          if (chunkEnd <= start) continue;
          const from = Math.max(0, start - chunkStart);
          const to = Math.min(value.length, from + (want - sent));
          const piece = value.subarray(from, to);
          sent += piece.length;
          controller.enqueue(piece);
          if (sent >= want) { controller.close(); reader.cancel(); }
          return;
        }
      },
      cancel() { reader.cancel(); }
    });
    return new Response(body, { status: 206, headers });
  }
};
