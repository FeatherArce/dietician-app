"use client";

interface AddEventButtonProps {
    onAdd: () => void;
}

export default function AddEventButton({ onAdd }: AddEventButtonProps) {
    return (
        <div className="flex justify-end mb-4">
            <button 
                className="btn btn-primary btn-sm"
                onClick={onAdd}
            >
                新增事件
            </button>
        </div>
    );
}