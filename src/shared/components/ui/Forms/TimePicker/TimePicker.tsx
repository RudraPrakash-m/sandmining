import { forwardRef, useMemo } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOM from "react-dom";
import { Clock, X } from "lucide-react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";

interface TimePickerProps {
    label?: string;
    error?: string;
    helpText?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (val: string | null) => void;
    name?: string;
    id?: string;
    onBlur?: () => void;
}

const getClockColorClass = (isDisabled?: boolean, hasError?: string) => {
    if (isDisabled) return "text-muted-foreground/50 cursor-not-allowed";
    if (hasError) return "text-red-500";
    return "";
};

const TimePicker = forwardRef<ReactDatePicker, Readonly<TimePickerProps>>(
    ({ label, error, helpText, wrapperClassName = "", labelClassName = "", errorClassName = "", disabled, required, id, value, onChange, placeholder = "hh:mm aa", name, onBlur }, ref) => {
        const inputId = id || `timepicker-${name || "field"}`;

        const selectedValue = useMemo(() => {
            if (!value) return null;
            const parts = value.split(":");
            const hours = Number.parseInt(parts[0], 10);
            const minutes = Number.parseInt(parts[1], 10);
            const d = new Date();
            if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
                d.setHours(hours, minutes, 0, 0);
                return d;
            }
            return null;
        }, [value]);

        const handleTimeChange = (date: Date | null) => {
            if (date) {
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                onChange?.(`${hours}:${minutes}`);
            } else {
                onChange?.(null);
            }
        };

        const clockColor = getClockColorClass(disabled, error);

        return (
            <div className={wrapperClassName}>
                {label && (
                    <label htmlFor={inputId} className={`block text-[13px] font-medium text-foreground mb-1.5 leading-none ${labelClassName}`}>
                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <ReactDatePicker
                        ref={ref}
                        id={inputId}
                        selected={selectedValue}
                        onChange={handleTimeChange}
                        disabled={disabled}
                        onBlur={onBlur}
                        placeholderText={placeholder}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className={[
                            inputBase,
                            "pr-12 cursor-pointer w-full",
                            error ? inputError : inputNormal,
                            disabled ? inputDisabled : "",
                        ].join(" ")}
                        wrapperClassName="w-full"
                        popperContainer={({ children }) => ReactDOM.createPortal(children, document.body)}
                        popperClassName="!z-[9999]"
                    />
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                        {value && !disabled && (
                            <X
                                size={14}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTimeChange(null);
                                }}
                                className="text-muted-foreground hover:text-red-500 cursor-pointer pointer-events-auto transition-colors"
                            />
                        )}
                        <Clock
                            size={16}
                            className={`text-muted-foreground ${clockColor}`}
                        />
                    </div>
                </div>
                {helpText && !error && <p className="mt-1.5 text-[12px] text-gray-500 leading-none">{helpText}</p>}
                {error && <p className={`mt-1.5 text-[12px] font-medium text-red-600 leading-none ${errorClassName}`} role="alert">{error}</p>}
            </div>
        );
    }
);

TimePicker.displayName = "TimePicker";
export default TimePicker;
