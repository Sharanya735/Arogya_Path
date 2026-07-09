"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    // Fallback safety timeout to guarantee loading screen disappears
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 2500)

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user ?? null
        setUser(user)

        if (user) {
          const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()
          setProfile(profile || { id: user.id, email: user.email, role: "receptionist" })
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Auth init error:", error)
      } finally {
        if (mounted) {
          setLoading(false)
          clearTimeout(safetyTimeout)
        }
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const user = session?.user ?? null
      setUser(user)

      if (user) {
        try {
          const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()
          setProfile(profile || { id: user.id, email: user.email, role: "receptionist" })
        } catch (err) {
          setProfile({ id: user.id, email: user.email, role: "receptionist" })
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
      clearTimeout(safetyTimeout)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
