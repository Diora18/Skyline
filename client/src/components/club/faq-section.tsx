import { Plus } from 'lucide-react'
import { SectionHeading } from './section-heading'

const faqs = [
  {
    q: 'Who can join Skyline SSA?',
    a: 'Any enrolled undergraduate or graduate student. No experience, major or tryout required — just curiosity.',
  },
  {
    q: 'What does my membership fee pay for?',
    a: 'Every dollar goes back into events: venues, food, trip transport, hackathon prizes and member merch. Our budget is shared with members every semester.',
  },
  {
    q: 'Can I come to an event before joining?',
    a: 'Absolutely. Open events are free for everyone. Members-only events are marked with a badge on the events list.',
  },
  {
    q: 'Is there financial aid for memberships?',
    a: "Yes. Email the treasurer and we'll waive dues, no questions asked. Nobody should miss out because of cost.",
  },
  {
    q: 'How do I run for the board?',
    a: 'Any Member or All-Access member in good standing can run in the spring elections. Nominations open in March.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-5">
        <SectionHeading
          className="lg:col-span-2"
          eyebrow="FAQ"
          title="Questions? Answered."
          description="Can't find what you're looking for? Drop us a DM or swing by any meeting."
        />
        <div className="flex flex-col gap-3 lg:col-span-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 open:border-foreground">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted transition-transform group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
