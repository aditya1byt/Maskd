"use client"
import { Message } from "@/model/User"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useState, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCcw, Send, Copy, ArrowRight, Clock } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import SentMessageCard, { SentMessage } from "@/components/SentMessageCard";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [isSentLoading, setIsSentLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleSendToUser = () => {
    if (!targetUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    router.push(`/u/${targetUsername.trim()}`);
  }

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id.toString() !== messageId))
  }

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })
  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  //whether the user is accepting messages
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages')
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false)
    }
    catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "something went wrong");
    }
    finally {
      setIsSwitchLoading(false);
    }
  }, [setValue])

  //fetching anonymous messages
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || []);
      if (refresh) {
        toast.success("refreshed messages");
      }
    }
    catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "something went wrong");
    }
    finally {
      setIsSwitchLoading(false);
      setIsLoading(false);
    }
  }, [setIsLoading, setMessages])

  //fetching sent messages
  const fetchSentMessages = useCallback(async (refresh: boolean = false) => {
    setIsSentLoading(true);
    try {
      const response = await axios.get('/api/get-sent-messages');
      const rawSentMessages: SentMessage[] = response.data.sentMessages || [];
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      setSentMessages(
        rawSentMessages.filter(
          (msg) => new Date(msg.createdAt).getTime() >= thirtyDaysAgo
        )
      );
      if (refresh) {
        toast.success("Refreshed sent messages");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to fetch sent messages");
    } finally {
      setIsSentLoading(false);
    }
  }, [])

  useEffect(() => {
    if (!session || !session.user) {
      return;
    }
    fetchAcceptMessage();
    fetchMessages();
    fetchSentMessages();
  }, [session, fetchAcceptMessage, fetchMessages, fetchSentMessages, setValue])

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post('/api/accept-messages',
        { acceptingMessages: !acceptMessages })
      setValue('acceptMessages', !acceptMessages);
      toast.success(response.data.message)
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "something went wrong");
    }
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg px-5">
        <div className="text-center animate-fade-in">
          <p className="body-secondary text-sm mb-4">You need to be signed in.</p>
          <a
            href="/sign-in"
            className="text-sm font-medium text-terracotta hover:text-terracotta-hover transition-subtle"
          >
            Sign in →
          </a>
        </div>
      </div>
    )
  }

  const { username } = session.user;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    toast.success("Link copied")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-14">
      {/* Header area */}
      <div className="mb-10 animate-fade-in">
        <p className="body-secondary text-xs uppercase tracking-widest mb-2">
          Your inbox
        </p>
        <h1
          className="heading-display text-3xl sm:text-4xl font-semibold"
          style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
        >
          Welcome back, {username}
        </h1>
      </div>

      {/* Share link */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <label className="text-xs text-warm-text-secondary uppercase tracking-widest block mb-2">
          Your link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-2.5 text-sm bg-warm-bg-subtle border border-warm-border rounded-md text-warm-text-secondary overflow-x-auto whitespace-nowrap">
            {profileUrl}
          </div>
          <button
            onClick={copyToClipboard}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 bg-terracotta text-terracotta-foreground rounded-md hover:bg-terracotta-hover transition-subtle"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Send to someone */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '120ms' }}>
        <label className="text-xs text-warm-text-secondary uppercase tracking-widest block mb-2">
          Send a message to someone
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            placeholder="Enter their username"
            className="flex-1 px-4 py-2.5 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 transition-subtle"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendToUser();
              }
            }}
          />
          <button
            onClick={handleSendToUser}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 border border-warm-border rounded-md text-warm-text hover:border-terracotta/40 hover:text-terracotta transition-subtle"
          >
            <Send className="w-3.5 h-3.5" />
            Go
          </button>
        </div>
      </div>

      {/* Accept messages toggle */}
      <div
        className="flex items-center gap-3 mb-10 pb-10 border-b border-warm-border animate-fade-in"
        style={{ animationDelay: '160ms' }}
      >
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="text-sm text-warm-text">
          Accepting messages
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${acceptMessages
          ? 'bg-terracotta-light text-terracotta'
          : 'bg-warm-bg-subtle text-warm-text-secondary'
          }`}>
          {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      {/* ── Received Messages ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="heading-section text-xl font-medium"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Messages received
          </h2>
          <button
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
            className="text-xs text-warm-text-secondary hover:text-terracotta transition-subtle inline-flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Refresh
          </button>
        </div>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id.toString()} className="animate-slide-up">
                <MessageCard
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-16 text-center border border-dashed border-warm-border rounded-md">
            <p
              className="heading-section text-lg font-medium mb-2"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              Nothing here yet
            </p>
            <p className="body-secondary text-sm mb-4">
              Share your link and wait for the honesty to roll in.
            </p>
            <button
              onClick={copyToClipboard}
              className="text-sm font-medium text-terracotta hover:text-terracotta-hover transition-subtle inline-flex items-center gap-1"
            >
              Copy your link
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* ── Sent Messages ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="heading-section text-xl font-medium"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              Messages sent
            </h2>
            <p className="body-secondary text-xs mt-1">
              Anonymous messages you&rsquo;ve sent to others
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              fetchSentMessages(true);
            }}
            className="text-xs text-warm-text-secondary hover:text-terracotta transition-subtle inline-flex items-center gap-1"
          >
            {isSentLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Refresh
          </button>
        </div>

        {/* 30-day retention warning banner */}
        <div className="flex items-start sm:items-center gap-2.5 px-3.5 py-2.5 mb-6 rounded-md bg-warm-bg-subtle border border-warm-border text-xs text-warm-text-secondary animate-fade-in">
          <Clock className="w-4 h-4 text-terracotta shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-medium text-warm-text">Notice:</strong> All messages displayed under this section are automatically deleted after 30 days.
          </span>
        </div>

        {sentMessages.length > 0 ? (
          <div className="space-y-4">
            {sentMessages.map((sentMessage) => (
              <div key={sentMessage.messageId} className="animate-slide-up">
                <SentMessageCard sentMessage={sentMessage} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-warm-border rounded-md">
            <p className="body-secondary text-sm">
              You haven&rsquo;t sent any anonymous messages yet.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage