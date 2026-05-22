import React, { useState } from 'react';
import { Select, SelectOption } from 'impact-ui';

interface ImFilterSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  minWidth?: number;
  isClearable?: boolean;
}

export const ImFilterSelect: React.FC<ImFilterSelectProps> = ({
  label,
  placeholder,
  value,
  options,
  onChange,
  minWidth = 180,
  isClearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectOptions: SelectOption[] = options.map(o => ({ value: o.value, label: o.label }));
  const [currentOptions, setCurrentOptions] = useState<SelectOption[]>(selectOptions);
  const selected = value ? (selectOptions.find(o => o.value === value) ?? null) : null;

  return (
    <Select
      label={label}
      placeholder={placeholder ?? label ?? 'Select'}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      initialOptions={selectOptions}
      currentOptions={currentOptions}
      setCurrentOptions={opts => setCurrentOptions(Array.isArray(opts) ? opts : selectOptions)}
      selectedOptions={selected}
      setSelectedOptions={opt => {
        const sel = Array.isArray(opt) ? opt[0] : opt;
        onChange(sel?.value ?? '');
      }}
      setIsSelectAll={() => {}}
      isClearable={isClearable}
      withPortal
      minWidth={minWidth}
    />
  );
};
