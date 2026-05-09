import { useContext } from 'react'
import { DateContext } from './context'

export function useDateContext() {
  const ctx = useContext(DateContext)
  if (!ctx) throw new Error('useDateContext must be used within DateProvider')
  return ctx
}
