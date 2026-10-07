import { forwardRef } from "react";

export interface RadioGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    options: { label: string; value: string | number; disabled?: boolean }[];
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helpText?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ label, options, error, wrapperClassName = "", labelClassName = "", errorClassName = "", helpText, name, ...props }, ref) => {
        return (
            <div className={wrapperClassName} ref={ref}>
                {label && (
                    <label className={`block text-sm font-medium text-foreground mb-2 ${labelClassName}`}>
                        {label}{props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="flex flex-col space-y-2">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                type="radio"
                                id={`${name}-${option.value}`}
                                value={option.value}
                                {...props}
                                className="h-4 w-4 text-primary border-input-border focus:ring-primary bg-input-bg"
                            />
                            <label htmlFor={`${name}-${option.value}`} className={`ml-2 text-sm text-foreground ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
                {helpText && !error && <p className="mt-1 text-xs text-muted">{helpText}</p>}
                {error && <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>{error}</p>}
            </div>
        );
    }
);

RadioGroup.displayName = "RadioGroup";
export default RadioGroup;
