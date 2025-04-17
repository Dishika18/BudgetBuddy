"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    PlusCircle,
    Edit,
    Trash2,
    Target,
    Calendar,
    DollarSign,
    Pencil,
    CheckCircle,
    Clock,
    TrendingUp,
  } from "lucide-react"
import { getGoals, addGoal, updateGoal, deleteGoal, updateGoalProgress } from "@/lib/data"

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false)
  const [currentGoal, setCurrentGoal] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    description: "",
  })
  const [progressAmount, setProgressAmount] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setIsLoading(true)
    try {
      const data = await getGoals()
      setGoals(data)
    } catch (error) {
      console.error("Error fetching goals:", error)
      toast({
        title: "Error",
        description: "Failed to load goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await addGoal({
        name: formData.name,
        targetAmount: Number.parseFloat(formData.targetAmount),
        currentAmount: 0,
        targetDate: formData.targetDate,
        description: formData.description || "",
      })

      toast({
        title: "Goal added",
        description: "Your savings goal has been successfully created.",
      })

      setIsAddDialogOpen(false)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditGoal = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateGoal(currentGoal.$id, {
        name: formData.name,
        targetAmount: Number.parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        description: formData.description || "",
      })

      toast({
        title: "Goal updated",
        description: "Your savings goal has been successfully updated.",
      })

      setIsEditDialogOpen(false)
      resetForm()
      fetchGoals()
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGoal = async () => {
    try {
      await deleteGoal(currentGoal.$id)

      toast({
        title: "Goal deleted",
        description: "Your savings goal has been successfully deleted.",
      })

      setIsDeleteDialogOpen(false)
      fetchGoals()
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProgress = async () => {
    if (!progressAmount) {
      toast({
        title: "Missing amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = Number.parseFloat(progressAmount)
      await updateGoalProgress(currentGoal.$id, amount)

      toast({
        title: "Progress updated",
        description: "Your savings progress has been successfully updated.",
      })

      setIsProgressDialogOpen(false)
      setProgressAmount("")
      fetchGoals()
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      targetDate: "",
      description: "",
    })
  }

  const openEditDialog = (goal) => {
    setCurrentGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      description: goal.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (goal) => {
    setCurrentGoal(goal)
    setIsDeleteDialogOpen(true)
  }

  const openProgressDialog = (goal) => {
    setCurrentGoal(goal)
    setProgressAmount(goal.currentAmount.toString())
    setIsProgressDialogOpen(true)
  }

  // Calculate percentage of goal achieved
  const calculatePercentage = (goal) => {
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Calculate days remaining until target date
  const calculateDaysRemaining = (targetDate) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Calculate total goals and progress
  const totalTargetAmount = goals.reduce((total, goal) => total + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((total, goal) => total + goal.currentAmount, 0)
  const overallPercentage = totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress towards financial goals</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-purple-500" />
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTargetAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
              Current Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalCurrentAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <Progress value={overallPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No savings goals found. Add your first goal to start tracking your progress!
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = calculatePercentage(goal)
            const daysRemaining = calculateDaysRemaining(goal.targetDate)
            const isCompleted = percentage >= 100

            return (
              <Card key={goal.$id} className={`overflow-hidden ${isCompleted ? "border-green-500/50" : ""}`}>
                <CardHeader className={`pb-2 ${isCompleted ? "bg-green-500/10" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Target className={`mr-2 h-5 w-5 ${isCompleted ? "text-green-500" : "text-primary"}`} />
                        {goal.name}
                        {isCompleted && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
                      </CardTitle>
                      <CardDescription className="mt-1">{goal.description || "No description"}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(goal)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(goal)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Target Amount
                      </div>
                      <div className="font-medium">${goal.targetAmount.toLocaleString()}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Target Date
                      </div>
                      <div className="font-medium">{formatDate(goal.targetDate)}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        Days Remaining
                      </div>
                      <div className="font-medium">{daysRemaining}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="text-sm font-medium">
                          ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={isCompleted ? "bg-green-500" : ""}
                      />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div>{percentage}% complete</div>
                        {!isCompleted && <div>{daysRemaining} days remaining</div>}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant={isCompleted ? "outline" : "default"}
                    className="w-full"
                    onClick={() => openProgressDialog(goal)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Update Progress
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </motion.div>

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Savings Goal</DialogTitle>
            <DialogDescription>Create a new savings goal to track your progress.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., New Car"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-amount">Target Amount ($)</Label>
              <Input
                id="goal-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date">Target Date</Label>
              <Input
                id="goal-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description">Description (Optional)</Label>
              <Input
                id="goal-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Savings Goal</DialogTitle>
            <DialogDescription>Update your savings goal details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-name">Name</Label>
              <Input
                id="edit-goal-name"
                placeholder="e.g., New Car"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal-amount">Target Amount ($)</Label>
              <Input
                id="edit-goal-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal-date">Target Date</Label>
              <Input
                id="edit-goal-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal-description">Description (Optional)</Label>
              <Input
                id="edit-goal-description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Savings Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>{currentGoal && `Update your progress for ${currentGoal.name}.`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progress-amount">Current Amount ($)</Label>
              <Input
                id="progress-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
              />
            </div>
            {currentGoal && (
              <div className="text-sm text-muted-foreground">
                Previous amount: ${currentGoal.currentAmount.toLocaleString()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress}>Update Progress</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}


