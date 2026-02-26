
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, BookOpen, LayoutDashboard, Bell, Search as SearchIcon } from "lucide-react"
import { useUser } from "@/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const { user } = useUser()
  const pathname = usePathname()

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-all">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-headline text-xl font-black tracking-tight text-primary">
              Rubric<span className="text-secondary">AI</span>
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              href="/" 
              className={cn(
                "text-sm font-bold flex items-center gap-2 transition-all px-3 py-1.5 rounded-lg",
                pathname === "/" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Workspace
            </Link>
            <Link 
              href="/library" 
              className={cn(
                "text-sm font-bold flex items-center gap-2 transition-all px-3 py-1.5 rounded-lg",
                pathname === "/library" ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Library
            </Link>
          </nav>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search evaluations..." 
              className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          {user && (
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold leading-none">Anonymously In</span>
                <span className="text-[10px] text-muted-foreground font-mono">ID: {user.uid.slice(0, 4)}...</span>
              </div>
              <Avatar className="h-9 w-9 border border-primary/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {user.uid.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
