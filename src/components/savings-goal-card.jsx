"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { updateSavingsGoal } from "@/lib/data"

export function SavingsGoalCard() {
  const [isEditing, setIsEditing] = useState(false)
  const [goalAmount, setGoalAmount] = useState(10000)
  const [currentAmount, setCurrentAmount] = useState(2500)
  const [newGoalAmount, setNewGoalAmount] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { toast } = useToast()

  const progressPercentage = (currentAmount / goalAmount) * 100
  const remaining = goalAmount - currentAmount

  const handleEditToggle = () => {
    if (isEditing) {
      setNewGoalAmount("")
    } else {
      setNewGoalAmount(goalAmount.toString())
    }
    setIsEditing(!isEditing)
  }

  const handleSaveGoal = async () => {
    if (!newGoalAmount || isNaN(Number.parseFloat(newGoalAmount)) || Number.parseFloat(newGoalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid goal amount.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await updateSavingsGoal(Number.parseFloat(newGoalAmount))
      setGoalAmount(Number.parseFloat(newGoalAmount))
      setIsEditing(false)
      toast({
        title: "Goal updated",
        description: "Your savings goal has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Savings Goal</CardTitle>
          <CardDescription>Track your progress towards your savings goal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <Label htmlFor="goal-amount">Goal Amount ($)</Label>
              <Input
                id="goal-amount"
                type="number"
                min="1"
                step="100"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                placeholder="Enter goal amount"
              />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current</p>
                  <p className="text-2xl font-bold">${currentAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Goal</p>
                  <p className="text-2xl font-bold">${goalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Remaining to save</p>
                <p className="text-xl font-bold mt-1">${remaining.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Save $500 monthly to reach your goal in {Math.ceil(remaining / 500)} months
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={handleEditToggle} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveGoal} disabled={isSaving} className="flex-1">
                {isSaving ? "Saving..." : "Save Goal"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEditToggle} className="w-full">
              Edit Goal
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

