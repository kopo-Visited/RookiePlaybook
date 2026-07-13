// 페이지네이션 번호 창을 만든다.
// 처음(1)·끝(total)과 현재 페이지 주변(±span)만 노출하고, 끊기는 구간은 '…'로 표시한다.
// 예: pageWindow(20, 39) → [1, '…', 19, 20, 21, '…', 39]
export function pageWindow(page, total, span = 1) {
  const set = new Set([1, total]);
  for (let i = page - span; i <= page + span; i += 1) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}
