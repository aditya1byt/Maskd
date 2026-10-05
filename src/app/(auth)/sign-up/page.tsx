"use client";
import { useForm } from "react-hook-form"
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from 'axios';
import { toast } from "sonner";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Check, X } from "lucide-react";
import Logo from "@/components/Logo";

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [debouncedUsername] = useDebounceValue(username, 300);
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage('')
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(
            axiosError.response?.data.message ?? "error checking username"
          )
        }
        finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [debouncedUsername])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setisSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast.success("success")
      router.replace(`/verify/${username}`)
      setisSubmitting(false)
    } catch (error) {
      console.error('error in signup')
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast.error(errorMessage);
      setisSubmitting(false);
    }
  }

  const isUsernameAvailable = usernameMessage.toLowerCase().includes('unique') ||
    usernameMessage.toLowerCase().includes('available');

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
          Create your inbox
        </h1>
        <p className="body-secondary text-sm mb-8">
          Get a link. Share it. Hear what people really think.
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-warm-text-secondary uppercase tracking-widest">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <input
                        placeholder="Pick a username"
                        className="w-full px-4 py-2.5 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setUsername(e.target.value)
                        }}
                      />
                      {/* Username status indicator */}
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-warm-text-secondary/40" />
                      )}
                    </div>
                  </FormControl>
                  {usernameMessage && !isCheckingUsername && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${isUsernameAvailable ? 'text-green-600' : 'text-red-500'
                      }`}>
                      {isUsernameAvailable ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-warm-text-secondary uppercase tracking-widest">
                    Email
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
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </Form>

        {/* Footer link */}
        <p className="text-sm text-warm-text-secondary mt-8 text-center">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-terracotta hover:text-terracotta-hover transition-subtle font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage