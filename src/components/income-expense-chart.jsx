"use client"

import { useEffect, useRef } from "react"
import { Chart, BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion"

Chart.register(BarController, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function IncomeExpenseChart({ data = [], yearly = false }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    // Default data if none provided
    const defaultData = [
      { month: "Jan", income: 3000, expenses: 2100 },
      { month: "Feb", income: 3200, expenses: 2300 },
      { month: "Mar", income: 3100, expenses: 2200 },
      { month: "Apr", income: 3400, expenses: 2400 },
      { month: "May", income: 3300, expenses: 2000 },
      { month: "Jun", income: 3500, expenses: 2600 },
    ]

    const chartData = data.length > 0 ? data : defaultData

    // Process data based on yearly flag
    let processedData
    if (yearly) {
      // Group by quarter for yearly view
      const quarters = {
        Q1: { income: 0, expenses: 0 },
        Q2: { income: 0, expenses: 0 },
        Q3: { income: 0, expenses: 0 },
        Q4: { income: 0, expenses: 0 },
      }

      chartData.forEach((item, index) => {
        const quarterIndex = Math.floor(index / 3)
        const quarter = `Q${quarterIndex + 1}`
        if (quarters[quarter]) {
          quarters[quarter].income += item.income
          quarters[quarter].expenses += item.expenses
        }
      })

      processedData = Object.entries(quarters).map(([quarter, data]) => ({
        month: quarter,
        income: data.income,
        expenses: data.expenses,
      }))
    } else {
      processedData = chartData
    }

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")

    // Update the chart options for a more modern look
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: processedData.map((item) => item.month),
        datasets: [
          {
            label: "Income",
            data: processedData.map((item) => item.income),
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "Expenses",
            data: processedData.map((item) => item.expenses),
            backgroundColor: "rgba(239, 68, 68, 0.7)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
              font: {
                family: "'Inter', sans-serif",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: document.documentElement.classList.contains("dark")
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
              callback: (value) => "$" + value.toLocaleString(),
              font: {
                family: "'Inter', sans-serif",
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#374151",
              font: {
                size: 12,
                family: "'Inter', sans-serif",
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#ffffff",
            titleColor: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#111827",
            bodyColor: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#4b5563",
            borderColor: document.documentElement.classList.contains("dark") ? "#374151" : "#e5e7eb",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || ""
                const value = context.raw || 0
                return `${label}: $${value.toLocaleString()}`
              },
            },
          },
        },
        animation: {
          duration: 1000,
        },
      },
    })

    // Update chart when theme changes
    const observer = new MutationObserver(() => {
      if (chartInstance.current) {
        const isDark = document.documentElement.classList.contains("dark")
        chartInstance.current.options.scales.x.ticks.color = isDark ? "#e5e7eb" : "#374151"
        chartInstance.current.options.scales.y.ticks.color = isDark ? "#e5e7eb" : "#374151"
        chartInstance.current.options.scales.y.grid.color = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        chartInstance.current.options.plugins.legend.labels.color = isDark ? "#e5e7eb" : "#374151"
        chartInstance.current.update()
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      observer.disconnect()
    }
  }, [data, yearly])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <canvas ref={chartRef} />
    </motion.div>
  )
}

