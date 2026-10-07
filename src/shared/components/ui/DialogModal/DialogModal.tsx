import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../Modal';

export interface DialogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    variant?: 'info' | 'warning' | 'danger' | 'success' | 'primary';
    closeOnBackdropClick?: boolean;
}

const iconMap = {
    danger: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    warning: { Icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
    success: { Icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    info: { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
};

const confirmBtnColor: Record<string, string> = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    success: 'bg-green-500 hover:bg-green-600',
    info: 'bg-blue-500 hover:bg-blue-600',
};

const DialogModal: React.FC<DialogModalProps> = ({
    isOpen, onClose, onConfirm,
    title = 'Confirm Action', message,
    confirmText = 'Confirm', cancelText = 'Cancel',
    type, variant, closeOnBackdropClick = false,
}) => {
    const effectiveType: 'info' | 'warning' | 'danger' | 'success' =
        (variant === 'primary' ? 'info' : variant) || type || 'info';
    const { Icon, color, bg } = iconMap[effectiveType];

    const footer = (
        <div className="flex gap-2 w-full">
            <button
                type="button" onClick={onClose}
                className="flex-1 py-2 text-sm font-medium rounded-lg border border-card-border text-foreground hover:bg-action-info-bg transition-colors"
            >
                {cancelText}
            </button>
            <button
                type="button" onClick={onConfirm}
                className={`flex-1 py-2 text-sm font-medium rounded-lg text-white transition-colors ${confirmBtnColor[effectiveType]}`}
            >
                {confirmText}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            closeOnBackdropClick={closeOnBackdropClick}
            footer={footer}
        >
            <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-full ${bg}`}>
                    <Icon className={`w-9 h-9 ${color}`} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
            </div>
        </Modal>
    );
};

export default DialogModal;
