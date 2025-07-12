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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { skillsAPI, userAPI } from "@/lib/api"
import { Skill } from "@/lib/constants"
import { 
  Loader2, 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  CheckCircle, 
  XCircle,
  FileText,
  Link,
  Image
} from "lucide-react"

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  type: z.enum(["Offered", "Wanted"]),
  description: z.string().optional(),
  is_verified: z.boolean().optional(),
  proof_file_url: z.string().url().optional().or(z.literal("")),
  proof_file_type: z.enum(["Link", "Image"]).optional(),
  proof_description: z.string().optional(),
})

type SkillFormData = z.infer<typeof skillSchema>

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      type: "Offered",
      is_verified: false,
    },
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const userData = await userAPI.getMyProfile()
      setSkills(userData.skills || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load skills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SkillFormData) => {
    setActionLoading("submit")
    try {
      if (editingSkill) {
        await skillsAPI.updateSkill(editingSkill.id, data)
        toast({
          title: "Skill Updated",
          description: "Your skill has been updated successfully.",
        })
      } else {
        await skillsAPI.addSkill(data)
        toast({
          title: "Skill Added",
          description: "Your skill has been added successfully.",
        })
      }
      setIsDialogOpen(false)
      setEditingSkill(null)
      reset()
      fetchSkills()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save skill",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (skillId: string) => {
    setActionLoading(skillId)
    try {
      await skillsAPI.deleteSkill(skillId)
      toast({
        title: "Skill Deleted",
        description: "Your skill has been deleted successfully.",
      })
      fetchSkills()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkVerified = async (skillId: string) => {
    setActionLoading(skillId)
    try {
      await skillsAPI.markSkillVerified(skillId)
      toast({
        title: "Skill Verified",
        description: "Your skill has been marked as verified.",
      })
      fetchSkills()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify skill",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill)
    setValue("name", skill.name)
    setValue("type", skill.type)
    setValue("description", skill.description || "")
    setValue("is_verified", skill.is_verified)
    setValue("proof_file_url", skill.proof_file_url || "")
    setValue("proof_file_type", skill.proof_file_type || "Link")
    setValue("proof_description", skill.proof_description || "")
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingSkill(null)
    reset()
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingSkill(null)
    reset()
  }

  const offeredSkills = skills.filter(skill => skill.type === "Offered")
  const wantedSkills = skills.filter(skill => skill.type === "Wanted")

  if (loading) {
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
          <h1 className="text-3xl font-bold">My Skills</h1>
          <p className="text-muted-foreground">Manage your offered and wanted skills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Skill Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Web Development, Photography"
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="type">Skill Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value) => setValue("type", value as "Offered" | "Wanted")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offered">Offered</SelectItem>
                    <SelectItem value="Wanted">Wanted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your skill level and experience..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="proof_file_url">Proof URL (Optional)</Label>
                <Input
                  id="proof_file_url"
                  {...register("proof_file_url")}
                  placeholder="https://example.com/proof"
                />
              </div>

              <div>
                <Label htmlFor="proof_description">Proof Description (Optional)</Label>
                <Textarea
                  id="proof_description"
                  {...register("proof_description")}
                  placeholder="Describe your proof of skill..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading === "submit"}>
                  {actionLoading === "submit" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingSkill ? "Update Skill" : "Add Skill"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{offeredSkills.length}</div>
                <div className="text-sm text-muted-foreground">Offered Skills</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{wantedSkills.length}</div>
                <div className="text-sm text-muted-foreground">Wanted Skills</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {skills.filter(skill => skill.is_verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified Skills</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {skills.filter(skill => !skill.is_verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Verification</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offered Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <span>Offered Skills ({offeredSkills.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {offeredSkills.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No offered skills yet</p>
              </div>
            ) : (
              offeredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={() => openEditDialog(skill)}
                  onDelete={() => handleDelete(skill.id)}
                  onVerify={() => handleMarkVerified(skill.id)}
                  actionLoading={actionLoading}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Wanted Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-500" />
              <span>Wanted Skills ({wantedSkills.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {wantedSkills.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No wanted skills yet</p>
              </div>
            ) : (
              wantedSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={() => openEditDialog(skill)}
                  onDelete={() => handleDelete(skill.id)}
                  onVerify={() => handleMarkVerified(skill.id)}
                  actionLoading={actionLoading}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface SkillCardProps {
  skill: Skill
  onEdit: () => void
  onDelete: () => void
  onVerify: () => void
  actionLoading: string | null
}

function SkillCard({ skill, onEdit, onDelete, onVerify, actionLoading }: SkillCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{skill.name}</h3>
          {skill.description && (
            <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {skill.is_verified ? (
            <Badge variant="default" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center space-x-1">
              <XCircle className="h-3 w-3" />
              <span>Unverified</span>
            </Badge>
          )}
        </div>
      </div>

      {skill.proof_file_url && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {skill.proof_file_type === "Image" ? (
            <Image className="h-4 w-4" />
          ) : (
            <Link className="h-4 w-4" />
          )}
          <a
            href={skill.proof_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Proof
          </a>
        </div>
      )}

      {skill.proof_description && (
        <p className="text-sm text-muted-foreground">{skill.proof_description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Verification count: {skill.verification_count}
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={actionLoading === skill.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {!skill.is_verified && (
            <Button
              size="sm"
              variant="outline"
              onClick={onVerify}
              disabled={actionLoading === skill.id}
            >
              {actionLoading === skill.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={actionLoading === skill.id}
          >
            {actionLoading === skill.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 