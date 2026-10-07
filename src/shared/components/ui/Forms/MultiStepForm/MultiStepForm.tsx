import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormGenerator from '../FormGenerator';
import { generateZodSchema } from '../schemaUtils';
import Card from '@/shared/components/layout/Card';
import type { FormField } from '../form.types';
import { ChevronLeft, ChevronRight, Check, type LucideIcon } from 'lucide-react';

interface Step {
    id: string;
    label: string;
    fields: FormField[];
}

interface MultiStepFormProps {
    steps: Step[];
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel?: () => void;
    gridColumn?: 1 | 2 | 3 | 4 | 5 | 6;
    title?: string;
    icon?: LucideIcon;
}

const getStepButtonClass = (index: number, currentStep: number, isCompleted: boolean): string => {
    if (index === currentStep) {
        return 'bg-primary text-white scale-110';
    }
    if (isCompleted) {
        return 'bg-green-500 text-white';
    }
    return 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500';
};

const getStepLabelClass = (index: number, currentStep: number, isCompleted: boolean): string => {
    if (index === currentStep) {
        return 'text-primary';
    }
    if (isCompleted) {
        return 'text-green-600 dark:text-green-400';
    }
    return 'text-gray-500 dark:text-gray-400';
};

const MultiStepForm: React.FC<Readonly<MultiStepFormProps>> = ({
    steps,
    onSubmit,
    onCancel,
    gridColumn = 2,
    title = "Multi-Step Form",
    icon: Icon,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());


    const allFields = useMemo(() => steps.flatMap(step => step.fields), [steps]);
    const schema = useMemo(() => generateZodSchema(allFields), [allFields]);

    const computedDefaultValues = useMemo(() => {
        const defaults: Record<string, unknown> = {};
        allFields.forEach(field => {
            if (field.type === 'multiselect') {
                defaults[field.name] = [];
            } else if (field.type === 'checkbox') {
                defaults[field.name] = false;
            } else if (field.type === 'number') {
                defaults[field.name] = undefined;
            } else {
                defaults[field.name] = '';
            }
        });
        return defaults;
    }, [allFields]);

    const methods = useForm<Record<string, unknown>>({
        defaultValues: computedDefaultValues,
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const { handleSubmit, trigger } = methods;

    const handleNext = async () => {
        const currentStepFields = steps[currentStep].fields.map(f => f.name);
        const isValid = await trigger(currentStepFields);

        if (isValid) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFormSubmit = (data: Record<string, unknown>) => {
        onSubmit(data);
    };

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <Card title={title} icon={Icon}>
            <div className="space-y-8">

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        {steps.map((step, index) => {
                            const isCompleted = completedSteps.has(index);
                            const buttonClass = getStepButtonClass(index, currentStep, isCompleted);

                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (index <= Math.max(...completedSteps, currentStep)) {
                                                setCurrentStep(index);
                                            }
                                        }}
                                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all duration-300 shadow-md hover:shadow-lg ${buttonClass}`}
                                    >
                                        {isCompleted ? (
                                            <Check size={16} />
                                        ) : (
                                            index + 1
                                        )}
                                    </button>

                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                                            <div
                                                className={`h-full transition-all duration-500 ${isCompleted
                                                    ? 'bg-green-500 w-full'
                                                    : 'bg-gray-400 dark:bg-gray-500 w-0'
                                                    }`}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between text-xs font-semibold">
                        {steps.map((step, index) => {
                            const isCompleted = completedSteps.has(index);
                            const labelClass = getStepLabelClass(index, currentStep, isCompleted);

                            return (
                                <span
                                    key={step.id}
                                    className={`text-center flex-1 transition-colors duration-300 ${labelClass}`}
                                >
                                    {step.label}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        <div className="p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-foreground mb-1">{currentStepData.label}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                            <FormGenerator
                                fields={currentStepData.fields}
                                onSubmit={() => { }}
                                gridColumns={gridColumn}
                                standalone={true}
                            />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={isFirstStep}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>

                            <div className="flex-1" />

                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Cancel
                                </button>
                            )}

                            {isLastStep ? (
                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 px-5 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-200 shadow-md"
                                >
                                    <Check size={16} />
                                    Submit
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:shadow-lg hover:bg-primary/90 transition-all duration-200 shadow-md"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </div>
        </Card>
    );
};

export default MultiStepForm;
