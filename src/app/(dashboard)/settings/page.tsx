'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertTriangle, LogOut, Moon, Sun, Monitor } from 'lucide-react'
import { seedDemoData } from '@/actions/auth'
import { getTransactions } from '@/actions/transactions'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [hasTransactions, setHasTransactions] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkData() {
      try {
        const result = await getTransactions()
        setHasTransactions(result.total > 0)
      } catch (e) {
        console.error(e)
      }
    }
    checkData()
  }, [])

  const handleSeedDemoData = async () => {
    setLoading(true)
    try {
      await seedDemoData()
      toast.success('Demo data loaded successfully!')
      setHasTransactions(true)
      // Hard reload to refresh all data
      window.location.href = '/'
    } catch (error) {
      toast.error('Failed to load demo data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={session?.user?.name || ''} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user?.email || ''} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how MoneyFlow Pro looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {!hasTransactions && (
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">Demo Data</CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                Populate your account with sample data for demonstration purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 text-sm text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 p-4 rounded-md">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                  This action will create sample categories, transactions, people, and loans.
                  This is recommended for new users to see how the application works.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeedDemoData} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Loading...' : 'Load Demo Data'}
              </Button>
            </CardFooter>
          </Card>
        )}

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Actions that cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
