# Maskd. 🎭

> **Say the things you wouldn't say to their face.**  
> A modern, editorial, anonymous Q&A platform built with Next.js 16, React 19, and AI moderation.

---

## Overview

**Maskd** is a privacy-first anonymous messaging and Q&A platform (inspired by NGL and Sarahah) designed with a warm, literary editorial aesthetic. Users create a personal inbox link (`/u/[username]`), share it anywhere, and receive honest, unfiltered questions and feedback from friends, followers, and colleagues.

Every message sent through Maskd is inspected by an integrated **AI Moderation Layer** before reaching an inbox, preventing harassment, toxicity, and severe content while preserving authentic expression.

---

## ✨ Features

- 🎭 **Anonymous Inboxes**: Claim your unique handle (`/u/yourname`) and start receiving questions in seconds.
- 🛡️ **AI Content Moderation**: Real-time evaluation via OpenAI's `omni-moderation-latest` API. Blocks abusive or harmful messages at the gateway with instant feedback.
- 💡 **AI Icebreaker Suggestions**: Senders can tap for AI-generated open-ended questions powered by `gpt-4o-mini` to kickstart engaging conversations.
- 📬 **Interactive Dashboard**:
  - Live toggle to pause or resume incoming messages at any time.
  - Fast copy-to-clipboard for your public link.
  - Reply directly to received messages and react with emojis.
  - Quick-search to jump directly to any user's public profile.
- ⏱️ **Sent Messages Tracker**: Senders logged into an account can track outbound messages, replies, and reactions (with privacy-guaranteed recipient anonymity and a 30-day history window).
- 🔐 **Robust Authentication**: Email + Username login with NextAuth.js and 6-digit OTP verification sent via Resend and React Email.
- 🎨 **Editorial "Warm Paper" Aesthetic**: Crafted using Newsreader serif headings, DM Sans body typography, warm paper tones (`#FAF8F5`), and terracotta accents (`#C2552A`).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), `@tailwindcss/postcss` |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/), Radix UI primitives, Lucide Icons |
| **Database** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (JWT strategy) |
| **Email Service** | [Resend](https://resend.com/) & [React Email](https://react.email/) |
| **AI & Moderation** | [OpenAI API](https://openai.com/) & [Vercel AI SDK](https://sdk.vercel.ai/) |
| **Validation** | [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local MongoDB instance
- [Resend](https://resend.com/) account for transactional OTP emails
- [OpenAI](https://platform.openai.com/) API key for AI suggestions and moderation

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aditya1byt/Maskd.git
   cd Maskd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/maskd
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000
   RESEND_API_KEY=re_your_resend_api_key
   OPENAI_API_KEY=sk-your_openai_api_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── emails/                  # React Email templates (Verification OTP)
├── public/                  # Static assets and icons
├── src/
│   ├── app/
│   │   ├── (app)/           # Main app shell (landing page & dashboard)
│   │   ├── (auth)/          # Authentication (sign-in, sign-up, verify)
│   │   ├── api/             # Next.js App Router API route handlers
│   │   └── u/[username]/    # Public profile page for sending messages
│   ├── components/          # Reusable UI & shadcn components
│   │   ├── ui/              # Radix UI primitives (Button, Card, Dialog, etc.)
│   │   ├── Logo.tsx         # Brand logo emblem & typography
│   │   ├── Navbar.tsx       # Main navigation header
│   │   ├── MessageCard.tsx  # Received message card with reactions & replies
│   │   └── SentMessageCard.tsx # Outbound sent message card
│   ├── context/             # AuthProvider & global context
│   ├── helpers/             # Verification email dispatch helper
│   ├── lib/                 # Database connection, moderation, rate limiting
│   ├── model/               # Mongoose schemas (User & Message subdocument)
│   ├── schemas/             # Zod validation schemas
│   └── types/               # TypeScript definitions & API response models
└── .env.example             # Example environment variables template
```

---

## 🔒 Security & Privacy

- **Sender Anonymity**: Messages sent anonymously never disclose the sender's identity to the recipient.
- **AI Moderation**: Content is analyzed by OpenAI's moderation model before being persisted to the database. Blocked messages return immediate guidance.
- **Rate Limiting**: Public endpoints enforce in-memory IP rate limiting to prevent spam and flood attacks.
- **Data Protection**: Passwords are cryptographically hashed using `bcryptjs` with 10 salt rounds. Soft deletes ensure recipients can safely remove items without corrupting audit records.

---

## 🤝 Contributing

Contributions, ideas, and feature requests are welcome! Feel free to check the [issues page](https://github.com/aditya1byt/Maskd/issues).

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
