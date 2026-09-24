'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns'

// This would ideally fetch from server actions
// Using mocked data approach for calendar structure, but we can pass real data
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // Mock events for UI illustration
  const getEventsForDate = (date: Date) => {
    const events = []
    // Just pseudo-random events for demonstration based on day of month
    const day = date.getDate()
    if (day === 1 || day === 15) {
      events.push({ id: 1, type: 'income', title: 'Salary Expected', color: 'bg-emerald-500' })
    }
    if (day === 5) {
      events.push({ id: 2, type: 'emi', title: 'Home Loan EMI', color: 'bg-orange-500' })
    }
    if (day === 10 || day === 20) {
      events.push({ id: 3, type: 'bill', title: 'Utility Bill', color: 'bg-blue-500' })
    }
    return events
  }

  const selectedEvents = getEventsForDate(selectedDate)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
        <p className="text-muted-foreground">
          Track upcoming EMIs, bills, and expected income.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const events = getEventsForDate(day)
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      min-h-[80px] p-2 border rounded-md cursor-pointer transition-colors
                      ${!isSameMonth(day, currentDate) ? 'text-muted-foreground bg-muted/20' : 'bg-background'}
                      ${isSameDay(day, selectedDate) ? 'ring-2 ring-primary border-transparent' : 'hover:border-primary/50'}
                      ${isToday(day) ? 'bg-primary/5' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {events.map((e, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full ${e.color}`}
                          title={e.title}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events for this date.</p>
            ) : (
              <div className="space-y-4">
                {selectedEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${event.color}`} />
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
