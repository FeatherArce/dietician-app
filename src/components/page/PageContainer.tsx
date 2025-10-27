import React from 'react'

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-full overflow-hidden px-4 md:container md:mx-auto space-y-4">
      {children}
    </div>
  )
}
