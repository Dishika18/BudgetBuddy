import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const cookieStore = cookies()
  const session = cookieStore.get("appwrite_session")

  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
