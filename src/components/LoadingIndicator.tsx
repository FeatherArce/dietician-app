'use client'
import { useLinkStatus } from 'next/link'

export default function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return pending ? (
    <span className="loading loading-spinner loading-xs" />
  ) : null
}