"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login")
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!user && pathname !== "/login" && pathname !== "/signup") {
    return null
  }

  return <>{children}</>
}
