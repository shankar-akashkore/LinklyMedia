import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    to: '/billboards',
    src: '/images/billboard1.jpeg',
    alt: 'Billboard Advertising',
    title: 'Billboard Advertising',
    description: 'Premium outdoor advertising spaces with high visibility and maximum brand impact',
    number: '01',
    category: 'Outdoor',
    accentDot: 'bg-orange-500',
    hoverTitle: 'group-hover:text-orange-600',
    hoverBorder: 'group-hover:border-orange-200',
    hoverRing: 'group-hover:ring-orange-100',
  },
  {
    to: '/digital-screen',
    src: '/images/digital2.jpeg',
    alt: 'Digital Screens',
    title: 'Digital Screens',
    description: 'High-resolution digital displays for dynamic, engaging advertising campaigns',
    number: '02',
    category: 'Digital',
    accentDot: 'bg-sky-500',
    hoverTitle: 'group-hover:text-sky-600',
    hoverBorder: 'group-hover:border-sky-200',
    hoverRing: 'group-hover:ring-sky-100',
  },
  {
    to: '/influencer-marketing',
    src: '/images/influ2.jpeg',
    alt: 'Influencer Marketing',
    title: 'Influencer Marketing',
    description: 'Connect with top social media influencers to amplify your brand reach',
    number: '03',
    category: 'Social',
    accentDot: 'bg-rose-500',
    hoverTitle: 'group-hover:text-rose-600',
    hoverBorder: 'group-hover:border-rose-200',
    hoverRing: 'group-hover:ring-rose-100',
  },
  {
    to: '/btl-marketing',
    src: '/images/btl3.jpeg',
    alt: 'BTL Marketing',
    title: 'BTL Marketing',
    description: 'Below-the-line advertising through transit media and experiential campaigns',
    number: '04',
    category: 'Experiential',
    accentDot: 'bg-emerald-500',
    hoverTitle: 'group-hover:text-emerald-600',
    hoverBorder: 'group-hover:border-emerald-200',
    hoverRing: 'group-hover:ring-emerald-100',
  },
];

export default function Gridlayout() {
  return (
    <section className="mt-10 px-3 sm:mt-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              to={service.to}
              key={service.to}
              className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:rounded-3xl"
            >
              <article
                className={`h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:group-hover:-translate-y-2 sm:group-hover:shadow-xl sm:rounded-3xl ${service.hoverBorder} ring-0 ${service.hoverRing}`}
              >
                <div className="relative h-44 overflow-hidden sm:h-52">
                  <img
                    src={service.src}
                    alt={service.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur sm:bottom-4 sm:left-4 sm:px-3 sm:text-xs">
                    <span className={`h-2.5 w-2.5 rounded-full ${service.accentDot}`} />
                    {service.category}
                  </div>
                  <span className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/20 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4 sm:px-2.5 sm:text-xs">
                    {service.number}
                  </span>
                </div>

                <div className="flex min-h-[156px] flex-col p-4 sm:min-h-[170px] sm:p-5">
                  <h3 className={`text-base font-semibold text-slate-800 transition-colors duration-300 sm:text-lg ${service.hoverTitle}`}>
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
                    {service.description}
                  </p>

                  <div className="mt-auto pt-4 sm:pt-5">
                    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 transition-all duration-300 group-hover:gap-3 sm:text-sm">
                      Learn more
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.25}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
