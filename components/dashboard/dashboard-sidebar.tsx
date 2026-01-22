"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Home,
  // Linkedin, // TEMPORARILY DISABLED
  ListChecks,
  Briefcase,
  FileEdit,
  FolderOpen,
  History,
  // Chrome, // TEMPORARILY DISABLED
  Target,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  // { name: "LinkedIn Scan", href: "/dashboard/linkedin-scan", icon: Linkedin }, // TEMPORARILY DISABLED
  { name: "Job Tracker", href: "/dashboard/job-tracker", icon: ListChecks },
  { name: "Find Jobs", href: "/dashboard/find-jobs", icon: Briefcase },
  { name: "Resume Builder", href: "/dashboard/resume-builder", icon: FileEdit },
  { name: "Resume Manager", href: "/dashboard/resume-manager", icon: FolderOpen },
  { name: "Scan History", href: "/dashboard/scan-history", icon: History },
  // { name: "Chrome Extension", href: "/dashboard/extension", icon: Chrome }, // TEMPORARILY DISABLED
  { name: "Settings", href: "/dashboard/settings/auto-apply", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 backdrop-blur-xl bg-background/80 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold">ApplyEngine</span>}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 transition-all",
                    isCollapsed ? "justify-center px-2" : "justify-start",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-border/50">
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="w-full">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar - Sheet style overlay */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 backdrop-blur-xl bg-background/95 pb-safe">
        <nav className="flex items-center justify-around px-2 py-3">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1 max-w-[80px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col w-full h-auto py-2 px-2 gap-1 min-h-[60px]",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight text-center">{item.name.split(" ")[0]}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
