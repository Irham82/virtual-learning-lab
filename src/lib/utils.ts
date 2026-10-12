import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Menit`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} Jam ${rem} Menit` : `${hours} Jam`;
}

export function getDifficultyBadge(difficulty: string): { label: string; color: string } {
  switch (difficulty) {
    case 'BEGINNER':
      return { label: 'Pemula', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'INTERMEDIATE':
      return { label: 'Menengah', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'ADVANCED':
      return { label: 'Lanjutan', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { label: difficulty, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

export function getSimulationTypeBadge(type: string): { label: string; color: string } {
  switch (type) {
    case 'THREE_D':
      return { label: 'Simulasi 3D', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    case 'TWO_D':
      return { label: 'Simulasi 2D', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'WEB_INTERACTIVE':
      return { label: 'Web Interaktif', color: 'bg-tealbrand-100 text-tealbrand-800 border-tealbrand-200' };
    default:
      return { label: type, color: 'bg-slate-100 text-slate-800 border-slate-200' };
  }
}

export function getCategoryColorClass(color?: string | null): { bg: string; text: string; border: string; badge: string } {
  switch (color) {
    case 'blue':
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' };
    case 'indigo':
      return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' };
    case 'purple':
      return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' };
    case 'emerald':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' };
    case 'teal':
      return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-800' };
    case 'amber':
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' };
    case 'rose':
      return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-800' };
  }
}
