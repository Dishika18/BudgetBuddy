"use client"

import { DebugAppwrite } from "@/components/debug-appwrite"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DebugPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Tools</h1>

        <DebugAppwrite />

        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

