import { isBlank, hasBlank } from '../../utils/validation';

describe('isBlank', () => {
  it('빈 문자열이면 true를 반환한다', () => {
    expect(isBlank('')).toBe(true);
  });

  it('공백만 있으면 true를 반환한다', () => {
    expect(isBlank('   ')).toBe(true);
  });

  it('null/undefined면 true를 반환한다', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
  });

  it('공백이 아닌 값이 있으면 false를 반환한다', () => {
    expect(isBlank('제목')).toBe(false);
  });
});

describe('hasBlank', () => {
  it('하나라도 빈 값이 있으면 true를 반환한다', () => {
    expect(hasBlank('제목', '')).toBe(true);
    expect(hasBlank('', '내용')).toBe(true);
  });

  it('모두 값이 있으면 false를 반환한다', () => {
    expect(hasBlank('제목', '내용')).toBe(false);
  });
});
