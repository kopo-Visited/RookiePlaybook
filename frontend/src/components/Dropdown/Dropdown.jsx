import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

function IconChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 지식문서 목록(DocListPage)의 카테고리/정렬 드롭다운과 동일한 디자인의
 * 공용 드롭다운. 네이티브 <select> 대신 앱 전체에서 이걸 재사용한다.
 *
 * options: [{ value, label }]
 */
function Dropdown({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  label,
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selected = options.find(opt => opt.value === value);

  function handleSelect(opt) {
    onChange(opt.value);
    setOpen(false);
  }

  return (
    <div className={`${styles.wrap} ${className}`} ref={ref}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={`${styles.select} ${open ? styles.selectOpen : ''} ${disabled ? styles.selectDisabled : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
      >
        <span className={selected ? styles.selectValue : styles.selectPlaceholder}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`${styles.selectArrow} ${open ? styles.selectArrowUp : ''}`}>
          <IconChevronDown />
        </span>
      </div>
      {open && !disabled && (
        <ul className={styles.dropdown}>
          {options.map(opt => (
            <li
              key={opt.value}
              className={`${styles.dropdownItem} ${opt.value === value ? styles.dropdownItemActive : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
