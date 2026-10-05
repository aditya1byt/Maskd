"use client"
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import dayjs from 'dayjs';

export type SentMessage = {
  recipientUsername: string;
  messageId: string;
  content: string;
  createdAt: string;
  reply: string | null;
  repliedAt: string | null;
  reaction: string | null;
}

type SentMessageCardProps = {
  sentMessage: SentMessage;
}

const SentMessageCard = ({ sentMessage }: SentMessageCardProps) => {
  const [showReply, setShowReply] = useState(false);

  const hasReply = !!sentMessage.reply;
  const hasReaction = !!sentMessage.reaction;
  const hasResponse = hasReply || hasReaction;

  const daysOld = dayjs().diff(dayjs(sentMessage.createdAt), 'day');
  const daysRemaining = Math.max(0, 30 - daysOld);

  return (
    <article className="border-b border-warm-border pb-5 mb-1 last:border-b-0">
      {/* Recipient + reaction */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <p className="text-xs text-warm-text-secondary">
          To <span className="font-medium text-warm-text">@{sentMessage.recipientUsername}</span>
        </p>
        {hasReaction && (
          <span className="text-lg" title="Their reaction">
            {sentMessage.reaction}
          </span>
        )}
      </div>

      {/* Message content */}
      <p className="text-base text-warm-text leading-relaxed mb-2">
        {sentMessage.content}
      </p>

      {/* Timestamp and auto-deletion countdown */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-warm-text-secondary/60">
        <span>{dayjs(sentMessage.createdAt).format('MMM D, YYYY · h:mm A')}</span>
        <span>·</span>
        <span className={daysRemaining <= 3 ? "text-terracotta font-medium" : ""}>
          {daysRemaining === 0
            ? "Expires today"
            : daysRemaining === 1
            ? "Deletes tomorrow"
            : `Deletes in ${daysRemaining} days`}
        </span>
      </div>

      {/* Response status */}
      {hasResponse ? (
        <div>
          <div className="flex items-center gap-2">
            {hasReply && (
              <>
                <span className="text-xs text-terracotta font-medium">
                  They replied
                </span>
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-xs text-warm-text-secondary hover:text-terracotta transition-subtle inline-flex items-center gap-0.5"
                >
                  {showReply ? 'Hide' : 'Show'}
                  {showReply ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </>
            )}
            {hasReaction && !hasReply && (
              <span className="text-xs text-warm-text-secondary">
                Reacted with {sentMessage.reaction}
              </span>
            )}
          </div>

          {showReply && sentMessage.reply && (
            <div className="pl-4 border-l-2 border-terracotta/20 mt-3 animate-fade-in">
              <p className="text-sm text-warm-text-secondary">{sentMessage.reply}</p>
              {sentMessage.repliedAt && (
                <p className="text-xs text-warm-text-secondary/50 mt-1">
                  {dayjs(sentMessage.repliedAt).format('MMM D, YYYY · h:mm A')}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-warm-text-secondary/50">
          No response yet
        </p>
      )}
    </article>
  )
}

export default SentMessageCard
