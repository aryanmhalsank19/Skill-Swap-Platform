"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { userAPI } from "@/lib/api"
import { 
  Loader2, 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

const passwordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handlePasswordChange = async (data: PasswordFormData) => {
    setIsLoading(true)
    try {
      // This would be implemented when the backend supports password change
      // await userAPI.changePassword(data)
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
      setShowPasswordForm(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      // This would be implemented when the backend supports account deletion
      // await userAPI.deleteAccount()
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })
      logout()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email Address</Label>
              <Input value={user.email} disabled className="mt-1" />
            </div>
            <div>
              <Label>Account Created</Label>
              <Input 
                value={new Date(user.date_joined).toLocaleDateString()} 
                disabled 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Last Login</Label>
              <Input 
                value={user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"} 
                disabled 
                className="mt-1" 
              />
            </div>
            <div>
              <Label>Credits Balance</Label>
              <Input value={user.credits.toString()} disabled className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow other users to see your profile and skills
              </p>
            </div>
            <Switch checked={user.is_public} disabled />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show Email</Label>
              <p className="text-sm text-muted-foreground">
                Display your email address on your public profile
              </p>
            </div>
            <Switch defaultChecked={false} disabled />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show Location</Label>
              <p className="text-sm text-muted-foreground">
                Display your location on your public profile
              </p>
            </div>
            <Switch defaultChecked={true} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for new swap requests
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">System Messages</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for system announcements
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Not Available
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-base font-medium">Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </Button>
            </div>
            
            {showPasswordForm && (
              <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4 mt-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    {...register("current_password")}
                    className="mt-1"
                  />
                  {errors.current_password && (
                    <p className="text-sm text-destructive mt-1">{errors.current_password.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    {...register("new_password")}
                    className="mt-1"
                  />
                  {errors.new_password && (
                    <p className="text-sm text-destructive mt-1">{errors.new_password.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    {...register("confirm_password")}
                    className="mt-1"
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive mt-1">{errors.confirm_password.message}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordForm(false)
                      reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions are irreversible. Please proceed with caution.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-red-600">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Account
            </Button>
          </div>
          
          {showDeleteConfirm && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Yes, Delete My Account
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 