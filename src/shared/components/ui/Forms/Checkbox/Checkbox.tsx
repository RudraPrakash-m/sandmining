import { forwardRef } from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helpText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, wrapperClassName = "", labelClassName = "", errorClassName = "", helpText, className = "", required, ...props }, ref) => {
        return (
            <div className={wrapperClassName}>
                <div className={`${label ? 'min-h-[75px]' : 'py-1'} flex items-center`}>
                    <label htmlFor={props.id} className={`flex items-center gap-2 text-sm font-medium text-foreground ${labelClassName}`}>
                        <input
                            ref={ref}
                            type="checkbox"
                            className={`h-4 w-4 text-primary border-input-border rounded focus:ring-primary bg-input-bg ${className}`}
                            {...props}
                        />
                        {label}{required && <span className="text-red-500">*</span>}
                    </label>
                </div>
                {helpText && !error && <p className="mt-1 text-xs text-muted ml-6">{helpText}</p>}
                {error && <p className={`mt-1 text-sm text-red-600 ml-6 ${errorClassName}`}>{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
