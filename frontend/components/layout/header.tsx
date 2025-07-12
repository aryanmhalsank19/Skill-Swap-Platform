"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { UserNav } from "./user-nav"
import { AuthModal } from "@/components/auth/auth-modal"
import { Menu, X, Users, BookOpen, Home, BarChart3 } from "lucide-react"

export function Header() {
  const { user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-primary-foreground font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                  Skill Swap
                </span>
                <span className="text-xs text-muted-foreground -mt-1">Exchange • Learn • Grow</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors group"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors group"
                >
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
              ) : user ? (
                <UserNav user={user} />
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAuthModal(true)}
                    className="text-foreground/80 hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setShowAuthModal(true)} 
                    className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/40 bg-background/95 backdrop-blur">
              <nav className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link 
                  href="/browse" 
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  <span>Browse</span>
                </Link>
                <Link 
                  href="/how-it-works" 
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>How it Works</span>
                </Link>
                {user && (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {!user && (
                  <div className="pt-2 border-t border-border/40">
                    <Button 
                      onClick={() => {
                        setShowAuthModal(true)
                        setMobileMenuOpen(false)
                      }} 
                      className="w-full bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  )
}
