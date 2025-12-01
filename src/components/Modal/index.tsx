import { cn } from '@/libs/utils';
import React, { useCallback, useImperativeHandle, useMemo } from 'react'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    id: string;
    title?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    loading?: boolean;
    onOk?: () => void;
    okText?: string;
    onClose?: () => void;
    closeText?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export interface ModalRef {
    open: () => void;
    close: () => void;
}

// https://daisyui.com/components/modal
function Modal({
    id,
    title,
    action,
    children,
    loading = false,
    onOk,
    okText = '確定',
    onClose,
    closeText = '取消',
    className,
    size = 'md',
    ...props
}: ModalProps, ref: React.Ref<ModalRef>) {
    const open = useCallback(() => {
        (document.getElementById(id) as HTMLDialogElement | null)?.showModal();
    }, [id]);

    const close = useCallback(() => {
        (document.getElementById(id) as HTMLDialogElement | null)?.close();
    }, [id]);

    useImperativeHandle(ref, () => ({
        open,
        close,
    }));

    const showAction = useMemo(() => {
        return !!action || !!onOk || !!onClose;
    }, [action, onOk, onClose]);

    const handleClose = useCallback(() => {
        close();
        onClose?.();
    }, [close, onClose]);

    return (
        <dialog id={id} className={`modal`}>
            <div className={cn('modal-box space-y-2 max-w-screen', `w-${size}`, className)} {...props}>
                <div className=''>
                    {/* if there is a button in form, it will close the modal */}
                    <button
                        type="submit"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </div>
                <h2 className="font-bold text-lg">{title}</h2>
                {children}
                {showAction && <div className='modal-action'>
                    {!!action && action}
                    {!!onOk && <button className="btn btn-primary" onClick={onOk} disabled={loading}>{okText}</button>}
                    {!!onClose && <button className="btn" onClick={onClose} disabled={loading}>{closeText}</button>}
                </div>}
            </div>
            {/* Modal backdrop */}
            <div className="modal-backdrop w-full">
                <button onClick={handleClose}>close</button>
            </div>
        </dialog >
    )
}
export default React.forwardRef(Modal);

export function ModalTriggerButton({ id, children }: { id: string; children: React.ReactNode }) {
    return (<button className="btn" onClick={() => (document.getElementById(id) as HTMLDialogElement | null)?.showModal()}>
        {children}
    </button>)
}