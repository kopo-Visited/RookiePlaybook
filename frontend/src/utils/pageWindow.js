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

// 현재 페이지부터 시작하는 연속 window(size개)를 만들고 마지막 페이지를 항상 붙인다.
// 예: slidingPageWindow(1, 39) → [1,2,3,4,5,'…',39]
//     slidingPageWindow(2, 39) → [2,3,4,5,6,'…',39]
// 페이지가 적으면(size+1 이하) 전체를 그대로 나열한다.
export function slidingPageWindow(page, total, size = 5) {
  if (total <= size + 1) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  // 현재 페이지를 왼쪽 끝에 두되, 끝쪽에서는 window가 꽉 차도록 시작점을 당긴다.
  let start = Math.min(page, total - size + 1);
  if (start < 1) start = 1;
  const out = [];
  for (let i = start; i < start + size; i += 1) out.push(i);
  const last = out[out.length - 1];
  if (last < total) {
    if (last < total - 1) out.push('…');
    out.push(total);
  }
  return out;
}
