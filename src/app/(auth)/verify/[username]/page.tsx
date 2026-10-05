'use client'
import { FormField, FormItem, FormLabel, Form, FormMessage } from '@/components/ui/form';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import * as z from 'zod';
import Link from 'next/link';
import Logo from '@/components/Logo';

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>()

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-code`, {
        username: params.username,
        code: data.code
      })
      toast.success(response.data.message)
      router.replace('/sign-in');
    }
    catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message);
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
          Check your email
        </h1>
        <p className="body-secondary text-sm mb-8">
          We sent a verification code to your inbox. Enter it below to finish setting up.
        </p>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-warm-text-secondary uppercase tracking-widest">
                    Verification code
                  </FormLabel>
                  <input
                    placeholder="Enter your code"
                    className="w-full px-4 py-2.5 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle tracking-widest text-center text-lg"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-terracotta-foreground font-medium text-sm px-6 py-3 rounded-md hover:bg-terracotta-hover transition-subtle"
            >
              Verify
            </button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default VerifyAccount