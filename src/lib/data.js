import {
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
  GOALS_COLLECTION_ID,
  BUDGETS_COLLECTION_ID,
  INSIGHTS_COLLECTION_ID,
  ID,
} from "./appwrite"
import { Query } from "appwrite"
import { getCurrentUser } from "./auth"

export async function createUserDocument(userId, userData) {
  try {
    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      userId,
      userData
    );

    console.log("User document created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
}



// Get user data
export async function getUserData() {
  try {
    const user = await getCurrentUser();
    // console.log("Current User:", user);

    if (!user) throw new Error("User not authenticated");


    const allUsers = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    // console.log("All Users in DB:", allUsers.documents);

    const userExists = allUsers.documents.some(doc => doc.$id === user.$id);
    if (!userExists) {
      throw new Error(`User with ID ${user.$id} not found in database.`);
    }

    return await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id);
  } catch (error) {
    console.error("Get user data error:", error);
    return null;
  }
}



// Update user profile
export async function updateUserProfile(profileData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, profileData)
  } catch (error) {
    console.error("Update user profile error:", error)
    throw error
  }
}

// Update user preferences
export async function updateUserPreferences(preferences) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, user.$id, { preferences })
  } catch (error) {
    console.error("Update user preferences error:", error)
    throw error
  }
}

// Get financial data
export async function getFinancialData() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Get transactions
    const transactions = await databases.listDocuments(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, [
      Query.equal("userId", user.$id),
    ])

    // Get savings goals
    const goals = await databases.listDocuments(DATABASE_ID, GOALS_COLLECTION_ID, [Query.equal("userId", user.$id)])

    // Calculate totals
    let income = 0
    let expenses = 0
    const expenseCategories = {}
    const monthlyData = {}

    transactions.documents.forEach((transaction) => {
      const amount = transaction.amount
      const month = new Date(transaction.date).toLocaleString("default", { month: "short" })

      // Initialize month data if it doesn't exist
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        income += amount
        monthlyData[month].income += amount
      } else {
        expenses += amount
        monthlyData[month].expenses += amount

        // Track expense categories
        if (!expenseCategories[transaction.category]) {
          expenseCategories[transaction.category] = 0
        }
        expenseCategories[transaction.category] += amount
      }
    })

    // Convert expense categories to array format for chart
    const expenseCategoriesArray = Object.entries(expenseCategories).map(([category, amount]) => ({
      category,
      amount,
    }))

    // Convert monthly data to array and sort by month
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyDataArray = Object.values(monthlyData).sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
    )

    // Get savings goal data
    let savingsGoal = 0
    let savingsProgress = 0

    if (goals.documents.length > 0) {
      const latestGoal = goals.documents[0]
      savingsGoal = latestGoal.targetAmount
      savingsProgress = latestGoal.currentAmount
    }

    return {
      income,
      expenses,
      savingsGoal,
      savingsProgress,
      expenseCategories: expenseCategoriesArray,
      monthlyData: monthlyDataArray,
    }
  } catch (error) {
    console.error("Get financial data error:", error)
    // Return mock data for demo purposes
    return {
      income: 5000,
      expenses: 3200,
      savingsGoal: 10000,
      savingsProgress: 2500,
      expenseCategories: [
        { category: "Housing", amount: 1200 },
        { category: "Food", amount: 600 },
        { category: "Transportation", amount: 400 },
        { category: "Utilities", amount: 300 },
        { category: "Entertainment", amount: 200 },
        { category: "Healthcare", amount: 300 },
        { category: "Other", amount: 200 },
      ],
      monthlyData: [
        { month: "Jan", income: 4800, expenses: 3000 },
        { month: "Feb", income: 4900, expenses: 3100 },
        { month: "Mar", income: 5000, expenses: 3200 },
        { month: "Apr", income: 5000, expenses: 3300 },
        { month: "May", income: 5100, expenses: 3100 },
        { month: "Jun", income: 5000, expenses: 3200 },
      ],
    }
  }
}

// Get transactions
export async function getTransactions() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const transactions = await databases.listDocuments(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, [
      Query.equal("userId", user.$id),
      Query.orderDesc("date"),
    ])

    return transactions.documents
  } catch (error) {
    console.error("Get transactions error:", error)
    // Return mock data for demo purposes
    return [
      {
        $id: "transaction1",
        userId: "user123",
        type: "expense",
        amount: 1200,
        category: "Housing",
        description: "Monthly rent",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
      {
        $id: "transaction2",
        userId: "user123",
        type: "expense",
        amount: 200,
        category: "Food",
        description: "Grocery shopping",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
      {
        $id: "transaction3",
        userId: "user123",
        type: "income",
        amount: 5000,
        category: "Salary",
        description: "Monthly salary",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      },
    ]
  }
}

// Add transaction
export async function addTransaction(transactionData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.createDocument(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      ...transactionData,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Add transaction error:", error)
    throw error
  }
}

// Update transaction
export async function updateTransaction(transactionId, transactionData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, transactionId, transactionData)
  } catch (error) {
    console.error("Update transaction error:", error)
    throw error
  }
}

// Delete transaction
export async function deleteTransaction(transactionId) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.deleteDocument(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, transactionId)
  } catch (error) {
    console.error("Delete transaction error:", error)
    throw error
  }
}

// Get budgets
export async function getBudgets() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const budgets = await databases.listDocuments(
      DATABASE_ID,
      BUDGETS_COLLECTION_ID, // Make sure to create this collection in Appwrite
      [Query.equal("userId", user.$id)],
    )

    return budgets.documents
  } catch (error) {
    console.error("Get budgets error:", error)
    // Return mock data for demo purposes
    return [
      {
        $id: "budget1",
        userId: "user123",
        category: "Housing",
        amount: 1500,
        period: "monthly",
      },
      {
        $id: "budget2",
        userId: "user123",
        category: "Food",
        amount: 500,
        period: "monthly",
      },
      {
        $id: "budget3",
        userId: "user123",
        category: "Entertainment",
        amount: 200,
        period: "monthly",
      },
    ]
  }
}

// Add budget
export async function addBudget(budgetData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.createDocument(DATABASE_ID, BUDGETS_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      ...budgetData,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Add budget error:", error)
    throw error
  }
}

// Update budget
export async function updateBudget(budgetId, budgetData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, BUDGETS_COLLECTION_ID, budgetId, budgetData)
  } catch (error) {
    console.error("Update budget error:", error)
    throw error
  }
}

// Delete budget
export async function deleteBudget(budgetId) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.deleteDocument(DATABASE_ID, BUDGETS_COLLECTION_ID, budgetId)
  } catch (error) {
    console.error("Delete budget error:", error)
    throw error
  }
}

// Get goals
export async function getGoals() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const goals = await databases.listDocuments(DATABASE_ID, GOALS_COLLECTION_ID, [Query.equal("userId", user.$id)])

    return goals.documents
  } catch (error) {
    console.error("Get goals error:", error)
    // Return mock data for demo purposes
    return [
      {
        $id: "goal1",
        userId: "user123",
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 2500,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
        description: "Six months of living expenses",
      },
      {
        $id: "goal2",
        userId: "user123",
        name: "New Car",
        targetAmount: 20000,
        currentAmount: 5000,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        description: "Saving for a new electric vehicle",
      },
    ]
  }
}

// Add goal
export async function addGoal(goalData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.createDocument(DATABASE_ID, GOALS_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      ...goalData,
      progress: 0,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Add goal error:", error)
    throw error
  }
}

// Update goal
export async function updateGoal(goalId, goalData) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, GOALS_COLLECTION_ID, goalId, goalData)
  } catch (error) {
    console.error("Update goal error:", error)
    throw error
  }
}

// Update goal progress
export async function updateGoalProgress(goalId, amount) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.updateDocument(DATABASE_ID, GOALS_COLLECTION_ID, goalId, { currentAmount: amount })
  } catch (error) {
    console.error("Update goal progress error:", error)
    throw error
  }
}

// Delete goal
export async function deleteGoal(goalId) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    return await databases.deleteDocument(DATABASE_ID, GOALS_COLLECTION_ID, goalId)
  } catch (error) {
    console.error("Delete goal error:", error)
    throw error
  }
}

// Update savings goal
export async function updateSavingsGoal(amount) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Get existing goals
    const goals = await databases.listDocuments(DATABASE_ID, GOALS_COLLECTION_ID, [Query.equal("userId", user.$id)])

    if (goals.documents.length > 0) {
      // Update existing goal
      const latestGoal = goals.documents[0]
      return await databases.updateDocument(DATABASE_ID, GOALS_COLLECTION_ID, latestGoal.$id, { 
        targetAmount: amount  // Changed from 'amount' to 'targetAmount'
      })
    } else {
      // Create new goal
      return await databases.createDocument(DATABASE_ID, GOALS_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        name: "New Savings Goal",
        targetAmount: amount,
        currentAmount: 0,
        progress: 0,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
        description: "Auto-created savings goal",
        createdAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Update savings goal error:", error)
    throw error
  }
}

// Get insights
export async function getInsights() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const insights = await databases.listDocuments(
      DATABASE_ID,
      INSIGHTS_COLLECTION_ID,
      [Query.equal("userId", user.$id)],
      [Query.orderDesc("createdAt")],
      1,
    )

    if (insights.documents.length > 0) {
      return insights.documents[0].insights
    }

    return []
  } catch (error) {
    console.error("Get insights error:", error)
    return []
  }
}
