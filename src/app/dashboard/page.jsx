"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getUserData, getFinancialData, getGoals } from "@/lib/data"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseChart } from "@/components/expense-chart"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import {
  PlusCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  Target,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { addTransaction, addBudget, addGoal } from "@/lib/data"
import { FinancialInsights } from "@/components/financial-insights"

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

const incomeCategories = ["Salary", "Freelance", "Investments", "Gifts", "Other"]

export default function DashboardPage() {
  const [userData, setUserData] = useState(null)
  const [financialData, setFinancialData] = useState(null)
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    amount: "",
    period: "monthly",
  })

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    description: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, financial, goalsData] = await Promise.all([getUserData(), getFinancialData(), getGoals()])
        setUserData(user)
        setFinancialData(financial)
        setGoals(goalsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await addTransaction({
        type: transactionForm.type,
        amount: Number.parseFloat(transactionForm.amount),
        category: transactionForm.category,
        description: transactionForm.description,
        date: transactionForm.date,
      })

      toast({
        title: "Transaction added",
        description: "Your transaction has been successfully recorded.",
      })

      setIsAddTransactionOpen(false)
      resetTransactionForm()
      refreshData()
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddBudget = async () => {
    if (!budgetForm.category || !budgetForm.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await addBudget({
        category: budgetForm.category,
        amount: Number.parseFloat(budgetForm.amount),
        period: budgetForm.period,
      })

      toast({
        title: "Budget added",
        description: "Your budget has been successfully created.",
      })

      setIsAddBudgetOpen(false)
      resetBudgetForm()
      refreshData()
    } catch (error) {
      console.error("Error adding budget:", error)
      toast({
        title: "Error",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      await addGoal({
        name: goalForm.name,
        targetAmount: Number.parseFloat(goalForm.targetAmount),
        currentAmount: 0,
        targetDate: goalForm.targetDate,
        description: goalForm.description || "",
      })

      toast({
        title: "Goal added",
        description: "Your savings goal has been successfully created.",
      })

      setIsAddGoalOpen(false)
      resetGoalForm()
      refreshData()
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetTransactionForm = () => {
    setTransactionForm({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const resetBudgetForm = () => {
    setBudgetForm({
      category: "",
      amount: "",
      period: "monthly",
    })
  }

  const resetGoalForm = () => {
    setGoalForm({
      name: "",
      targetAmount: "",
      targetDate: "",
      description: "",
    })
  }

  const refreshData = async () => {
    try {
      const [financial, goalsData] = await Promise.all([getFinancialData(), getGoals()])
      setFinancialData(financial)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error refreshing data:", error)
    }
  }

  const navigateTo = (path) => {
    router.push(path)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Default data if none exists
  const data = financialData || {
    income: 0,
    expenses: 0,
    savingsGoal: 0,
    savingsProgress: 0,
    expenseCategories: [],
    monthlyData: [],
  }

  const remainingBudget = data.income - (data.expenses + data.savingsGoal)
  const savingsPercentage = data.savingsGoal > 0 ? (data.savingsProgress / data.savingsGoal) * 100 : 0

  // Calculate percentages for goals
  const calculatePercentage = (goal) => {
    return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {userData?.name || "User"}!</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddTransactionOpen(true)} variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button onClick={() => setIsAddBudgetOpen(true)} variant="outline" className="gap-2">
            <PieChart className="h-4 w-4" />
            Add Budget
          </Button>
          <Button onClick={() => setIsAddGoalOpen(true)} variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-500/10 to-green-500/5">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${data.income.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-rose-500/10 to-rose-500/5">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${data.expenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5">
              <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${remainingBudget < 0 ? "text-destructive" : ""}`}>
                ${remainingBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">After expenses & savings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-500/10 to-purple-500/5">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">${data.savingsGoal.toLocaleString()}</div>
              <div className="mt-2">
                <Progress value={savingsPercentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${data.savingsProgress.toLocaleString()} of ${data.savingsGoal.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Your income and expenses over time</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo("/dashboard/transactions")} className="gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">View All</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="monthly">
                <TabsList className="mb-4">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly" className="h-[300px]">
                  <IncomeExpenseChart data={data.monthlyData} />
                </TabsContent>
                <TabsContent value="yearly" className="h-[300px]">
                  <IncomeExpenseChart data={data.monthlyData} yearly />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo("/dashboard/budget")} className="gap-1">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Budgets</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ExpenseChart data={data.expenseCategories} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Savings Goals</CardTitle>
                <CardDescription>Track your progress towards financial goals</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateTo("/dashboard/goals")} className="gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">View All</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map((goal) => (
                    <div key={goal.$id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.name}</span>
                        <span>{calculatePercentage(goal)}%</span>
                      </div>
                      <Progress value={calculatePercentage(goal)} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No savings goals found. Add your first goal!
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4" onClick={() => setIsAddGoalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <FinancialInsights />
        </motion.div>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a new income or expense transaction.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <RadioGroup
                defaultValue="expense"
                value={transactionForm.type}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value, category: "" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">
                    Expense
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">
                    Income
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={transactionForm.category}
                onValueChange={(value) => setTransactionForm({ ...transactionForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(transactionForm.type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Budget Dialog */}
      <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>Create a new budget for a specific category.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select
                value={budgetForm.category}
                onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}
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
                value={budgetForm.amount}
                onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-period">Period</Label>
              <Select
                value={budgetForm.period}
                onValueChange={(value) => setBudgetForm({ ...budgetForm, period: value })}
              >
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
            <Button variant="outline" onClick={() => setIsAddBudgetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBudget}>Add Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
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
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
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
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date">Target Date</Label>
              <Input
                id="goal-date"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description">Description (Optional)</Label>
              <Input
                id="goal-description"
                placeholder="Optional description"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
