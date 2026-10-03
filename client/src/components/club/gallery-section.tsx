
import { SectionHeading } from './section-heading'

const photos = [
  { src: '/images/gallery-trip.png', alt: 'Members posing on a mountain overlook during a club hike', className: 'col-span-2 row-span-2' },
  { src: '/images/gallery-fair.png', alt: 'Skyline SSA booth at the campus activities fair', className: '' },
  { src: '/images/event-social.png', alt: 'Members at the rooftop welcome social', className: '' },
  { src: '/images/event-workshop.png', alt: 'A student presenting at a club workshop', className: 'col-span-2 md:col-span-1' },
  { src: '/images/event-hackathon.png', alt: 'Teams working through the night at Nova Hack', className: 'col-span-2 md:col-span-1' },
]

export function GallerySection() {
  return (
    <section aria-labelledby="gallery-title" className="bg-muted py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading eyebrow="Gallery" title={<span id="gallery-title">Last semester, in pictures</span>} />
        <div className="mt-12 grid auto-rows-[10rem] grid-cols-2 gap-4 md:auto-rows-[13rem] md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.src} className={`relative overflow-hidden rounded-3xl border-2 border-foreground ${p.className}`}>
              <img src={p.src} alt={p.alt} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
