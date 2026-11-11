import Link from 'next/link';
import { LogoIcon } from '@/components/logo-icon';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, MAILTO_URL } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="bg-primary-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <LogoIcon size={56} white />
            </div>
            <p className="text-primary-200 text-sm">
              Online cyber cafe — we fill forms, you focus on studying! 🖥️
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link href="/exams" className="hover:text-white">Browse Forms</Link></li>
              <li><Link href="/request-form" className="hover:text-white">Request Form</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <a href={MAILTO_URL} className="hover:text-white break-all">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-white">
                  {CONTACT_PHONE}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-primary-200">
          © {new Date().getFullYear()} ClickNsit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
