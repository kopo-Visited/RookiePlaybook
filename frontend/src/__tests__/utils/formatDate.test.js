import { formatDate } from '../../utils/formatDate';

describe('formatDate', () => {
  it('ISO 날짜 문자열을 YYYY.MM.DD 형식으로 변환한다', () => {
    const result = formatDate('2024-03-15T09:30:00Z');
    expect(result).toBe('2024.03.15');
  });

  it('null이 들어오면 빈 문자열을 반환한다', () => {
    expect(formatDate(null)).toBe('');
  });

  it('빈 문자열이 들어오면 빈 문자열을 반환한다', () => {
    expect(formatDate('')).toBe('');
  });
});
