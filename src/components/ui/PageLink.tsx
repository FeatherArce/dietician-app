'use client';
import Link from 'next/link'
import { useLinkStatus } from 'next/link'

function Hint() {
    const { pending } = useLinkStatus()
    if (!pending) return null;
    return (
        <span className="loading loading-spinner loading-sm" />
    )
}

interface PageLinkProps extends React.ComponentProps<typeof Link> {
    children?: React.ReactNode;
}
export default function PageLink({ title, children, ...props }: PageLinkProps) {
    return (
        <Link prefetch={false} {...props}>
            {children}
            <Hint />
        </Link>
    )
}
