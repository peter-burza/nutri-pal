"use client"

import { useState } from "react"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import { setUserGoals, getUserGoals } from "@/lib/firebase/firestore"

export default function LoginPage() {
  const [error, setError] = useState("")
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle()

      // Check if user has goals, if not, set defaults
      const goals = await getUserGoals(user.uid)
      if (!goals) {
        await setUserGoals(user.uid, {
          kcal: 2000,
          proteins: 150,
          carbohydrates: 200,
          fats: 65
        })
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">Nutri-Pal</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-500">Simple nutrition tracking for everyone.</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 font-medium">
              {error}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
