'use client'

import { useState, type FormEvent } from 'react'
import { Check, Loader2, PartyPopper, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { useAuth } from '@/hooks/useAuth'
import memberService from '@/services/memberService'

type MembershipUser = {
  _id: string
  name: string
  email: string
  studentId: string
  major?: string
  graduationYear?: number
  phone?: string
  membershipStatus?: string
  membershipExpiresAt?: string | null
}

export function MembershipJoin() {
  const { user, syncUser, authLoading } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successName, setSuccessName] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!user) {
      setError('Please log in before activating membership.')
      return
    }
    if (user.membershipStatus === 'active') return
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await memberService.payDues()
      const updatedUser = response.data?.user as MembershipUser | undefined
      if (!updatedUser || updatedUser.membershipStatus !== 'active') {
        throw new Error(response.message || 'The membership API did not confirm an active membership.')
      }

      syncUser(updatedUser)
      setSuccessName(updatedUser.name || user.name)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to activate membership.')
    } finally {
      setSubmitting(false)
    }
  }

  const isActiveMember = user?.membershipStatus === 'active'
  const isRenewal = user?.membershipStatus === 'expired'

  return (
    <>
      <section id="membership" className="scroll-mt-16 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 text-center">
            <SectionHeading
              className="items-center"
              eyebrow={isActiveMember ? 'Membership active' : 'Membership'}
              title={isActiveMember ? 'You’re a member' : 'Become a member'}
              description={isActiveMember
                ? 'Your Skyline SSA membership is active.'
                : 'Activate one year of membership with the existing $25 dues payment.'}
            />
          </div>

          <div className="mx-auto mt-12 max-w-xl rounded-3xl border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0_var(--foreground)] md:p-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-extrabold">Skyline SSA Membership</h3>
              <p className="text-muted-foreground">
                Membership provides access to member-only events, peer mentorship, partner discounts, and voting rights.
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

      <section id="join" className="scroll-mt-16 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid overflow-hidden rounded-[2rem] border-2 border-foreground lg:grid-cols-5">
            <div className="flex flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:p-10 lg:col-span-2">
              <div className="flex flex-col gap-4">
                <span className="w-fit rounded-full bg-primary-foreground px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  {isActiveMember ? 'Membership active' : isRenewal ? 'Membership renewal' : 'Join the club'}
                </span>
                <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
                  {isActiveMember ? 'You’re all set.' : isRenewal ? 'Welcome back.' : 'Let’s get you in.'}
                </h2>
                <p className="text-primary-foreground/85">
                  {isActiveMember
                    ? 'Your account shows an active membership. No dues payment or application is needed right now.'
                    : 'Dues are simulated in this demo. The existing API activates membership immediately; it does not submit an application for later review.'}
                </p>
              </div>
              {!isActiveMember && <ol className="flex flex-col gap-4">
                {['Review your account details', 'Confirm the $25 dues payment', 'Membership activates for one year'].map(
                  (step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground font-display font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium">{step}</span>
                    </li>
                  ),
                )}
              </ol>}
            </div>

            <div className="bg-card p-6 md:p-10 lg:col-span-3">
              {authLoading && (
                <div className="rounded-xl bg-muted p-4 text-sm font-medium" role="status">
                  Checking your sign-in and membership status...
                </div>
              )}

              {!authLoading && !user && (
                <div className="rounded-xl bg-accent/30 p-4 text-sm font-medium">
                  <p>Log in to use your saved account details and activate membership.</p>
                  <Link to="/login" className="mt-2 inline-block font-semibold text-primary underline underline-offset-4">
                    Log in
                  </Link>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive" role="alert">
                  {error}
                </div>
              )}

              {successName ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center" role="status">
                  <span className="flex size-16 items-center justify-center rounded-full bg-accent">
                    <PartyPopper className="size-8" aria-hidden="true" />
                  </span>
                  <h3 className="text-3xl font-extrabold">Welcome aboard, {successName}!</h3>
                  <p className="max-w-sm text-muted-foreground">
                    The API confirmed that your membership is active, and your account state has been updated.
                  </p>
                  <Button type="button" variant="outline" className="h-11 rounded-full px-5" onClick={() => setSuccessName('')}>
                    View membership status
                  </Button>
                </div>
              ) : isActiveMember ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center" role="status">
                  <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="size-8" aria-hidden="true" />
                  </span>
                  <h3 className="text-3xl font-extrabold">Membership active</h3>
                  <p className="text-muted-foreground">You already have an active Skyline SSA membership.</p>
                  {user.membershipExpiresAt && (
                    <p className="text-sm text-muted-foreground">
                      Expires {new Date(user.membershipExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">No additional dues payment is needed right now.</p>
                </div>
              ) : user ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="Name" value={user.name} />
                    <ReadOnlyField label="University email" value={user.email} />
                    <ReadOnlyField label="Student ID" value={user.studentId} />
                    <ReadOnlyField label="Phone" value={user.phone} />
                    <ReadOnlyField label="Major" value={user.major} />
                    <ReadOnlyField label="Graduation year" value={user.graduationYear?.toString()} />
                  </div>

                  <label className="flex items-start gap-3 text-sm text-muted-foreground">
                    <input type="checkbox" required className="mt-1 size-4 accent-primary" />
                    I confirm that I want to activate the one-year membership for $25.
                  </label>

                  <Button type="submit" disabled={submitting || authLoading || isActiveMember} className="h-12 rounded-full text-base font-semibold">
                    {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {submitting ? 'Processing dues...' : `${isRenewal ? 'Renew membership' : 'Activate membership'} · $25`}
                  </Button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex min-h-11 items-center rounded-xl border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
        {value || 'Not provided'}
      </div>
    </div>
  )
}
