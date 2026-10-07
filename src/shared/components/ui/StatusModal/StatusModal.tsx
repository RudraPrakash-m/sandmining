import React from "react";
import Modal from "../Modal/Modal";
import { PartyPopper, AlertCircle, AlertTriangle, HelpCircle, Info } from "lucide-react";

export type StatusModalType = "success" | "error" | "warning" | "info" | "confirm";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    type?: StatusModalType;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const StatusModal: React.FC<StatusModalProps> = ({
    isOpen, onClose, onConfirm, type = "success", title, message,
    confirmText = "OK", cancelText = "Cancel",
}) => {

    React.useEffect(() => {
        if (!isOpen || type === "confirm") return;
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [isOpen, type, onClose]);
    const getIcon = () => {
        switch (type) {
            case "success": return <PartyPopper className="w-12 h-12 text-emerald-500" />;
            case "error": return <AlertCircle className="w-12 h-12 text-rose-500" />;
            case "warning": return <AlertTriangle className="w-12 h-12 text-amber-500" />;
            case "confirm": return <HelpCircle className="w-12 h-12 text-indigo-500" />;
            default: return <Info className="w-12 h-12 text-sky-500" />;
        }
    };

    const getDefaultTitle = () => {
        switch (type) {
            case "success": return "Successful!";
            case "error": return "Error!";
            case "warning": return "Warning!";
            case "confirm": return "Confirm Action";
            default: return "Information";
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "success": return "bg-primary";
            case "error": return "bg-red-600";
            case "warning": return "bg-yellow-500";
            default: return "bg-blue-600";
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xs" showCloseButton={false} closeOnBackdropClick={type !== "confirm"}>
            <div className="flex flex-col items-center text-center p-2">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-3">
                    {getIcon()}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{title || getDefaultTitle()}</h3>
                <p className="text-muted-foreground text-sm mb-5 px-2 leading-tight">{message}</p>
                <div className={`w-full px-4 ${type === "confirm" ? "flex gap-2" : "flex justify-center"}`}>
                    {type === "confirm" && (
                        <button type="button" onClick={onClose} className="flex-1 py-2 px-4 rounded-lg text-muted-foreground font-semibold text-sm hover:bg-muted/20 transition-all border border-border">
                            {cancelText}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onConfirm || onClose}
                        className={`${type === "confirm" ? "flex-1" : "min-w-[120px]"} py-2 px-6 rounded-lg text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-all ${getButtonColor()}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default StatusModal;
