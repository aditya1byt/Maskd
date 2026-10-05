"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import Logo from './Logo'

const Navbar = () => {
  const { data: session } = useSession()
  const user: User = session?.user as User

  return (
    <nav className="border-b border-warm-border bg-warm-bg">
      <div className="w-full px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
        {/* Logo — top-left, prominent & eye-catching */}
        <Logo size="md" />

        {/* Auth actions — right side */}
        {session ? (
          <div className="flex items-center gap-5">
            <span className="text-sm text-warm-text-secondary hidden sm:inline">
              {user?.username || user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm font-medium px-3 py-1.5 border border-warm-border rounded-md text-warm-text-secondary hover:text-terracotta hover:border-terracotta/40 transition-subtle"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="text-sm font-medium text-terracotta hover:text-terracotta-hover transition-subtle"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar