import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import React, { useState, useRef } from "react";
import type { Option } from "../Types";

type Props = {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
};

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}: Props) => {
  // 검색어 관리 및 검색창 ref
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // 드롭다운을 열면 검색창에 커서 자동 이동
  const handleButtonClick = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 검색어에 따라 옵션 필터링
  const filteredOptions =
    searchQuery.trim().length > 0
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  return (
    <div className="input">
      <Listbox
        value={selected}
        onChange={() => toggleOption}
        multiple
        disabled={disabled}
      >
        <div className="relative">
          <Listbox.Button
            className="w-full text-left flex justify-between items-center"
            onClick={handleButtonClick}
          >
            <span>
              {selected.length > 0 ? (
                options
                  .filter((opt) => selected.includes(opt.value))
                  .map((opt) => opt.label)
                  .join(", ")
              ) : (
                <p className="text-gray-400">{placeholder}</p>
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-black" />
          </Listbox.Button>

          {/* 옵션 목록 및 검색창 */}
          <Listbox.Options className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto text-sm">
            <div className="p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                ref={inputRef}
                autoFocus
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none"
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-500">검색 결과가 없습니다</div>
            )}
            {filteredOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                as={React.Fragment}
                disabled={option.disabled}
              >
                {({ active, selected: isSelected }) => (
                  <li
                    className={`cursor-pointer select-none px-4 py-2 flex justify-between ${
                      active ? "bg-blue-100" : ""
                    }`}
                    onClick={() => toggleOption(option.value)}
                  >
                    <div>
                      <span
                        className="inline-block"
                        style={{ width: `${(option.depth || 0) * 12}px` }}
                      />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
};

export default MultiSelect;
