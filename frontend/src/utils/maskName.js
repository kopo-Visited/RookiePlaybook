// 이름을 성 1글자만 남기고 마스킹한다. (김연동 → 김**, 이수 → 이*, 1글자·빈값은 그대로)
export function maskName(name) {
  if (!name) return '-';
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}

// 내 글이면 실명, 아니면 마스킹. (writerId === 내 userId 비교)
export function displayWriter(writerName, writerId, myId) {
  if (writerId != null && myId != null && writerId === myId) return writerName ?? '-';
  return maskName(writerName);
}
