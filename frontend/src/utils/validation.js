export function isBlank(value) {
  return !value?.trim();
}

export function hasBlank(...values) {
  return values.some(isBlank);
}
