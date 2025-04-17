"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getUserData, updateUserProfile, updateUserPreferences } from "@/lib/data"
import { User, Mail, Bell, AlertTriangle, Wallet, Shield, Key, Smartphone, Globe, HelpCircle } from "lucide-react"


export default function SettingsPage() {
  const [userData, setUserData] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [budgetAlerts, setBudgetAlerts] = useState(false)
  const [savingsReminders, setSavingsReminders] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(false)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getUserData()
        setUserData(user)
        setName(user.name)
        setEmail(user.email)
        setEmailNotifications(user.preferences?.emailNotifications || false)
        setBudgetAlerts(user.preferences?.budgetAlerts || false)
        setSavingsReminders(user.preferences?.savingsReminders || false)
        setWeeklyReports(user.preferences?.weeklyReports || false)
        setSecurityAlerts(user.preferences?.securityAlerts !== undefined ? user.preferences.securityAlerts : true)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserProfile({ name, email })
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setIsSaving(true)

    try {
      await updateUserPreferences({
        emailNotifications,
        budgetAlerts,
        savingsReminders,
        weeklyReports,
        securityAlerts,
      })
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast({
        title: "Update failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your account activity</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts" className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
                      Budget Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you're close to exceeding your budget
                    </p>
                  </div>
                  <Switch id="budget-alerts" checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="savings-reminders" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />
                      Savings Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders to help you reach your savings goals
                    </p>
                  </div>
                  <Switch id="savings-reminders" checked={savingsReminders} onCheckedChange={setSavingsReminders} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      Weekly Reports
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly summary reports of your financial activity
                    </p>
                  </div>
                  <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handlePreferencesUpdate} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="security-alerts" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      Security Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about suspicious activity on your account
                    </p>
                  </div>
                  <Switch id="security-alerts" checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="text-sm">••••••••••••</div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                    Two-Factor Authentication
                  </Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="text-sm">Not enabled</div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    Account Recovery
                  </Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="text-sm">Recovery email: {email}</div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handlePreferencesUpdate} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Security Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  )
}


