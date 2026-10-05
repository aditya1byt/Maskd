'use client'
import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { messageSchema } from '@/schemas/messageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Loader2, ArrowRight, Check, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

const MAX_CHARS = 300

const specialChar = '||'

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar).map((msg) => msg.trim()).filter(Boolean)
}

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?"

export default function SendMessage() {
  const params = useParams<{ username: string }>()
  const username = params.username
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(parseStringMessages(initialMessageString))
  const [moderationError, setModerationError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  })

  const messageContent = form.watch('content')
  const charCount = messageContent?.length || 0

  const handleMessageClick = (message: string) => {
    form.setValue('content', message)
  }

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true)
    setModerationError(null)
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: data.content,
      })
      toast.success(response.data.message)
      form.reset({ content: '' })
      setIsSent(true)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      if (axiosError.response?.data?.code === 'MODERATION_BLOCKED') {
        setModerationError(axiosError.response.data.message || "Your message couldn't be sent because it may violate our community guidelines.")
      } else {
        toast.error(axiosError.response?.data.message ?? 'Failed to send message')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true)
    try {
      const response = await axios.post('/api/suggest-messages')
      setSuggestedMessages(parseStringMessages(response.data.text))
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      toast.error('Failed to fetch suggestions')
    } finally {
      setIsSuggestLoading(false)
    }
  }

  // ── Confirmation screen ──
  if (isSent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-5 py-20 bg-warm-bg">
        <div className="max-w-md mx-auto w-full text-center animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-terracotta-light flex items-center justify-center mx-auto mb-6">
            <Check className="w-5 h-5 text-terracotta" />
          </div>
          <h1
            className="heading-display text-2xl sm:text-3xl font-semibold mb-3"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Sent, quietly.
          </h1>
          <p className="body-secondary text-sm mb-8">
            They&rsquo;ll see it soon — they just won&rsquo;t know it was you.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSent(false)
                form.reset({ content: '' })
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-terracotta-foreground font-medium text-sm px-6 py-3 rounded-md hover:bg-terracotta-hover transition-subtle"
            >
              Send another
            </button>
            <Link
              href="/sign-up"
              className="block text-sm text-warm-text-secondary hover:text-warm-text transition-subtle py-2"
            >
              Get your own inbox →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Compose screen ──
  return (
    <div className="min-h-screen flex flex-col bg-warm-bg">
      {/* Minimal header */}
      <header className="border-b border-warm-border px-5 py-3.5 flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href="/sign-up"
          className="text-xs font-medium text-terracotta hover:text-terracotta-hover transition-subtle"
        >
          Get your inbox →
        </Link>
      </header>

      <main className="flex-grow flex flex-col justify-center px-5 py-12 md:py-20">
        <div className="max-w-lg mx-auto w-full">
          {/* Prompt — the hero of this screen */}
          <p className="body-secondary text-xs uppercase tracking-widest mb-3">
            To @{username}
          </p>
          <h1
            className="heading-display text-2xl sm:text-3xl font-semibold mb-8"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Say something you wouldn&rsquo;t
            <br />
            say to their face.
          </h1>

          {/* Compose form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <textarea
                          placeholder="Type your anonymous message..."
                          maxLength={MAX_CHARS}
                          rows={5}
                          className="w-full px-4 py-3 text-base bg-transparent border border-warm-border rounded-md resize-none placeholder:text-warm-text-secondary/50 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle font-sans"
                          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                          {...field}
                        />
                        {/* Char counter */}
                        <span
                          className={`absolute bottom-3 right-3 text-xs transition-subtle ${
                            charCount > MAX_CHARS * 0.9
                              ? 'text-terracotta'
                              : 'text-warm-text-secondary/40'
                          }`}
                        >
                          {charCount}/{MAX_CHARS}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {moderationError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 text-sm border border-warm-border-subtle rounded-md px-4 py-3 bg-warm-bg-subtle animate-fade-in"
                >
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-terracotta" />
                  <p className="text-warm-text-secondary">{moderationError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !messageContent?.trim()}
                className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-terracotta-foreground font-medium text-sm px-6 py-3 rounded-md hover:bg-terracotta-hover transition-subtle disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send anonymously
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </Form>

          {/* Suggestions — understated */}
          <div className="mt-12 pt-8 border-t border-warm-border">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-warm-text-secondary uppercase tracking-widest">
                Not sure what to say?
              </p>
              <button
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                className="text-xs text-terracotta hover:text-terracotta-hover transition-subtle disabled:opacity-40"
              >
                {isSuggestLoading ? 'Loading…' : 'Refresh ideas'}
              </button>
            </div>
            <div className="space-y-2">
              {suggestedMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleMessageClick(message)}
                  className="w-full text-left text-sm px-4 py-3 border border-warm-border rounded-md text-warm-text hover:border-terracotta/40 hover:bg-terracotta-light/30 transition-subtle"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Quiet footer */}
      <footer className="border-t border-warm-border px-5 py-4">
        <div className="max-w-lg mx-auto w-full flex items-center justify-between text-xs text-warm-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="text-warm-text-secondary/70">Powered by</span>
            <Logo size="sm" className="scale-90 origin-left" />
          </div>
          <Link
            href="/sign-up"
            className="text-terracotta hover:text-terracotta-hover font-medium transition-subtle"
          >
            Get your own inbox →
          </Link>
        </div>
      </footer>
    </div>
  )
}
