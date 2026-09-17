import { type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: .65 } };

export function SectionTitle({ label, title, text }: { label: string; title: ReactNode; text?: string }) { return <motion.div {...reveal} className="mb-10"><p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[.28em] text-muted"><i className="h-px w-8 bg-stroke" />{label}</p><h2 className="mb-4 text-4xl tracking-tight md:text-6xl">{title}</h2>{text && <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">{text}</p>}</motion.div>; }

export function Accordion({ label, title, children, initiallyOpen = false }: { label?: string; title: string; children: ReactNode; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return <div className="border-t border-stroke py-5"><button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className={`flex w-full items-center text-left ${label ? 'gap-5' : 'gap-3'}`}>{label && <span className="w-16 text-xs uppercase tracking-[.15em] text-muted">{label}</span>}<strong className={label ? 'flex-1 font-display text-2xl italic md:text-4xl' : 'flex-1 text-base font-medium md:text-lg'}>{title}</strong><motion.b animate={{ rotate: open ? 45 : 0 }} className="text-xl font-normal">+</motion.b></button><AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .28, ease: 'easeInOut' }} className="overflow-hidden"><div className={label ? 'ml-[84px] mt-4 max-w-xl text-sm text-muted' : 'mt-3 max-w-2xl text-sm leading-relaxed text-muted'}>{children}</div></motion.div>}</AnimatePresence></div>;
}
