export function isBlank(value) {
  return !value?.trim();
}

export function hasBlank(...values) {
  return values.some(isBlank);
}

const PHONE_PATTERN = /^(\d{11}|\d{3}-\d{4}-\d{4})$/;

export function isValidPhone(value) {
  return PHONE_PATTERN.test(value?.trim() ?? '');
}
