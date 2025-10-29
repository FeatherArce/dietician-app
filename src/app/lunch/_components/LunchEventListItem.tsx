'use client';
import React from 'react';
import { LunchEvent } from '@/prisma-generated/postgres-client';
import { FaCartPlus } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { TiDocumentText } from 'react-icons/ti';

interface LunchEventItemProps {
    event: LunchEvent;
    currentUserId: string;
    currentUserRole?: 'USER' | 'ADMIN' | 'MODERATOR';
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onOrder: (id: string) => void;
}

export default function LunchEventListItem({
    event,
    currentUserId,
    currentUserRole,
    onDelete,
    onEdit,
    onOrder
}: LunchEventItemProps) {    
    const hasManagePermission = 
        event.owner_id === currentUserId || 
        currentUserRole === 'ADMIN' || 
        currentUserRole === 'MODERATOR';

    return (
        <li className="list-row grid-cols-1">
            <div className=''>
                <div>{event.title}</div>
                <div className="text-xs uppercase font-semibold opacity-60">
                    {event.description}
                </div>
            </div>
            <button
                className="btn btn-square btn-ghost"
                onClick={() => onOrder(event.id)}
            >
                <FaCartPlus className="size-[1.2em]" />
            </button>
            {hasManagePermission && (
                <>
                    <button
                        className="btn btn-square btn-ghost"
                        onClick={() => onEdit(event.id)}
                    >
                        <TiDocumentText className="size-[1.2em]" />
                    </button>
                    <button
                        className="btn btn-square btn-ghost"
                        onClick={() => onDelete(event.id)}
                    >
                        <RiDeleteBin6Line className="size-[1.2em]" />
                    </button>
                </>
            )}
        </li>
    );
}