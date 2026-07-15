import { isBlank, hasBlank, isValidPhone } from '../../utils/validation';

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

describe('isValidPhone', () => {
  it('하이픈 없는 숫자 11자리면 true를 반환한다', () => {
    expect(isValidPhone('01012345678')).toBe(true);
  });

  it('3-4-4 하이픈 형식이면 true를 반환한다', () => {
    expect(isValidPhone('010-1234-5678')).toBe(true);
  });

  it('11자리가 아니면 false를 반환한다', () => {
    expect(isValidPhone('0101234567')).toBe(false);
    expect(isValidPhone('010123456789')).toBe(false);
  });

  it('숫자가 아닌 문자가 섞이면 false를 반환한다', () => {
    expect(isValidPhone('010-abcd-5678')).toBe(false);
  });

  it('빈 값이면 false를 반환한다', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });
});
