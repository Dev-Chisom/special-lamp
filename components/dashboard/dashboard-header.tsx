"use client"

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
    <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
          <p className="text-sm text-muted-foreground">Let's find your dream job today</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
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
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
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
