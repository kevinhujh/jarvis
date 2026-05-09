import { useContext } from 'react'
import { TimetableContext } from './context'

export function useTimetableContext() {
  const ctx = useContext(TimetableContext)
  if (!ctx) throw new Error('useTimetableContext must be used within TimetableProvider')
  return ctx
}
