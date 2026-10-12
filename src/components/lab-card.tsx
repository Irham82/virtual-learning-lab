import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BarChart3, GraduationCap, ArrowRight, Play } from 'lucide-react';
import { formatDuration, getDifficultyBadge, getSimulationTypeBadge } from '@/lib/utils';
import { CategoryIcon } from './category-icon';

export interface LabCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  subject: string;
  duration: number;
  difficulty: string;
  simulationType: string;
  thumbnail?: string | null;
  featured?: boolean;
  category: {
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
  };
  educationLevel: {
    name: string;
    slug: string;
  };
  userProgress?: {
    status: string;
    completedAt?: Date | null;
  } | null;
}

export function LabCard({ lab }: { lab: LabCardData }) {
  const diffBadge = getDifficultyBadge(lab.difficulty);
  const typeBadge = getSimulationTypeBadge(lab.simulationType);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        {lab.thumbnail ? (
          <img
            src={lab.thumbnail}
            alt={lab.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white">
            <CategoryIcon name={lab.category.icon} className="w-12 h-12 text-brand-300/60" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${typeBadge.color}`}>
            {typeBadge.label}
          </span>
          {lab.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm">
              ★ Unggulan
            </span>
          )}
        </div>

        {/* Category & Subject Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white/90 drop-shadow">
          <CategoryIcon name={lab.category.icon} className="w-4 h-4 text-tealbrand-300" />
          <span>{lab.category.name}</span>
          <span>•</span>
          <span className="text-slate-300 font-normal">{lab.subject}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
              <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
              {lab.educationLevel.name}
            </span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${diffBadge.color}`}>
              {diffBadge.label}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base lg:text-lg group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
            {lab.title}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {lab.shortDescription}
          </p>
        </div>

        {/* Footer Meta & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDuration(lab.duration)}</span>
          </div>

          <Link
            href={`/laboratorium/${lab.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
          >
            <span>Mulai Belajar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
