'use client'

import { useState } from 'react'
import { Check, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { useAuth } from '@/hooks/useAuth'

export function MembershipJoin() {
  const { user, refreshUser } = useAuth()

  return (
    <>
      <section id="membership" className="scroll-mt-16 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 text-center">
            <SectionHeading
              className="items-center"
              eyebrow="Membership"
              title="Become a member"
              description="One membership for the full year. All fees go straight back into events."
            />
          </div>

          <div className="mx-auto mt-12 max-w-xl rounded-3xl border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0_var(--foreground)] md:p-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-extrabold">Skyline SSA Membership</h3>
              <p className="text-muted-foreground">
                Get access to member-only events, peer mentorship, partner discounts, and voting rights.
              </p>
              <p className="font-display text-5xl font-extrabold">$25 <span className="text-lg text-muted-foreground">/ year</span></p>
              <ul className="flex flex-col gap-3">
                {['Member-only events & hackathons', 'Peer mentorship', 'Partner discounts', 'Voting rights'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <JoinSection
        user={user}
        refreshUser={refreshUser}
      />
    </>
  )
}

function JoinSection({
  user,
  refreshUser,
}: {
  user: {
    name: string
    email: string
    studentId: string
    major?: string
    graduationYear?: number
    phone?: string
  } | null
  refreshUser: () => Promise<unknown>
}) {
  const [submittedName, setSubmittedName] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const price = 25

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('Please log in before joining the membership.')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/members/pay-dues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to activate membership.')
      }

      await refreshUser()
      setSubmittedName(result.data.user.name)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to activate membership.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="join" className="scroll-mt-16 pb-20 md:pb-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid overflow-hidden rounded-[2rem] border-2 border-foreground lg:grid-cols-5">
          <div className="flex flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:p-10 lg:col-span-2">
            <div className="flex flex-col gap-4">
              <span className="w-fit rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                New member application
              </span>
              <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">{"Let's get you in."}</h2>
              <p className="text-primary-foreground/85">
                Takes about two minutes. Our membership team reviews applications within 48 hours and
                sends your welcome kit by email.
              </p>
            </div>
            <ol className="flex flex-col gap-4">
              {['Fill out the form', 'Pay your membership dues', 'Get your digital member card'].map(
                (step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground font-display font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-medium">{step}</span>
                  </li>
                ),
              )}
            </ol>
          </div>

          <div className="bg-card p-6 md:p-10 lg:col-span-3">
            {!user && (
              <div className="mb-6 rounded-xl bg-accent/30 p-4 text-sm font-medium">
                Log in to use the details from your account and activate membership.
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            {submittedName ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center" role="status">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent">
                  <PartyPopper className="size-8" aria-hidden="true" />
                </span>
                <h3 className="text-3xl font-extrabold">Welcome aboard, {submittedName}!</h3>
                <p className="max-w-sm text-muted-foreground">
                  Your membership is active for one year.
                </p>
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-5"
                  onClick={() => setSubmittedName(null)}
                >
                  Return to membership
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Name" value={user?.name} />
                  <ReadOnlyField label="University email" value={user?.email} />
                  <ReadOnlyField label="Student ID" value={user?.studentId} />
                  <ReadOnlyField label="Phone" value={user?.phone} />
                  <ReadOnlyField label="Major" value={user?.major} />
                  <ReadOnlyField label="Graduation year" value={user?.graduationYear?.toString()} />
                </div>

                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" required className="mt-1 size-4 accent-[var(--primary)]" />
                  I agree to the club code of conduct and to receive event updates by email.
                </label>

                <Button type="submit" disabled={submitting || !user} className="h-12 rounded-full text-base font-semibold">
                  {submitting ? 'Activating membership...' : `Activate membership · $${price}`}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">
        {label}
      </span>
      <div className="flex min-h-11 items-center rounded-xl border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {value || 'Not provided'}
      </div>
    </div>
  )
}
