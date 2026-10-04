import React, { useState, useRef, useEffect, Children } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomSelect({
  value,
  onChange,
  options: optionsProp,
  children,
  placeholder = 'Select...',
  name,
  id,
  className,
  disabled = false,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Extract options from children (<option>) or optionsProp
  const options = React.useMemo(() => {
    if (optionsProp && Array.isArray(optionsProp)) {
      return optionsProp;
    }
    if (children) {
      const parsedOptions = [];
      Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          parsedOptions.push({
            value: child.props.value ?? '',
            label: child.props.children,
            disabled: child.props.disabled ?? false,
          });
        }
      });
      return parsedOptions;
    }
    return [];
  }, [optionsProp, children]);

  // Find currently selected option
  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option select
  const handleSelect = (option) => {
    if (option.disabled) return;
    setIsOpen(false);
    if (onChange) {
      // Simulate standard event object for React forms
      onChange({
        target: {
          name: name || id || '',
          value: option.value,
        },
      });
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      {/* Hidden native select for form validation/accessibility */}
      <select
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 text-xs font-semibold text-foreground transition-all duration-200 outline-none',
          'hover:border-primary/50 hover:bg-muted/40 focus:ring-2 focus:ring-primary/40 focus:border-primary',
          isOpen && 'border-primary ring-2 ring-primary/30 shadow-md',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'ml-2 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>

      {/* Floating Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[160px] rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150 ease-out">
          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);

              if (option.disabled) {
                return (
                  <div
                    key={option.value}
                    className="px-3.5 py-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider"
                  >
                    {option.label}
                  </div>
                );
              }

              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground cursor-pointer transition-all duration-200 ease-out select-none',
                    'hover:bg-primary/15 hover:text-primary hover:translate-x-1 hover:shadow-sm',
                    isSelected && 'bg-primary/20 text-primary font-extrabold shadow-sm'
                  )}
                >
                  <span className="truncate transition-transform duration-200 group-hover:scale-102">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="size-3.5 text-primary ml-2 shrink-0 animate-in zoom-in-50 duration-150" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
