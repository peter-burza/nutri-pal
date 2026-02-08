"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { logout } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, User, History } from "lucide-react"

export default function Navbar() {
  const { user } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Nutri-Pal
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/history"
              className="text-slate-600 hover:text-indigo-600 px-2 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <History className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">History</span>
            </Link>
            <Link
              href="/settings"
              className="text-slate-600 hover:text-indigo-600 px-2 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <User className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Goals</span>
            </Link>

            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="h-8 w-8 rounded-full border border-slate-200"
              />
            )}

            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-500 px-2 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
