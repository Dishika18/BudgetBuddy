"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, AlertCircle, CheckCircle2, DollarSign, PieChart, Target, RefreshCw } from "lucide-react"
import { generateInsights } from "@/lib/actions"

export function FinancialInsights() {
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const { toast } = useToast()

  // Default insights for when no data is available
  const defaultInsights = [
    {
      type: "alert",
      message: "Your dining expenses increased by 25% this month",
      icon: "TrendingUp",
    },
    {
      type: "positive",
      message: "You've saved 15% more than last month",
      icon: "TrendingUp",
    },
    {
      type: "suggestion",
      message: "Consider reducing subscription services to save $45 monthly",
      icon: "AlertCircle",
    },
  ]

  useEffect(() => {
    // Load insights on first render
    if (isFirstLoad) {
      handleGenerateInsights()
      setIsFirstLoad(false)
    }
  }, [isFirstLoad])

  const handleGenerateInsights = async () => {
    setIsLoading(true)
    try {
      const result = await generateInsights()

      if (result.success) {
        setInsights(result.insights)

        if (result.cached) {
          toast({
            title: "Insights loaded",
            description: "Using recent insights from your data.",
          })
        } else {
          toast({
            title: "New insights generated",
            description: "AI has analyzed your financial data.",
          })
        }
      } else {
        console.error("Error details:", result.error)
        toast({
          title: "Error generating insights",
          description: result.error || "Please try again later.",
          variant: "destructive",
        })
        // Use default insights if there's an error
        setInsights(defaultInsights)
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      toast({
        title: "Error generating insights",
        description: "Please try again later.",
        variant: "destructive",
      })
      // Use default insights if there's an error
      setInsights(defaultInsights)
    } finally {
      setIsLoading(false)
    }
  }

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "TrendingUp":
        return TrendingUp
      case "AlertCircle":
        return AlertCircle
      case "CheckCircle2":
        return CheckCircle2
      case "DollarSign":
        return DollarSign
      case "PieChart":
        return PieChart
      case "Target":
        return Target
      default:
        return AlertCircle
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "alert":
        return "text-amber-500"
      case "positive":
        return "text-emerald-500"
      case "suggestion":
        return "text-blue-500"
      default:
        return "text-purple-500"
    }
  }

  const getBadgeVariant = (type) => {
    switch (type) {
      case "alert":
        return "destructive"
      case "positive":
        return "success"
      case "suggestion":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getBadgeText = (type) => {
    switch (type) {
      case "alert":
        return "Alert"
      case "positive":
        return "Positive"
      case "suggestion":
        return "Suggestion"
      default:
        return "Insight"
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Financial Insights</CardTitle>
            <CardDescription>AI-powered analysis of your financial habits</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerateInsights} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating..." : "Generate Insights"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loading state
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
            ) : insights.length > 0 ? (
              // Display insights
              insights.map((insight, index) => {
                const Icon = getIconComponent(insight.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className={`mt-0.5 ${getIconColor(insight.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(insight.type)}>{getBadgeText(insight.type)}</Badge>
                      </div>
                      <p className="text-sm">{insight.message}</p>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              // No insights available
              <div className="text-center py-4 text-muted-foreground">
                No insights available. Click "Generate Insights" to analyze your financial data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
