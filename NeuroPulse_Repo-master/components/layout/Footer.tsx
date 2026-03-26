import Link from 'next/link'
import { Brain, Github, Mail, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#1e2e1e] bg-[#070b07] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs syne">NP</span>
              </div>
              <span className="text-[#f0faf0] font-bold text-lg syne">NeuroPulse</span>
            </div>
            <p className="text-[#6b8f6b] text-sm leading-relaxed max-w-xs">
              AI-powered EEG cognitive assessment platform for early detection and severity classification of neurodegenerative diseases.
            </p>
            <p className="text-[#4a6a4a] text-xs mt-4">
              Designed by <span className="text-emerald-500 font-medium">Vimansa Abhayasekara</span>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[#f0faf0] text-sm font-semibold mb-3 syne">Navigation</p>
            <div className="space-y-2">
              {[
                { label: 'Home',    href: '/' },
                { label: 'Analyze', href: '/analyze' },
                { label: 'About',   href: '/about' },
                { label: 'FAQ',     href: '/faq' },
              ].map(({ label, href }) => (
                <Link key={href} href={href}
                  className="block text-[#6b8f6b] hover:text-emerald-400 text-sm transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[#f0faf0] text-sm font-semibold mb-3 syne">Legal</p>
            <div className="space-y-2">
              <p className="text-[#6b8f6b] text-xs leading-relaxed">
                NeuroPulse is a research support tool. Not a medical diagnostic device.
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[#6b8f6b] text-xs">No data is stored or transmitted</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1e2e1e] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#4a6a4a] text-xs">
            © {new Date().getFullYear()} NeuroPulse. Research purposes only.
          </p>
          <p className="text-[#4a6a4a] text-xs text-center">
            ⚠️ Not a substitute for professional medical evaluation. Always consult a qualified clinician.
          </p>
        </div>
      </div>
    </footer>
  )
}