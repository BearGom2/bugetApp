import { Listbox } from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import React, { useState, useRef } from "react";
import type { Option } from "../Types";

type Props = {
  options: Option[];
  selected: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const Select = ({
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}: Props) => {

  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);


  const handleButtonClick = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const filteredOptions =
    searchQuery.trim().length > 0
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  return (
    <div className="input">
      <Listbox value={selected} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {/* 드롭다운 버튼 */}
          <Listbox.Button
            className="w-full text-left flex justify-between items-center"
            onClick={handleButtonClick}
          >
            <span>
              {selected ? (
                options.find((opt) => opt.value === selected)?.label
              ) : (
                <p className="text-gray-400">{placeholder}</p>
              )}
            </span>
            <ChevronDown className="w-4 h-4 text-black" />
          </Listbox.Button>

          {/* 옵션 목록과 검색창 */}
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
                  >
                    <div>
                      <span
                        className="inline-block"
                        style={{ width: `${(option.depth || 0) * 12}px` }}
                      />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
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

export default Select;
