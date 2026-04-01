import React, { useState, useRef, useEffect } from 'react';

/**
 * TagInput — multi-select tag component with predefined options + custom values.
 *
 * Props:
 *  - value: string (comma-separated)
 *  - onChange: (newCommaSeparatedString) => void
 *  - options: string[] — predefined suggestions
 *  - id: string — html id
 *  - placeholder: string
 */
export default function TagInput({ value, onChange, options = [], id, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const tags = value
    ? value.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const filteredOptions = options.filter(
    opt => !tags.some(t => t.toLowerCase() === opt.toLowerCase()) &&
           opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    const next = [...tags, trimmed].join(', ');
    onChange(next);
    setInputValue('');
  };

  const removeTag = (index) => {
    const next = tags.filter((_, i) => i !== index).join(', ');
    onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div
        className="form-control d-flex flex-wrap align-items-center gap-1"
        style={{ minHeight: '38px', height: 'auto', cursor: 'text' }}
        onClick={() => wrapperRef.current?.querySelector('input')?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={i} className="badge bg-primary d-inline-flex align-items-center me-1 mb-1" style={{ fontSize: '0.85em' }}>
            {tag}
            <button
              type="button"
              className="btn-close btn-close-white ms-1"
              style={{ fontSize: '0.6em' }}
              aria-label={`Remove ${tag}`}
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            />
          </span>
        ))}
        <input
          type="text"
          id={id}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          style={{ border: 'none', outline: 'none', flex: '1 1 120px', minWidth: '120px', background: 'transparent' }}
          autoComplete="off"
        />
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <ul
          className="list-group shadow-sm"
          style={{
            position: 'absolute',
            zIndex: 1050,
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '2px',
          }}
        >
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              className="list-group-item list-group-item-action py-1 px-3"
              style={{ cursor: 'pointer', fontSize: '0.9em' }}
              onMouseDown={(e) => { e.preventDefault(); addTag(opt); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
