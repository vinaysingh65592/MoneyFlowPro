'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Calendar, CreditCard, Search, Settings, User } from 'lucide-react'
import { globalSearch } from '@/actions/search'
import { useDebounce } from '@/hooks/use-debounce'

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<{transactions: any[], people: any[], loans: any[]}>({
    transactions: [],
    people: [],
    loans: []
  })
  const router = useRouter()
  
  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  React.useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults({ transactions: [], people: [], loans: [] })
        return
      }
      setLoading(true)
      try {
        const data = await globalSearch(debouncedQuery)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }
    performSearch()
  }, [debouncedQuery])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors w-full max-w-[200px] border border-input"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 ml-auto">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-xl">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input 
              placeholder="Search transactions, people, loans..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground border-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {loading && <div className="p-4 text-sm text-center">Searching...</div>}
            {!loading && debouncedQuery && results.transactions.length === 0 && results.people.length === 0 && results.loans.length === 0 && (
              <div className="p-4 text-sm text-center">No results found.</div>
            )}
            
            {results.transactions.length > 0 && (
              <div className="mb-4">
                <h4 className="px-2 py-1 text-xs font-medium text-muted-foreground">Transactions</h4>
                {results.transactions.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => runCommand(() => router.push(`/transactions`))}
                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{t.description}</span>
                      <span className="text-xs text-muted-foreground">₹{t.amount} • {t.category?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {results.people.length > 0 && (
              <div className="mb-4">
                <h4 className="px-2 py-1 text-xs font-medium text-muted-foreground">People</h4>
                {results.people.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => runCommand(() => router.push(`/people/${p.id}`))}
                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {results.loans.length > 0 && (
              <div className="mb-4">
                <h4 className="px-2 py-1 text-xs font-medium text-muted-foreground">Loans</h4>
                {results.loans.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => runCommand(() => router.push('/loans'))}
                    className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>{l.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mb-4 border-t pt-2">
              <h4 className="px-2 py-1 text-xs font-medium text-muted-foreground">Pages</h4>
              <div onClick={() => runCommand(() => router.push('/'))} className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </div>
              <div onClick={() => runCommand(() => router.push('/reports'))} className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                <Calculator className="mr-2 h-4 w-4" />
                <span>Reports</span>
              </div>
              <div onClick={() => runCommand(() => router.push('/settings'))} className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
