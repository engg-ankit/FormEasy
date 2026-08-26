import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { Shield, Users, FileCheck, Clock, Target, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about ClickNsit — India's trusted online cyber cafe for form filling, helping students since 2024.",
  openGraph: {
    title: 'About Us | ClickNsit',
    description: "Learn about ClickNsit — India's trusted online cyber cafe for form filling, helping students since 2024.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-900 mb-6">About ClickNsit</h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            We started ClickNsit with one simple belief: <strong className="text-primary-700">No student should miss an exam deadline because of a complicated form — just like a cyber cafe, but online!</strong>
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 sm:p-12 text-white mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8" />
            <h2 className="text-2xl font-display font-bold">Our Mission</h2>
          </div>
          <p className="text-lg text-white/90 leading-relaxed">
            To make form filling effortless for every Indian student. Whether it's a government exam, college admission, scholarship, or any official form — we handle it so you can focus on what matters: <strong>preparing for your future.</strong>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: FileCheck, number: '5,000+', label: 'Forms Filled', color: 'text-primary-600' },
            { icon: Users, number: '2,000+', label: 'Happy Students', color: 'text-green-600' },
            { icon: Clock, number: '30 mins', label: 'Avg. Processing', color: 'text-blue-600' },
            { icon: Shield, number: '100%', label: 'Data Secure', color: 'text-accent-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 text-center border border-neutral-200">
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <p className="text-3xl font-bold text-primary-900">{stat.number}</p>
              <p className="text-sm text-neutral-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-3xl font-display font-bold text-primary-900 text-center mb-8">Why Choose ClickNsit?</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Shield, title: 'Trust & Security', desc: 'Your data is encrypted and secure. We never share your personal information with anyone.' },
            { icon: Clock, title: 'Speed & Accuracy', desc: 'We process forms within 24-48 hours with 99.9% accuracy rate. No errors, no rejections.' },
            { icon: Heart, title: 'Student First', desc: 'We understand student budget. Our service fees are the most affordable in the market.' },
          ].map((v, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <v.icon className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-bold text-primary-900 mb-2">{v.title}</h3>
              <p className="text-neutral-600">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-neutral-200">
          <h2 className="text-2xl font-display font-bold text-primary-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-neutral-600 leading-relaxed">
            <p>
              ClickNsit was born from a real problem. Our founder, like millions of Indian students, saw firsthand how difficult it was to fill exam application forms. The long queues at cyber cafes, the confusion of different portal formats, the panic of missing deadlines — we experienced it all.
            </p>
            <p>
              We asked ourselves: <strong className="text-primary-700">Why can't this be simpler?</strong> Why can't a student sit at home, fill their details once, and have their forms submitted automatically?
            </p>
            <p>
              That's how ClickNsit was born — your online cyber cafe! Today, we help thousands of students across India fill their exam forms, college admissions, scholarship applications, and more — all from the comfort of their homes.
            </p>
            <p className="font-medium text-primary-900">
              We're not just a form filling service. We're your partner in building your future. 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
