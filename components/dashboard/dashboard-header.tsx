"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, User, Settings, Bell, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuthStore()
  const router = useRouter()

  // Get user's initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User"
  const initials = user?.full_name ? getInitials(user.full_name) : (user?.email?.substring(0, 2).toUpperCase() || "U")

  return (
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Welcome back, {displayName}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Let's find your dream job today</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 sm:h-10 sm:w-10">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-8 sm:h-10">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/auto-apply">
                  <Settings className="mr-2 h-4 w-4" />
                  Auto-Apply Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
