export const INQUIRY_TYPES = [
  { value: 'PERMISSION', label: '권한 오류' },
  { value: 'SERVICE', label: '서비스 불편사항' },
  { value: 'ACCOUNT', label: '계정 문의' },
  { value: 'ETC', label: '기타' },
];

export const INQUIRY_TYPE_LABEL = INQUIRY_TYPES.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {}
);
