"use client"

import { useEffect } from "react"
import { subscribeToAuthChanges } from "@/lib/firebase/auth"
import { useAuthStore } from "@/stores/useAuthStore"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}
