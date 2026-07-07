export const COLOR_KEYS = {
  RED: 'red',
  AMBER: 'amber',
  BLUE: 'blue',
  BLUE2: 'blue2',
  GREEN: 'green',
  PINK: 'pink',
  ORANGE: 'orange',
  PURPLE: 'purple',
};

export const BADGE_SIZES = {
  SM: 'sm',
  MD: 'md',
};

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
};

export const BUTTON_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const DOC_TYPES = {
  DOCU: 'DOCU',
  DOCX: 'DOCX',
  PDF: 'PDF',
  PPTX: 'PPTX',
  XLSX: 'XLSX',
};

export const DOC_TYPE_COLOR = {
  [DOC_TYPES.DOCU]: COLOR_KEYS.BLUE,
  [DOC_TYPES.DOCX]: COLOR_KEYS.BLUE2,
  [DOC_TYPES.PDF]: COLOR_KEYS.RED,
  [DOC_TYPES.PPTX]: COLOR_KEYS.AMBER,
  [DOC_TYPES.XLSX]: COLOR_KEYS.GREEN,
};

export const DEPT_COLOR = {
  개발: COLOR_KEYS.BLUE,
  인프라: COLOR_KEYS.GREEN,
  보안: COLOR_KEYS.PINK,
  네트워크: COLOR_KEYS.ORANGE,
  공통: COLOR_KEYS.PURPLE,
};
