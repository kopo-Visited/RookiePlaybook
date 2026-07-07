/**
 * ISO 날짜 문자열을 YYYY.MM.DD 형식으로 변환한다.
 * 백엔드 응답의 createdAt/updatedAt은 ISO 8601 UTC 기준이므로
 * 화면 표시 시 KST(+9h)로 변환한다.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = kst.getUTCFullYear();
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
