import { EMAIL_ADDRESS } from '../data/site';

export function Footer() {
  return (
    <footer className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-28">
      <img src="/event/auditorium-group.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" width="1500" height="1000" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 mx-auto max-w-[1100px]">
        <p className="mb-6 font-display text-6xl italic md:text-8xl">UNFOLD</p>
        <div className="grid gap-x-16 gap-y-12 border-t border-white/10 pt-10 sm:grid-cols-2 lg:gap-x-24">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[.2em] text-muted">Contact</p>
            <a className="break-all text-base hover:text-[#89AACC] sm:break-normal sm:text-lg" href={`mailto:${EMAIL_ADDRESS}`}>{EMAIL_ADDRESS}</a>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[.2em] text-muted">Organised by</p>
            <p className="text-sm text-muted">IEEE IA/IE/PELS Jt Ch Kerala · IEEE RAS Kerala Chapter · CCE IEEE SB</p>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[.2em] text-muted">Event recap</p>
            <a className="text-sm hover:text-[#89AACC]" href="#gallery">View event gallery</a>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-[.2em] text-muted">With thanks</p>
            <a className="text-sm hover:text-[#89AACC]" href="#partners">Sponsors and partners</a>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <p>© 2026 UNFOLD</p>
          <div className="flex gap-5">
            <a href="https://www.instagram.com/ieeeiaiepelskerala/">Instagram</a>
            <a href="https://in.linkedin.com/company/ieeeiaiepelskerala">LinkedIn</a>
          </div>
          <a href="https://ia.ie.pels.ieeekerala.org/">IEEE IA/IE/PELS Jt Ch Kerala</a>
        </div>
      </div>
    </footer>
  )
}
