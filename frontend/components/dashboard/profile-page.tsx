"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { userAPI } from "@/lib/api"
import { User } from "@/lib/constants"
import { Loader2, User as UserIcon, MapPin, Globe, Mail, Phone, Calendar, Award } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  profile_photo_url: z.string().url().optional().or(z.literal("")),
  is_public: z.boolean(),
  availability: z.array(z.string()).optional(),
  timeslot: z.array(z.string()).optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  x: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  personal_portfolio: z.string().url().optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

const availabilityOptions = [
  "Weekdays", "Weekends", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]

const timeslotOptions = ["Morning", "Afternoon", "Evening", "Night"]

export function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { user, setUser } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      location: user?.location || "",
      profile_photo_url: user?.profile_photo_url || "",
      is_public: user?.is_public || true,
      availability: user?.availability || [],
      timeslot: user?.timeslot || [],
      linkedin: user?.linkedin || "",
      instagram: user?.instagram || "",
      youtube: user?.youtube || "",
      facebook: user?.facebook || "",
      x: user?.x || "",
      github: user?.github || "",
      personal_portfolio: user?.personal_portfolio || "",
    },
  })

  const watchedAvailability = watch("availability") || []
  const watchedTimeslot = watch("timeslot") || []

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const updatedUser = await userAPI.updateMyProfile(data)
      setUser(updatedUser)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAvailability = (option: string) => {
    const current = watchedAvailability
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option]
    setValue("availability", updated)
  }

  const toggleTimeslot = (option: string) => {
    const current = watchedTimeslot
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option]
    setValue("timeslot", updated)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile information and settings</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Photo and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profile_photo_url || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
              <Input
                id="profile_photo_url"
                {...register("profile_photo_url")}
                disabled={!isEditing}
                placeholder="https://example.com/photo.jpg"
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={watch("is_public")}
                onCheckedChange={(checked) => setValue("is_public", checked)}
                disabled={!isEditing}
              />
              <Label htmlFor="is_public">Make my profile public</Label>
            </div>
          </CardContent>
        </Card>

        {/* Availability and Timeslots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Availability</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availabilityOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={watchedAvailability.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => isEditing && toggleAvailability(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Preferred Times</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {timeslotOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={watchedTimeslot.includes(option) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => isEditing && toggleTimeslot(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Social Links</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...register("linkedin")}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  {...register("github")}
                  disabled={!isEditing}
                  placeholder="https://github.com/username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register("instagram")}
                  disabled={!isEditing}
                  placeholder="https://instagram.com/username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="x">X (Twitter)</Label>
                <Input
                  id="x"
                  {...register("x")}
                  disabled={!isEditing}
                  placeholder="https://x.com/username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  {...register("youtube")}
                  disabled={!isEditing}
                  placeholder="https://youtube.com/@username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  {...register("facebook")}
                  disabled={!isEditing}
                  placeholder="https://facebook.com/username"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="personal_portfolio">Personal Portfolio</Label>
              <Input
                id="personal_portfolio"
                {...register("personal_portfolio")}
                disabled={!isEditing}
                placeholder="https://your-portfolio.com"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Account Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user.credits}</div>
                <div className="text-sm text-muted-foreground">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.skills?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.average_rating || 0}</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Date(user.date_joined).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Joined</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  )
} 