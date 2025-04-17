"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Edit, Trash2, AlertTriangle, PieChart, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { getBudgets, addBudget, updateBudget, deleteBudget, getTransactions } from "@/lib/data"

const expenseCategories = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Savings",
  "Personal",
  "Entertainment",
  "Debt",
  "Education",
  "Other",
]

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentBudget, setCurrentBudget] = useState(null)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    period: "monthly",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [budgetsData, transactionsData] = await Promise.all([getBudgets(), getTransactions()])
      setBudgets(budgetsData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load budget data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBudget = async () => {
    if (!formData.category || !formData.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await addBudget({
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        period: formData.period,
      })

      toast({
        title: "Budget added",
        description: "Your budget has been successfully created.",
      })

      setIsAddDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error adding budget:", error)
      toast({
        title: "Error",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditBudget = async () => {
    if (!formData.category || !formData.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateBudget(currentBudget.$id, {
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        period: formData.period,
      })

      toast({
        title: "Budget updated",
        description: "Your budget has been successfully updated.",
      })

      setIsEditDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBudget = async () => {
    try {
      await deleteBudget(currentBudget.$id)

      toast({
        title: "Budget deleted",
        description: "Your budget has been successfully deleted.",
      })

      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error deleting budget:", error)
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      period: "monthly",
    })
  }

  const openEditDialog = (budget) => {
    setCurrentBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (budget) => {
    setCurrentBudget(budget)
    setIsDeleteDialogOpen(true)
  }

  // Calculate spending for each budget category
  const calculateSpending = (category) => {
    const categoryTransactions = transactions.filter((t) => t.type === "expense" && t.category === category)
    return categoryTransactions.reduce((total, t) => total + t.amount, 0)
  }

  // Calculate percentage of budget used
  const calculatePercentage = (budget) => {
    const spent = calculateSpending(budget.category)
    return Math.min(Math.round((spent / budget.amount) * 100), 100)
  }

  // Check if budget is exceeded
  const isBudgetExceeded = (budget) => {
    const spent = calculateSpending(budget.category)
    return spent > budget.amount
  }

  // Calculate total budget and spending
  const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0)
  const totalSpending = transactions.filter((t) => t.type === "expense").reduce((total, t) => total + t.amount, 0)
  const overallPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpending / totalBudget) * 100), 100) : 0

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground mt-1">Manage your spending limits by category</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-blue-500" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-rose-500" />
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">${totalSpending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
            <Progress
              value={overallPercentage}
              className="h-2 mt-2"
              indicatorClassName={overallPercentage > 90 ? "bg-rose-500" : overallPercentage > 75 ? "bg-amber-500" : ""}
            />
          </CardContent>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Manage your spending limits by category</CardDescription>
              </div>
              {/* <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <PieChart className="h-4 w-4" />
                Add New Budget
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budgets found. Add your first budget to start tracking your spending!
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => {
                      const spent = calculateSpending(budget.category)
                      const remaining = budget.amount - spent
                      const percentage = calculatePercentage(budget)
                      const exceeded = isBudgetExceeded(budget)

                      return (
                        <TableRow key={budget.$id}>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted">
                              {budget.category}
                            </span>
                          </TableCell>
                          <TableCell>${budget.amount.toLocaleString()}</TableCell>
                          <TableCell className={exceeded ? "text-destructive font-medium" : ""}>
                            ${spent.toLocaleString()}
                          </TableCell>
                          <TableCell className={remaining < 0 ? "text-destructive font-medium" : ""}>
                            ${remaining.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={percentage}
                                className={`h-2 ${exceeded ? "bg-destructive/20" : ""}`}
                                indicatorClassName={exceeded ? "bg-destructive" : ""}
                              />
                              <span className="text-sm w-12 text-right">{percentage}%</span>
                              {exceeded && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(budget)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(budget)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Budget Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>Create a new budget for a specific category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-amount">Amount ($)</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-period">Period</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                <SelectTrigger id="budget-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBudget}>Add Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>Update your budget for this category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-budget-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-budget-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget-amount">Amount ($)</Label>
              <Input
                id="edit-budget-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget-period">Period</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                <SelectTrigger id="edit-budget-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
