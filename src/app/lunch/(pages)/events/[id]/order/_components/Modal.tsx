import React from 'react'

interface ModalProps {
    id: string;
    open?: boolean;
    title?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    onClose?: () => void;
}

// https://daisyui.com/components/modal
export default function Modal({ id, title, action, open, children, onClose }: ModalProps) {
    return (
        <dialog className={`modal`}>
            <div className="modal-box">
                <form method="dialog" onSubmit={() => { onClose?.() }}>
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h2 className="font-bold text-lg">{title}</h2>
                {children}
                {action && <div>{action}</div>}
            </div>
            <form method="dialog" className="modal-backdrop" onSubmit={() => { onClose?.() }}>
                <button>close</button>
            </form>
        </dialog >
    )
}

export function ModalTriggerButton({ id, children }: { id: string; children: React.ReactNode }) {
    return (<button className="btn" onClick={() => document.getElementById(id)?.showModal()}>
        {children}
    </button>)
}