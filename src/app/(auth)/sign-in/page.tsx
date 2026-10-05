"use client";
import { useForm } from "react-hook-form"
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import Logo from "@/components/Logo";

function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password
    })
    setIsSubmitting(false);
    if (result?.error) {
      toast.error('Login failed')
    }
    if (result?.url) {
      router.replace('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-warm-bg px-5 py-16">
      <div className="max-w-sm mx-auto w-full animate-fade-in">
        {/* Logo */}
        <div className="mb-10">
          <Logo size="lg" showTagline tagline="Anonymous Q&A" />
        </div>

        {/* Heading */}
        <h1
          className="heading-display text-2xl sm:text-3xl font-semibold mb-2"
          style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
        >
          Welcome back
        </h1>
        <p className="body-secondary text-sm mb-8">
          Sign in to check your anonymous messages.
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-warm-text-secondary uppercase tracking-widest">
                    Email or username
                  </FormLabel>
                  <FormControl>
                    <input
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-warm-text-secondary uppercase tracking-widest">
                    Password
                  </FormLabel>
                  <FormControl>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-terracotta-foreground font-medium text-sm px-6 py-3 rounded-md hover:bg-terracotta-hover transition-subtle disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </Form>

        {/* Footer link */}
        <p className="text-sm text-warm-text-secondary mt-8 text-center">
          Don&rsquo;t have an account?{' '}
          <Link href="/sign-up" className="text-terracotta hover:text-terracotta-hover transition-subtle font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignInPage