'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <main className="flex-grow flex flex-col justify-center px-5 py-20 md:py-32">
        <div className="max-w-xl mx-auto w-full">
          {/* Eyebrow / Brand badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-terracotta-light/80 border border-terracotta/25 mb-6 animate-fade-in shadow-xs">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span
              className="text-xs font-bold tracking-wider uppercase text-terracotta"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              Maskd
            </span>
            <span className="text-terracotta/40 text-xs">•</span>
            <span className="text-xs text-warm-text font-medium">
              Anonymous messages, zero pretense
            </span>
          </div>

          {/* Headline — large, serif, confident */}
          <h1
            className="heading-display text-4xl sm:text-5xl md:text-6xl font-semibold mb-6 animate-fade-in"
            style={{ animationDelay: '80ms' }}
          >
            Say the things you
            <br />
            wouldn&rsquo;t say
            <br />
            <span className="italic text-terracotta">to&nbsp;their&nbsp;face.</span>
          </h1>

          {/* Subtext */}
          <p
            className="body-text text-lg md:text-xl text-warm-text-secondary max-w-md mb-10 animate-fade-in"
            style={{ animationDelay: '160ms' }}
          >
            Share your link. Get honest, anonymous messages from people who actually know you.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row gap-3 animate-fade-in"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-terracotta text-terracotta-foreground font-medium text-sm px-6 py-3 rounded-md hover:bg-terracotta-hover transition-subtle"
            >
              Get your inbox
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center text-sm font-medium text-warm-text-secondary hover:text-warm-text px-6 py-3 transition-subtle"
            >
              I already have one
            </Link>
          </div>
        </div>
      </main>

      {/* Quiet social proof / how-it-works */}
      <section className="border-t border-warm-border px-5 py-16 md:py-20">
        <div className="max-w-xl mx-auto w-full">
          <p className="body-secondary text-xs uppercase tracking-widest mb-8">
            How it works
          </p>
          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Create your page',
                description: 'Sign up and get a unique link — takes ten seconds.',
              },
              {
                step: '02',
                title: 'Share it anywhere',
                description: 'Drop it in your bio, your story, a group chat. Wherever.',
              },
              {
                step: '03',
                title: 'Read what people really think',
                description: 'Messages arrive anonymously. React, reply, or share to your story.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flex gap-5 items-start animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-xs font-medium text-warm-text-secondary mt-1 shrink-0 w-6">
                  {item.step}
                </span>
                <div>
                  <h3
                    className="heading-section text-lg font-medium mb-1"
                    style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="body-secondary text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-warm-border px-5 py-6">
        <div className="max-w-xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" asLink={false} />
          <span className="text-xs text-warm-text-secondary">
            &copy; {new Date().getFullYear()} Maskd • Anonymous messages, zero pretense.
          </span>
        </div>
      </footer>
    </>
  );
}