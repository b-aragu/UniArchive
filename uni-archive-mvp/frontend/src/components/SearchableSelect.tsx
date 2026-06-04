import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allLabel?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  allLabel = 'All',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = value
    ? options.find(o => o.value === value)?.label || value
    : '';

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: '170px' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: isOpen ? '1.5px solid #2563eb' : '1px solid #e5e7eb',
          backgroundColor: value ? '#eff6ff' : '#ffffff',
          fontSize: '0.875rem',
          color: value ? '#1d4ed8' : '#6b7280',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
          fontWeight: value ? '600' : '400',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel || placeholder}
        </span>
        {value ? (
          <X size={14} onClick={handleClear} style={{ flexShrink: 0, color: '#6b7280' }} />
        ) : (
          <ChevronDown size={14} style={{ flexShrink: 0, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'fadeSlideDown 0.15s ease-out',
            minWidth: '220px',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid #f3f4f6', gap: '8px' }}>
            <Search size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.8125rem',
                color: '#111827',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {/* "All" option */}
            <button
              type="button"
              onClick={() => handleSelect('')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 12px',
                fontSize: '0.8125rem',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                backgroundColor: !value ? '#eff6ff' : 'transparent',
                color: !value ? '#2563eb' : '#6b7280',
                fontWeight: !value ? '600' : '400',
                fontStyle: 'italic',
                transition: 'background-color 0.1s ease',
              }}
              onMouseEnter={(e) => { if (value) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => { if (value) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {allLabel}
            </button>

            {filtered.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8125rem', color: '#9ca3af' }}>
                No matches found
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                // Highlight matching text
                const matchIdx = opt.label.toLowerCase().indexOf(search.toLowerCase());
                let labelContent: React.ReactNode = opt.label;
                if (search && matchIdx !== -1) {
                  const before = opt.label.slice(0, matchIdx);
                  const match = opt.label.slice(matchIdx, matchIdx + search.length);
                  const after = opt.label.slice(matchIdx + search.length);
                  labelContent = (
                    <>
                      {before}
                      <span style={{ backgroundColor: '#fef08a', color: '#854d0e', fontWeight: '600', borderRadius: '2px', padding: '0 1px' }}>{match}</span>
                      {after}
                    </>
                  );
                }
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      fontSize: '0.8125rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#2563eb' : '#374151',
                      fontWeight: isSelected ? '600' : '400',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {labelContent}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
