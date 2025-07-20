'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  
  return (
    <div className={isHomePage ? '' : 'pt-20'}>
      {children}
    </div>
  )
}