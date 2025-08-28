"use client"

import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

interface UserProfile {
  id: string
  email: string
  username: string
  role: "admin" | "tecnico" | "viewer"
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not configured, auth features disabled")
      setLoading(false)
      setSupabaseConfigured(false)
      return
    }

    setSupabaseConfigured(true)

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error("Error signing in:", error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: { message: "Supabase not configured" } }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
      }
      return { error }
    } catch (error) {
      console.error("Error signing out:", error)
      return { error }
    }
  }

  return {
    user,
    profile,
    loading,
    supabaseConfigured,
    signIn,
    signOut,
  }
}
