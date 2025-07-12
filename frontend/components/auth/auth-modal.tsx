"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { ForgotPasswordForm } from "./forgot-password-form"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    setActiveTab("login")
    setShowForgotPassword(false)
  }

  if (showForgotPassword) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <ForgotPasswordForm 
            onBack={() => setShowForgotPassword(false)} 
            onSuccess={handleClose}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
            Welcome to Skill Swap
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            Connect, learn, and grow with our community
          </p>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={handleClose} onForgotPassword={() => setShowForgotPassword(true)} />
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={handleClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
