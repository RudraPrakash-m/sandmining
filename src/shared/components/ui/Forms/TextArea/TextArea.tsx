import React, { forwardRef } from "react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helpText?: string;
    rows?: number;
    showCount?: boolean;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, helpText, rows = 1, showCount = false, maxLength, className = "", wrapperClassName = "", labelClassName = "", errorClassName = "", disabled, required, value, id, ...props }, ref) => {
        const textareaId = id || `textarea-${props.name || "field"}`;
        const currentLength = typeof value === "string" ? value.length : 0;
        const localRef = React.useRef<HTMLTextAreaElement | null>(null);

        React.useEffect(() => {
            const textarea = localRef.current;
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }, [value]);

        return (
            <div className={wrapperClassName}>
                {label && (
                    <label htmlFor={textareaId} className={`block text-[13px] font-medium text-foreground mb-1.5 leading-none ${labelClassName}`}>
                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                {showCount && maxLength !== undefined && (
                    <div className="flex justify-end mb-1">
                        <span className={`text-[11px] ${currentLength > maxLength ? "text-red-500" : "text-gray-400"}`}>{currentLength}/{maxLength}</span>
                    </div>
                )}
                <textarea
                    ref={(node) => {
                        localRef.current = node;
                        if (typeof ref === "function") ref(node);
                        else if (ref) (ref as any).current = node;
                    }}
                    id={textareaId}
                    rows={rows}
                    disabled={disabled}
                    maxLength={maxLength}
                    className={[inputBase, error ? inputError : inputNormal, disabled ? inputDisabled : "", "resize-y min-h-[38px]", className].join(" ")}
                    value={value}
                    {...props}
                />
                {helpText && !error && <p className="mt-1.5 text-[12px] text-gray-500 leading-none">{helpText}</p>}
                {error && <p className={`mt-1.5 text-[12px] font-medium text-red-600 leading-none ${errorClassName}`} role="alert">{error}</p>}
            </div>
        );
    }
);

TextArea.displayName = "TextArea";
export default TextArea;
