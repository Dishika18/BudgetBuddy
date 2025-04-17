"use server"

import { ID } from "appwrite"
import { databases, DATABASE_ID, INSIGHTS_COLLECTION_ID } from "./appwrite"
import { getCurrentUser } from "./auth"
import { getBudgets } from "./data"
import { getGoals } from "./data"
import { getTransactions } from "./data"

export async function generateInsights() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Check if we have recent insights (less than 24 hours old)
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    try {
      const existingInsights = await databases.listDocuments(DATABASE_ID, INSIGHTS_COLLECTION_ID, [
        { field: "userId", operator: "equal", value: user.$id },
        { field: "createdAt", operator: "greaterThan", value: yesterday.toISOString() },
      ])

      // If we have recent insights, return them
      if (existingInsights.documents.length > 0) {
        return {
          success: true,
          insights: existingInsights.documents[0].insights,
          cached: true,
        }
      }
    } catch (error) {
      console.error("Error checking for existing insights:", error)
      // Continue to generate new insights if there was an error checking
    }

    // Fetch user's financial data
    const [budgets, goals, transactions] = await Promise.all([getBudgets(), getGoals(), getTransactions()])

    // Prepare data for Hugging Face
    const financialData = {
      budgets: budgets.map((b) => ({
        category: b.category,
        amount: b.amount,
        period: b.period,
      })),
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
        description: g.description,
      })),
      transactions: transactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
      })),
    }

    // Create a prompt for the model
    const prompt = `
  You are a financial advisor analyzing this user's financial data:
  
  Budgets: ${budgets.length} items
  Goals: ${goals.length} items
  Transactions: ${transactions.length} items
  
  Based on this data, provide 3 financial insights in JSON format like this:
  [
    {"type": "alert", "message": "Your dining expenses increased by 25% this month", "icon": "TrendingUp"},
    {"type": "positive", "message": "You've saved 15% more than last month", "icon": "CheckCircle2"},
    {"type": "suggestion", "message": "Consider reducing subscription services to save $45 monthly", "icon": "AlertCircle"}
  ]
  
  Only return the JSON array, nothing else.
`

    // Call Hugging Face API
    const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN
    if (!HUGGINGFACE_API_TOKEN) {
      throw new Error("Hugging Face API token is not configured")
    }

    // Using google/flan-t5-xl model for better text generation
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-xl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1024,
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API error: ${errorText}`)
    }

    // Parse the response - Hugging Face returns an array with generated text
    const data = await response.json()

    // Parse the response - Hugging Face returns an array with generated text
    let insights
    try {
      // The model might not always return perfect JSON, so we need to handle parsing errors
      const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text || data

      // Try to extract JSON from the text (the model might include explanatory text)
      let jsonString = generatedText
      if (typeof generatedText === "string") {
        const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
        jsonString = jsonMatch ? jsonMatch[0] : generatedText
      }

      // Try to parse the JSON
      try {
        insights = JSON.parse(jsonString)
      } catch (jsonError) {
        // If direct parsing fails, try to clean the string
        const cleanedString = jsonString.replace(/\\n/g, "").replace(/\\"/g, '"').trim()
        insights = JSON.parse(cleanedString)
      }

      // Validate the structure
      if (!Array.isArray(insights)) {
        throw new Error("Response is not an array")
      }

      // Ensure each insight has the required properties
      insights = insights
        .map((insight) => ({
          type: insight.type || "suggestion",
          message: insight.message || "Consider reviewing your financial data regularly",
          icon: insight.icon || "AlertCircle",
        }))
        .slice(0, 3) // Limit to 3 insights
    } catch (parseError) {
      console.error("Error parsing model response:", parseError, data)

      // Fallback insights if parsing fails
      insights = [
        {
          type: "suggestion",
          message: "Consider reviewing your budget allocations to optimize your spending",
          icon: "PieChart",
        },
        {
          type: "alert",
          message: "Monitor your spending patterns to identify potential areas for savings",
          icon: "AlertCircle",
        },
        {
          type: "positive",
          message: "Setting financial goals is a great step toward financial well-being",
          icon: "Target",
        },
      ]
    }

    // If we get here and still don't have valid insights, try a simpler model as fallback
    if (!insights || insights.length === 0) {
      try {
        // Try with a simpler model
        const fallbackResponse = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-base", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          },
          body: JSON.stringify({
            inputs: "Generate 3 financial insights in JSON format. Make them generic and helpful.",
            parameters: {
              max_length: 512,
              temperature: 0.3,
            },
          }),
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          const fallbackText = Array.isArray(fallbackData)
            ? fallbackData[0].generated_text
            : fallbackData.generated_text || fallbackData

          try {
            // Try to parse as JSON
            const parsedInsights = JSON.parse(fallbackText)
            if (Array.isArray(parsedInsights) && parsedInsights.length > 0) {
              insights = parsedInsights.slice(0, 3).map((insight) => ({
                type: insight.type || "suggestion",
                message: insight.message || "Consider reviewing your financial data regularly",
                icon: insight.icon || "AlertCircle",
              }))
            }
          } catch (fallbackParseError) {
            // If parsing fails, we'll use the default fallback insights
            console.error("Error parsing fallback model response:", fallbackParseError)
          }
        }
      } catch (fallbackError) {
        console.error("Error with fallback model:", fallbackError)
      }
    }

    // If we still don't have insights, use the default fallback
    if (!insights || insights.length === 0) {
      insights = [
        {
          type: "suggestion",
          message: "Consider reviewing your budget allocations to optimize your spending",
          icon: "PieChart",
        },
        {
          type: "alert",
          message: "Monitor your spending patterns to identify potential areas for savings",
          icon: "AlertCircle",
        },
        {
          type: "positive",
          message: "Setting financial goals is a great step toward financial well-being",
          icon: "Target",
        },
      ]
    }

    // Save insights to Appwrite
    await databases.createDocument(DATABASE_ID, INSIGHTS_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      insights: insights,
      createdAt: new Date().toISOString(),
    })

    return {
      success: true,
      insights: insights,
      cached: false,
    }
  } catch (error) {
    console.error("Error generating insights:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
