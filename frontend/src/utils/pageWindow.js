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

// 현재 페이지부터 시작하는 연속 window(size개)만 만든다. (마지막 페이지/구분자 없음)
// 예: slidingPageWindow(1, 39) → [1,2,3,4,5]
//     slidingPageWindow(2, 39) → [2,3,4,5,6]
// 끝쪽에서는 window가 꽉 차도록 시작점을 당긴다. 전체가 size보다 적으면 있는 만큼만.
export function slidingPageWindow(page, total, size = 5) {
  const count = Math.min(size, total);
  let start = Math.min(page, total - count + 1);
  if (start < 1) start = 1;
  return Array.from({ length: count }, (_, i) => start + i);
}
