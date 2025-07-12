"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Globe, MapPin, Link } from "lucide-react"

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirm: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().optional(),
    profile_photo_url: z.string().url().optional().or(z.literal("")),
    is_public: z.boolean().default(true),
    availability: z.array(z.string()).default([]),
    timeslot: z.array(z.string()).default([]),
    linkedin: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    x: z.string().url().optional().or(z.literal("")),
    github: z.string().url().optional().or(z.literal("")),
    personal_portfolio: z.string().url().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess: () => void
}

const AVAILABILITY_OPTIONS = [
  'Weekdays', 'Weekends', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

const TIMESLOT_OPTIONS = [
  'Morning', 'Afternoon', 'Evening', 'Night'
]

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      is_public: true,
      availability: [],
      timeslot: [],
    }
  })

  const watchedAvailability = watch("availability")
  const watchedTimeslot = watch("timeslot")

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Clean up empty strings to undefined
      const cleanData = {
        ...data,
        profile_photo_url: data.profile_photo_url || undefined,
        linkedin: data.linkedin || undefined,
        instagram: data.instagram || undefined,
        youtube: data.youtube || undefined,
        facebook: data.facebook || undefined,
        x: data.x || undefined,
        github: data.github || undefined,
        personal_portfolio: data.personal_portfolio || undefined,
      }
      
      await registerUser(cleanData)
      toast({
        title: "Account created!",
        description: "Welcome to Skill Swap. You can now start exploring.",
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAvailability = (option: string) => {
    const current = watchedAvailability || []
    const newValue = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option]
    setValue("availability", newValue)
  }

  const toggleTimeslot = (option: string) => {
    const current = watchedTimeslot || []
    const newValue = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option]
    setValue("timeslot", newValue)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Enter your full name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" placeholder="Create a password" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirm">Confirm Password *</Label>
          <Input
            id="password_confirm"
            type="password"
            placeholder="Confirm your password"
            {...register("password_confirm")}
          />
          {errors.password_confirm && <p className="text-sm text-destructive">{errors.password_confirm.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="location" placeholder="City, Country" className="pl-10" {...register("location")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
          <div className="relative">
            <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="profile_photo_url" placeholder="https://example.com/photo.jpg" className="pl-10" {...register("profile_photo_url")} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_public"
            checked={watch("is_public")}
            onCheckedChange={(checked) => setValue("is_public", checked as boolean)}
          />
          <Label htmlFor="is_public">Make my profile public</Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Availability</Label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${option}`}
                  checked={watchedAvailability?.includes(option)}
                  onCheckedChange={() => toggleAvailability(option)}
                />
                <Label htmlFor={`availability-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preferred Time Slots</Label>
          <div className="grid grid-cols-2 gap-2">
            {TIMESLOT_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`timeslot-${option}`}
                  checked={watchedTimeslot?.includes(option)}
                  onCheckedChange={() => toggleTimeslot(option)}
                />
                <Label htmlFor={`timeslot-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" placeholder="https://linkedin.com/in/username" {...register("linkedin")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" placeholder="https://github.com/username" {...register("github")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" placeholder="https://instagram.com/username" {...register("instagram")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" placeholder="https://youtube.com/@username" {...register("youtube")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" placeholder="https://facebook.com/username" {...register("facebook")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="x">X (Twitter)</Label>
            <Input id="x" placeholder="https://x.com/username" {...register("x")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="personal_portfolio">Personal Portfolio</Label>
          <Input id="personal_portfolio" placeholder="https://your-portfolio.com" {...register("personal_portfolio")} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  )
}
