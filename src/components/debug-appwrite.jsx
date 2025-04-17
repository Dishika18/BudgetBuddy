"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { account } from "@/lib/appwrite"

export function DebugAppwrite() {
  const [status, setStatus] = useState("Checking...")
  const [details, setDetails] = useState({})
  const [error, setError] = useState(null)

  const checkConnection = async () => {
    setStatus("Checking...")
    setError(null)

    try {
      // Check if environment variables are set
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID

      setDetails({
        endpoint: endpoint || "Not set",
        projectId: projectId ? "Set ✓" : "Not set ✗",
        databaseId: databaseId ? "Set ✓" : "Not set ✗",
      })

      if (!endpoint || !projectId) {
        setStatus("Failed")
        setError("Missing environment variables")
        return
      }

      // Try to get Appwrite health status
      try {
        // Try to get the current session
        const session = await account.getSession("current")
        setStatus("Connected with session")
        setDetails((prev) => ({
          ...prev,
          session: "Valid session found",
          sessionId: session.$id,
        }))
      } catch (sessionError) {
        // No valid session
        setStatus("Connected without session")
        setDetails((prev) => ({
          ...prev,
          session: "No valid session",
        }))
      }
    } catch (err) {
      setStatus("Failed")
      setError(err.message || "Unknown error occurred")
      console.error("Appwrite debug error:", err)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const createTestSession = async () => {
    try {
      setStatus("Creating test session...")
      // This will only work if you've created a test user in Appwrite
      await account.createAnonymousSession()
      checkConnection()
    } catch (err) {
      setError(`Failed to create test session: ${err.message}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Appwrite Connection Debug</CardTitle>
        <CardDescription>Check your Appwrite connection status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Status:</span>
          <span
            className={`px-2 py-1 rounded text-sm ${
              status.includes("Connected")
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : status === "Failed"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="space-y-2">
          <p className="font-medium">Environment Variables:</p>
          <div className="text-sm space-y-1 bg-muted p-2 rounded">
            <p>Endpoint: {details.endpoint}</p>
            <p>Project ID: {details.projectId}</p>
            <p>Database ID: {details.databaseId}</p>
          </div>
        </div>

        {details.session && (
          <div className="space-y-2">
            <p className="font-medium">Session:</p>
            <div className="text-sm space-y-1 bg-muted p-2 rounded">
              <p>{details.session}</p>
              {details.sessionId && <p>Session ID: {details.sessionId}</p>}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-2 rounded text-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={checkConnection} className="flex-1">
            Refresh Status
          </Button>
          <Button onClick={createTestSession} variant="outline" className="flex-1">
            Create Test Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

