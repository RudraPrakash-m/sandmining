import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";
import type { Option } from "../form.types";

interface MultiSelectProps {
    label?: string;
    options: Option[];
    value: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    error?: string;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    maxSelected?: number;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    id?: string;
    name?: string;
}

const MultiSelect: React.FC<Readonly<MultiSelectProps>> = ({
    label,
    options = [],
    value = [],
    onChange,
    error,
    helpText,
    placeholder = "Select options...",
    disabled = false,
    required = false,
    maxSelected,
    wrapperClassName = "",
    labelClassName = "",
    errorClassName = "",
    id,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = id || (name ? `multiselect-${name}` : "multiselect-field");

    const containerClasses = [
        inputBase,
        error ? inputError : inputNormal,
        disabled ? inputDisabled : "cursor-pointer hover:bg-card-bg/80",
        "flex justify-between items-center h-[38px] w-full text-left",
    ].join(" ");

    const filteredOptions = useMemo(
        () => options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase())),
        [options, searchTerm]
    );

    const selectedOptions = useMemo(
        () => options.filter((opt) => value.includes(opt.value)),
        [options, value]
    );

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            if (maxSelected && value.length >= maxSelected) return;
            onChange([...value, val]);
        }
    };

    const handleSelectAll = () => {
        if (disabled) return;
        const allFilteredValues = filteredOptions.map((opt) => opt.value);
        const isAllSelected = allFilteredValues.length > 0 && allFilteredValues.every((val) => value.includes(val));

        if (isAllSelected) {
            onChange(value.filter((v) => !allFilteredValues.includes(v)));
        } else {
            const newValues = [...value];
            for (const val of allFilteredValues) {
                if (!newValues.includes(val)) {
                    if (maxSelected && newValues.length >= maxSelected) break;
                    newValues.push(val);
                }
            }
            onChange(newValues);
        }
    };

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && wrapperRef.current) {
                const rect = wrapperRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            } else {
                setDropdownPosition(null);
            }
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);

        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const renderSelection = () => {
        if (selectedOptions.length === 0) return <span className="text-muted-foreground">{placeholder}</span>;
        if (selectedOptions.length === 1) return <span className="text-input-text font-medium truncate">{selectedOptions[0].label}</span>;
        return <span className="text-input-text font-medium">{selectedOptions.length} items selected</span>;
    };

    return (
        <div className={wrapperClassName} ref={wrapperRef}>
            {label && (
                <label htmlFor={inputId} className={`block text-[13px] font-medium text-foreground mb-1.5 leading-none ${labelClassName}`}>
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                    {maxSelected && <span className="ml-2 text-xs text-muted-foreground">(Max {maxSelected})</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    id={inputId}
                    name={name}
                    className={containerClasses}
                    onClick={() => {
                        if (disabled) return;
                        setIsOpen((prev) => {
                            if (prev) setSearchTerm("");
                            return !prev;
                        });
                    }}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <div className="flex-1 overflow-hidden min-h-[20px] flex items-center text-sm">
                        {renderSelection()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && !disabled && dropdownPosition && (
                    <div
                        role="listbox"
                        className="fixed z-[9999] mt-1 bg-card-bg border border-card-border rounded-md shadow-lg max-h-72 overflow-hidden flex flex-col"
                        style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
                    >
                        <div className="flex items-center px-3 py-2.5 border-b border-card-border bg-card-bg z-10">
                            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent outline-none text-sm text-input-text placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="overflow-y-auto flex-1 py-1">
                            {filteredOptions.length > 0 && (
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-muted/10 text-card-text font-semibold border-b border-card-border/50 pb-2 mb-1 bg-transparent border-0"
                                    onClick={handleSelectAll}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filteredOptions.every((opt) => value.includes(opt.value))}
                                        readOnly
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer pointer-events-none"
                                    />
                                    <span>Select All</span>
                                </button>
                            )}

                            {filteredOptions.length ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = value.includes(opt.value);
                                    return (
                                        <button
                                            type="button"
                                            key={String(opt.value)}
                                            role="option"
                                            aria-selected={isSelected}
                                            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-muted/10 text-card-text bg-transparent border-0"
                                            onClick={() => handleSelect(opt.value)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer pointer-events-none shrink-0"
                                            />
                                            <span className="truncate">{opt.label}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {helpText && !error && <p className="mt-1.5 text-[12px] text-gray-500 leading-none">{helpText}</p>}
            {error && <p className={`mt-1.5 text-[12px] font-medium text-red-600 leading-none ${errorClassName}`} role="alert">{error}</p>}
        </div>
    );
};

export default MultiSelect;
