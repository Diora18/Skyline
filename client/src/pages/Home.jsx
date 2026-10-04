import { Hero } from '@/components/club/hero'
import { Marquee } from '@/components/club/marquee'
import { PerksSection } from '@/components/club/perks-section'
import { TeamSection } from '@/components/club/team-section'
import { GallerySection } from '@/components/club/gallery-section'
import { FaqSection } from '@/components/club/faq-section'
import { SiteFooter } from '@/components/club/site-footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <PerksSection />
      <TeamSection />
      <GallerySection />
      <FaqSection />
      <SiteFooter />
    </main>
  )
}
