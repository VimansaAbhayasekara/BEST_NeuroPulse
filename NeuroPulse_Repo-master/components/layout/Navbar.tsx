'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Menu, X, Activity } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home',     href: '/' },
  { label: 'Analyze',  href: '/analyze' },
  { label: 'About',    href: '/about' },
  { label: 'FAQ',      href: '/faq' },
]

export default function Navbar() {
  const [open,      setOpen]      = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070b07]/90 backdrop-blur-xl border-b border-[#1e2e1e]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <span className="text-white font-bold text-sm syne">NP</span>
            </div>
            <span className="text-[#f0faf0] font-bold text-xl syne tracking-tight group-hover:text-emerald-400 transition-colors">
              NeuroPulse
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === href
                    ? 'text-emerald-400 bg-emerald-950/50'
                    : 'text-[#8aaa8a] hover:text-[#f0faf0] hover:bg-[#0f150f]'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/analyze"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-900/30">
              <Activity className="w-3.5 h-3.5" />
              Analyze EEG
            </Link>
            <button onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#1e2e1e] text-[#8aaa8a] hover:text-[#f0faf0] hover:bg-[#0f150f] transition-all">
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-[#1e2e1e] py-3 space-y-1">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? 'text-emerald-400 bg-emerald-950/50'
                    : 'text-[#8aaa8a] hover:text-[#f0faf0] hover:bg-[#0f150f]'
                }`}>
                {label}
              </Link>
            ))}
            <div className="pt-2 px-2">
              <Link href="/analyze" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold">
                <Activity className="w-4 h-4" /> Analyze EEG
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}