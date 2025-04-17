"use client"

import { useEffect, useRef } from "react"
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion"

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export function ExpenseChart({ data = [] }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    // Default data if none provided
    const chartData =
      data.length > 0
        ? data
        : [
            { category: "Housing", amount: 1200 },
            { category: "Food", amount: 400 },
            { category: "Transportation", amount: 200 },
            { category: "Utilities", amount: 150 },
            { category: "Entertainment", amount: 100 },
          ]

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.map((item) => item.category),
        datasets: [
          {
            data: chartData.map((item) => item.amount),
            backgroundColor: [
              "rgba(34, 197, 94, 0.7)", // Green
              "rgba(59, 130, 246, 0.7)", // Blue
              "rgba(168, 85, 247, 0.7)", // Purple
              "rgba(249, 115, 22, 0.7)", // Orange
              "rgba(236, 72, 153, 0.7)", // Pink
              "rgba(234, 179, 8, 0.7)", // Yellow
              "rgba(99, 102, 241, 0.7)", // Indigo
              "rgba(20, 184, 166, 0.7)", // Teal
            ],
            borderColor: [
              "rgba(34, 197, 94, 1)",
              "rgba(59, 130, 246, 1)",
              "rgba(168, 85, 247, 1)",
              "rgba(249, 115, 22, 1)",
              "rgba(236, 72, 153, 1)",
              "rgba(234, 179, 8, 1)",
              "rgba(99, 102, 241, 1)",
              "rgba(20, 184, 166, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
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
                const label = context.label || ""
                const value = context.raw || 0
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((value / total) * 100)
                return `${label}: $${value.toLocaleString()} (${percentage}%)`
              },
            },
          },
        },
        cutout: "70%",
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
        },
      },
    })

    // Update chart when theme changes
    const observer = new MutationObserver(() => {
      if (chartInstance.current) {
        chartInstance.current.options.plugins.legend.labels.color = document.documentElement.classList.contains("dark")
          ? "#e5e7eb"
          : "#374151"
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
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas ref={chartRef} />
    </motion.div>
  )
}

