"use client"

import React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { swapRequestsAPI, userAPI } from "@/lib/api"
import { User, Skill } from "@/lib/constants"

const swapRequestSchema = z.object({
  offered_skill_id: z.string().min(1, "Please select a skill to offer"),
  requested_skill_id: z.string().min(1, "Please select a skill you want"),
  message: z.string().optional(),
})

type SwapRequestFormData = z.infer<typeof swapRequestSchema>

interface SwapRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUser: User
}

export function SwapRequestModal({ open, onOpenChange, targetUser }: SwapRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [mySkills, setMySkills] = useState<Skill[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SwapRequestFormData>({
    resolver: zodResolver(swapRequestSchema),
  })

  const offeredSkillId = watch("offered_skill_id")
  const requestedSkillId = watch("requested_skill_id")

  // Fetch user's skills when modal opens
  React.useEffect(() => {
    if (open && user) {
      fetchMySkills()
    }
  }, [open, user])

  const fetchMySkills = async () => {
    try {
      const userData = await userAPI.getMyProfile()
      setMySkills(userData.skills || [])
    } catch (error) {
      console.error("Failed to fetch skills:", error)
      toast({
        title: "Error",
        description: "Failed to load your skills",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: SwapRequestFormData) => {
    setIsLoading(true)
    try {
      await swapRequestsAPI.createSwapRequest({
        receiver_id: targetUser.id,
        offered_skill_id: data.offered_skill_id,
        requested_skill_id: data.requested_skill_id,
        message: data.message,
      })

      toast({
        title: "Swap request sent!",
        description: `Your request has been sent to ${targetUser.name}.`,
      })

      reset()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send swap request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const myOfferedSkills = mySkills.filter((skill) => skill.type === "Offered")
  const targetWantedSkills = targetUser.skills?.filter((skill) => skill.type === "Wanted") || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Swap with {targetUser.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="offered_skill">My Offered Skill</Label>
            <Select onValueChange={(value: string) => setValue("offered_skill_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer" />
              </SelectTrigger>
              <SelectContent>
                {myOfferedSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.offered_skill_id && <p className="text-sm text-destructive">{errors.offered_skill_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested_skill">Their Wanted Skill</Label>
            <Select onValueChange={(value: string) => setValue("requested_skill_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill they want" />
              </SelectTrigger>
              <SelectContent>
                {targetWantedSkills.map((skill) => (
                  <SelectItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requested_skill_id && (
              <p className="text-sm text-destructive">{errors.requested_skill_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea id="message" placeholder="Tell them why you'd like to swap skills..." {...register("message")} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
