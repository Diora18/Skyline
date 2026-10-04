import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Coffee,
  GraduationCap,
  Percent,
  Plane,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
} from 'lucide-react'
import { SectionHeading } from './section-heading'
import { buttonVariants, Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Category = 'All' | 'Career' | 'Savings' | 'Events' | 'Leadership'

const categories: Category[] = ['All', 'Career', 'Savings', 'Events', 'Leadership']

interface Perk {
  id: string
  category: 'Career' | 'Savings' | 'Events' | 'Leadership'
  icon: any
  title: string
  body: string
  highlight: string
  badge: string
}

const perks: Perk[] = [
  {
    id: 'career-nights',
    category: 'Career',
    icon: Briefcase,
    title: 'Career Nights & Speaker Panels',
    body: 'Connect directly with recruiters, alumni, and tech founders at exclusive monthly networking sessions and 1-on-1 portfolio reviews.',
    highlight: 'Monthly networking + direct recruiter access',
    badge: 'Career Growth',
  },
  {
    id: 'peer-mentorship',
    category: 'Career',
    icon: GraduationCap,
    title: '1-on-1 Upperclassman Mentorship',
    body: 'Get paired with an experienced senior mentor in your major during your first semester for academic, internship, and course guidance.',
    highlight: '200+ active mentor-mentee pairings',
    badge: 'Mentorship',
  },
  {
    id: 'partner-discounts',
    category: 'Savings',
    icon: Percent,
    title: '15% Off at 20+ Campus Partners',
    body: 'Flash your digital Skyline SSA member badge for 15% off at campus cafés, local eateries, bookstores, and tech repair shops.',
    highlight: 'Average member saves $120/semester',
    badge: 'Member Discount',
  },
  {
    id: 'subsidized-trips',
    category: 'Events',
    icon: Plane,
    title: 'Subsidized Hackathons & Trips',
    body: 'Travel to regional tech summits, weekend hackathons, and retreats with transportation, lodging, and tickets subsidized by club grants.',
    highlight: 'Up to 80% coverage on major conference trips',
    badge: 'Travel Grants',
  },
  {
    id: 'lead-project',
    category: 'Leadership',
    icon: Trophy,
    title: 'Funded Project Incubator',
    body: 'Pitch your own campus initiative or software project. Gain access to club funding, hardware resources, workspace, and a team to build it.',
    highlight: 'Up to $500 micro-grants per approved project',
    badge: 'Project Grant',
  },
  {
    id: 'free-snacks',
    category: 'Events',
    icon: Coffee,
    title: 'Free Food & Priority Pass Access',
    body: 'Complimentary food and drinks at every general meeting, plus discounted or free VIP pass access to flagship galas and workshops.',
    highlight: 'Guaranteed free catering at all 40+ annual events',
    badge: 'Free Food Always',
  },
]

export function PerksSection() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filteredPerks =
    activeCategory === 'All'
      ? perks
      : perks.filter((perk) => perk.category === activeCategory)

  return (
    <section id="perks" className="scroll-mt-16 py-20 md:py-28 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-6 space-y-12">
        
        {/* Section Heading matching site theme */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border pb-8">
          <SectionHeading
            eyebrow="Why join"
            title={
              <>
                More than a club.{' '}
                <span className="block text-primary">A launchpad for your career.</span>
              </>
            }
            description="Membership unlocks real career opportunities, campus discounts, project grants, and a vibrant community of over 640+ student builders."
          />

          <Link
            to="/membership/join"
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-full px-6 text-base shrink-0 font-bold')}
          >
            Become a member
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 border',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {cat === 'All' ? 'All Perks' : cat}
            </button>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPerks.map((perk) => {
            const IconComponent = perk.icon
            return (
              <div
                key={perk.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                      <IconComponent className="size-6" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                      {perk.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {perk.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {perk.body}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-primary">
                  <Zap className="size-3.5 shrink-0" />
                  <span>{perk.highlight}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Included in Every Membership Bar */}
        <div className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>Included in Every Membership ($25/year)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium">Digital Member ID Badge</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium">Priority Event Ticket Access</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium">Project & Expense Reimbursements</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium">Voting Rights in Board Elections</span>
            </div>
          </div>
        </div>

        {/* Testimonial Quote Figure */}
        <figure className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-center md:p-10 shadow-sm">
          <blockquote className="flex-1 text-xl font-semibold leading-snug md:text-2xl text-foreground">
            &ldquo;I came for the free pizza and left with a co-founder, an internship, and my best friends. Joining Skyline SSA was the best decision of my freshman year.&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-3 shrink-0">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm">
              PM
            </span>
            <span>
              <span className="block font-semibold text-foreground">Priya Mehta</span>
              <span className="block text-xs text-muted-foreground">Junior, Computer Science</span>
            </span>
          </figcaption>
        </figure>

        {/* Bottom CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 text-center space-y-6 shadow-md">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-3xl md:text-4xl font-extrabold">Ready to claim your perks?</h3>
            <p className="text-muted-foreground text-sm md:text-base">
              Join over 640+ students building their future at Skyline SSA today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/membership/join"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-full px-8 text-base font-bold shadow-md')}
            >
              Join Skyline SSA ($25/yr)
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              to="/event"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 rounded-full px-6 text-base font-semibold')}
            >
              Explore Upcoming Events
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
