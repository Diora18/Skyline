'use client'

import { useState } from 'react'
import { Check, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

type Billing = 'semester' | 'year'
type PlanId = 'explorer' | 'member' | 'allaccess'

const plans: {
  id: PlanId
  name: string
  tagline: string
  price: Record<Billing, number>
  features: string[]
  highlight?: boolean
}[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'Try us out, no strings attached.',
    price: { semester: 0, year: 0 },
    features: ['Open events & socials', 'Club newsletter', 'Community Discord'],
  },
  {
    id: 'member',
    name: 'Member',
    tagline: 'Everything most students need.',
    price: { semester: 15, year: 25 },
    features: [
      'Everything in Explorer',
      'Members-only events & hackathons',
      'Peer mentor matching',
      'Partner discounts card',
      'Voting rights at elections',
    ],
    highlight: true,
  },
  {
    id: 'allaccess',
    name: 'All-Access',
    tagline: 'For the ones who go all in.',
    price: { semester: 35, year: 60 },
    features: [
      'Everything in Member',
      'Priority on trips & conferences',
      'Official club hoodie',
      'Project funding eligibility',
    ],
  },
]

const interestOptions = ['Tech', 'Design', 'Business', 'Outdoors', 'Arts', 'Volunteering', 'Gaming', 'Music']
const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']

export function MembershipJoin() {
  const [billing, setBilling] = useState<Billing>('semester')
  const [selected, setSelected] = useState<PlanId>('member')

  const choosePlan = (id: PlanId) => {
    setSelected(id)
    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section id="membership" className="scroll-mt-16 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 text-center">
            <SectionHeading
              className="items-center"
              eyebrow="Membership"
              title="Pick your pass"
              description="Student-friendly pricing. Cancel anytime. All fees go straight back into events."
            />
            <div
              role="radiogroup"
              aria-label="Billing period"
              className="inline-flex rounded-full border-2 border-foreground bg-card p-1"
            >
              {(['semester', 'year'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={billing === b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors',
                    billing === b ? 'bg-foreground text-background' : 'text-muted-foreground',
                  )}
                >
                  Per {b}
                  {b === 'year' && (
                    <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                      Save 15%+
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col gap-6 rounded-3xl border-2 p-6 md:p-8',
                  plan.highlight
                    ? 'border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] md:-translate-y-3'
                    : 'border-border bg-card',
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-extrabold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <p className="flex items-baseline gap-1">
                  <span className="font-display text-5xl font-extrabold">
                    {plan.price[billing] === 0 ? 'Free' : `$${plan.price[billing]}`}
                  </span>
                  {plan.price[billing] > 0 && (
                    <span className="text-muted-foreground">/ {billing}</span>
                  )}
                </p>
                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => choosePlan(plan.id)}
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="h-12 rounded-full text-base font-semibold"
                >
                  {plan.price[billing] === 0 ? 'Join for free' : `Get ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinSection
        billing={billing}
        selected={selected}
        onSelect={setSelected}
      />
    </>
  )
}

function JoinSection({
  billing,
  selected,
  onSelect,
}: {
  billing: Billing
  selected: PlanId
  onSelect: (id: PlanId) => void
}) {
  const [interests, setInterests] = useState<string[]>(['Tech'])
  const [submittedName, setSubmittedName] = useState<string | null>(null)

  const plan = plans.find((p) => p.id === selected)!
  const price = plan.price[billing]

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setSubmittedName(String(data.get('firstName') || 'friend'))
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
            {submittedName ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center" role="status">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent">
                  <PartyPopper className="size-8" aria-hidden="true" />
                </span>
                <h3 className="text-3xl font-extrabold">Welcome aboard, {submittedName}!</h3>
                <p className="max-w-sm text-muted-foreground">
                  Your {plan.name} application is in. Check your inbox for next steps
                  {price > 0 ? ' and your payment link.' : '.'}
                </p>
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-5"
                  onClick={() => setSubmittedName(null)}
                >
                  Submit another application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" name="firstName" autoComplete="given-name" />
                  <Field label="Last name" name="lastName" autoComplete="family-name" />
                  <Field label="University email" name="email" type="email" autoComplete="email" placeholder="you@university.edu" />
                  <Field label="Student ID" name="studentId" inputMode="numeric" />
                  <Field label="Major" name="major" placeholder="e.g. Psychology" />
                  <div className="flex flex-col gap-2">
                    <label htmlFor="year" className="text-sm font-semibold">
                      Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      required
                      defaultValue=""
                      className="h-11 rounded-xl border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="" disabled>
                        Select year
                      </option>
                      {years.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-3 text-sm font-semibold">What are you into?</legend>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((i) => {
                      const active = interests.includes(i)
                      return (
                        <button
                          key={i}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleInterest(i)}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                            active
                              ? 'border-foreground bg-accent text-accent-foreground'
                              : 'border-border hover:border-foreground',
                          )}
                        >
                          {i}
                        </button>
                      )
                    })}
                  </div>
                  <input type="hidden" name="interests" value={interests.join(',')} />
                </fieldset>

                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-3 text-sm font-semibold">Membership pass</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {plans.map((p) => (
                      <label
                        key={p.id}
                        className={cn(
                          'flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition-colors',
                          selected === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground',
                        )}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={p.id}
                          checked={selected === p.id}
                          onChange={() => onSelect(p.id)}
                          className="sr-only"
                        />
                        <span className="font-display font-bold">{p.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {p.price[billing] === 0 ? 'Free' : `$${p.price[billing]} / ${billing}`}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" required className="mt-1 size-4 accent-[var(--primary)]" />
                  I agree to the club code of conduct and to receive event updates by email.
                </label>

                <Button type="submit" className="h-12 rounded-full text-base font-semibold">
                  {price === 0 ? 'Submit application' : `Apply & continue to payment · $${price}`}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        className="h-11 rounded-xl border border-input bg-background px-3 outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        {...props}
      />
    </div>
  )
}
