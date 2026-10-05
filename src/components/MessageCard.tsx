"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { X, MessageSquareReply, SmilePlus } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Message } from '@/model/User';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/ApiResponse';
import type { EmojiClickData } from 'emoji-picker-react';

// Lazy-load the heavy emoji picker — only fetched when user first clicks "React"
const EmojiPicker = lazy(() => import('emoji-picker-react'));

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasOpenedPicker, setHasOpenedPicker] = useState(false); // track if picker was ever opened
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(message.reaction || null);
  const [currentReply, setCurrentReply] = useState<string | null>(message.reply || null);
  const [currentRepliedAt, setCurrentRepliedAt] = useState<Date | null>(message.repliedAt || null);

  // Emoji picker positioning
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate picker position anchored to the button
  const openEmojiPicker = useCallback(() => {
    if (!emojiButtonRef.current) return;

    const rect = emojiButtonRef.current.getBoundingClientRect();
    const pickerWidth = 350;
    const pickerHeight = 400;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;

    // Default: below the button, aligned left
    let top = rect.bottom + margin;
    let left = rect.left;

    // Flip upward if not enough space below
    if (top + pickerHeight > viewportHeight - margin) {
      top = rect.top - pickerHeight - margin;
    }

    // Clamp top to stay within viewport
    if (top < margin) {
      top = margin;
    }

    // Clamp left to stay within viewport
    if (left + pickerWidth > viewportWidth - margin) {
      left = viewportWidth - pickerWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    setPickerPosition({ top, left });
    setHasOpenedPicker(true);
    setShowEmojiPicker(true);
  }, []);

  // Close picker when pressing Escape
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmojiPicker(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmojiPicker]);

  const handleDeleteConfirm = async () => {
    const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
    toast.success(response.data.message)
    onMessageDelete(message._id.toString())
  }

  const handleEmojiClick = async (emojiData: EmojiClickData) => {
    try {
      await axios.post(`/api/reply-message/${message._id}`, {
        reaction: emojiData.emoji
      });
      setCurrentReaction(emojiData.emoji);
      setShowEmojiPicker(false);
      toast.success("Reaction sent!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to send reaction");
    }
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    setIsReplying(true);
    try {
      await axios.post(`/api/reply-message/${message._id}`, {
        reply: replyText.trim()
      });
      setCurrentReply(replyText.trim());
      setCurrentRepliedAt(new Date());
      setShowReplyInput(false);
      setReplyText('');
      toast.success("Reply sent!");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <article className="border-b border-warm-border pb-5 mb-1 last:border-b-0">
      {/* Message content + delete */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="text-base text-warm-text leading-relaxed flex-1">
          {message.content}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="shrink-0 p-1 text-warm-text-secondary/40 hover:text-red-500 transition-subtle rounded">
              <X className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border-warm-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="heading-section font-medium" style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}>
                Delete this message?
              </AlertDialogTitle>
              <AlertDialogDescription className="body-secondary text-sm">
                This can&rsquo;t be undone. The message will be gone for good.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm text-warm-text-secondary hover:text-warm-text border-warm-border">
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="text-sm bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-warm-text-secondary/60 mb-3">
        {dayjs(message.createdAt).format('MMM D, YYYY · h:mm A')}
      </p>

      {/* Actions row */}
      <div className="flex items-center gap-3 mb-3">
        <button
          ref={emojiButtonRef}
          onClick={() => showEmojiPicker ? setShowEmojiPicker(false) : openEmojiPicker()}
          className="inline-flex items-center gap-1.5 text-xs text-warm-text-secondary hover:text-terracotta transition-subtle"
        >
          {currentReaction ? (
            <span className="text-base">{currentReaction}</span>
          ) : (
            <SmilePlus className="h-3.5 w-3.5" />
          )}
          {currentReaction ? 'Change' : 'React'}
        </button>

        {!currentReply && (
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="inline-flex items-center gap-1.5 text-xs text-warm-text-secondary hover:text-terracotta transition-subtle"
          >
            <MessageSquareReply className="h-3.5 w-3.5" />
            Reply
          </button>
        )}
      </div>

      {/* Emoji picker — rendered as a fixed overlay to avoid overflow/clutter */}
      {/* Once opened, stays mounted (hidden) so re-opens are instant */}
      {hasOpenedPicker && pickerPosition && (
        <>
          {/* Backdrop — click to close */}
          {showEmojiPicker && (
            <div
              className="fixed inset-0 z-[99]"
              onClick={() => setShowEmojiPicker(false)}
            />
          )}
          {/* Picker — fixed position, anchored to button */}
          <div
            ref={emojiPickerRef}
            className="fixed z-[100] shadow-lg rounded-xl"
            style={{
              top: pickerPosition.top,
              left: pickerPosition.left,
              visibility: showEmojiPicker ? 'visible' : 'hidden',
              pointerEvents: showEmojiPicker ? 'auto' : 'none',
            }}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center bg-white border border-warm-border rounded-xl" style={{ width: Math.min(350, typeof window !== 'undefined' ? window.innerWidth - 16 : 350), height: 380 }}>
                  <span className="text-sm text-warm-text-secondary">Loading…</span>
                </div>
              }
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={Math.min(350, typeof window !== 'undefined' ? window.innerWidth - 16 : 350)}
                height={380}
                lazyLoadEmojis
              />
            </Suspense>
          </div>
        </>
      )}

      {/* Inline reply input */}
      {showReplyInput && !currentReply && (
        <div className="flex items-center gap-2 mb-3 animate-slide-up">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 px-3 py-2 text-sm bg-transparent border border-warm-border rounded-md placeholder:text-warm-text-secondary/40 focus:outline-none focus:border-terracotta transition-subtle"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleReplySubmit();
              }
            }}
          />
          <button
            onClick={handleReplySubmit}
            disabled={isReplying || !replyText.trim()}
            className="text-xs font-medium px-3 py-2 bg-terracotta text-terracotta-foreground rounded-md hover:bg-terracotta-hover transition-subtle disabled:opacity-40"
          >
            {isReplying ? "Sending…" : "Send"}
          </button>
        </div>
      )}

      {/* Existing reply */}
      {currentReply && (
        <div className="pl-4 border-l-2 border-terracotta/20 mt-2 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-terracotta font-medium">
              You replied
            </span>
            {currentRepliedAt && (
              <span className="text-xs text-warm-text-secondary/50">
                · {dayjs(currentRepliedAt).format('MMM D, h:mm A')}
              </span>
            )}
          </div>
          <p className="text-sm text-warm-text-secondary">{currentReply}</p>
        </div>
      )}
    </article>
  )
}

export default MessageCard