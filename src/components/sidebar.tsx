'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, ChevronLeft, ChevronRight, PhoneCallIcon, User } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only show logo after client-side hydration is complete
  const logoSrc = 
    !mounted ? '/dialwise-logo-w.webp' 
    : theme === 'dark' 
    ? '/dialwise-logo-w.webp' : '/dialwise-logo.webp';


  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen bg-background border-r transition-all duration-200 ease-in-out flex flex-col bg-white dark:bg-[#151515] transition-colors duration-200",
        collapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2 py-4">
            <div className="relative">
              <Image
                src={logoSrc}
                alt="DialWise.ai"
                height={31}
                width={166}
                className="object-contain"
                priority
                placeholder = 'blur' // "empty" | "blur"
                blurDataURL="/dialwise-logo.webp"
              />
            </div>
          </Link>
        )}
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "p-2 hover:bg-accent rounded-md",
            collapsed && "w-full flex justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button> */}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2 rounded-md px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-100 dark:bg-black hover:bg-green-500 dark:hover:bg-green-400 hover:text-gray-300 dark:hover:text-black",
            pathname === "/",
            collapsed && "justify-center"
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>
        <Link
          href="/dialer"
          className={cn(
            "flex items-center space-x-2 rounded-md px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-100 dark:bg-black hover:bg-green-500 dark:hover:bg-green-400 hover:text-gray-300 dark:hover:text-black",
            pathname === "/dialer",
            collapsed && "justify-center"
          )}
        >
          <PhoneCallIcon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>AI Dialer</span>}
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-2 rounded-md px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-100 dark:bg-black hover:bg-green-500 dark:hover:bg-green-400 hover:text-gray-300 dark:hover:text-black",
            pathname === "/settings",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>
      <div className="p-4 border-t">
        <ThemeToggle />
      </div>
    </div>
  )
}
