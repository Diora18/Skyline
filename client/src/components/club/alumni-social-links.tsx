import { Camera } from 'lucide-react'

const alumniSearchLinks = [
  {
    label: 'Search Skyline alumni on LinkedIn',
    href: 'https://www.linkedin.com/search/results/people/?keywords=Skyline%20SSA%20alumni',
    icon: 'linkedin',
  },
  {
    label: 'Search Skyline alumni on Instagram',
    href: 'https://www.instagram.com/explore/search/keyword/?q=Skyline%20SSA%20alumni',
    icon: 'instagram',
  },
]

export function AlumniSocialLinks() {
  return (
    <nav aria-label="Find Skyline alumni" className="flex items-center gap-2">
      {alumniSearchLinks.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          aria-label={label}
          title={label}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {icon === 'linkedin' ? (
            <span className="text-sm font-extrabold leading-none" aria-hidden="true">in</span>
          ) : (
            <Camera className="size-4" aria-hidden="true" />
          )}
        </a>
      ))}
    </nav>
  )
}
