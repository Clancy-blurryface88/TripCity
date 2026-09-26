/** Best-effort text from a digital PDF, in the browser, no libraries. Scanned PDFs return little or nothing (they need OCR). */
async function inflate(bytes: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === 'undefined') return null;
  try {
    const ds = new DecompressionStream('deflate');
    const out = new Response(new Blob([bytes.slice() as Uint8Array<ArrayBuffer>]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  } catch {
    return null;
  }
}

function unescapePdf(s: string): string {
  return s.replace(/\\([nrtbf()\\]|\d{1,3})/g, (_, c: string) => {
    if (/\d/.test(c)) return String.fromCharCode(parseInt(c, 8));
    return ({ n: '\n', r: '\r', t: '\t', b: '', f: '' } as Record<string, string>)[c] ?? c;
  });
}

function textOps(content: string): string {
  const out: string[] = [];
  for (const line of content.split(/\n/)) {
    if (/T[dD*]|ET|T\*|'/.test(line)) out.push('\n');
    for (const m of line.matchAll(/\((?:\\.|[^\\)])*\)|<([0-9A-Fa-f\s]+)>/g)) {
      if (m[0].startsWith('(')) out.push(unescapePdf(m[0].slice(1, -1)));
      else if (m[1] && m[1].replace(/\s/g, '').length % 2 === 0 && /Tj|TJ/.test(line)) {
        const hex = m[1].replace(/\s/g, '');
        let s = '';
        for (let i = 0; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
        if (/^[\x20-\x7e]+$/.test(s)) out.push(s);
      }
    }
  }
  return out.join('').replace(/\n{2,}/g, '\n');
}

export async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  const latin = new TextDecoder('latin1').decode(bytes);
  const chunks: string[] = [];
  const re = /<<([\s\S]{0,400}?)>>\s*stream\r?\n/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(latin))) {
    const start = m.index + m[0].length;
    const end = latin.indexOf('endstream', start);
    if (end < 0) break;
    const dict = m[1];
    if (/\/Subtype\s*\/Image|\/XObject|\/FontFile/.test(dict)) continue;
    let data: Uint8Array | null = bytes.subarray(start, end);
    if (/FlateDecode/.test(dict)) data = await inflate(data);
    else if (/\/Filter/.test(dict)) continue;
    if (!data) continue;
    const s = new TextDecoder('latin1').decode(data);
    if (/BT[\s\S]*ET/.test(s)) chunks.push(textOps(s));
    re.lastIndex = end;
  }
  return chunks.join('\n').trim();
}
