import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { startOrUpdateLabProgress } from '@/app/actions/learning';
import { LabSimulationEngine } from '@/components/simulations/lab-simulation-engine';
import { LabActivityList } from '@/components/lab-activity-list';
import { LabQuizPlayer } from '@/components/lab-quiz-player';
import { CategoryIcon } from '@/components/category-icon';
import {
  Clock,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Share2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { formatDuration, getDifficultyBadge, getSimulationTypeBadge } from '@/lib/utils';
import { FavoriteButton } from './favorite-button';

interface LabDetailPageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 0;

export default async function LabDetailPage({ params }: LabDetailPageProps) {
  const user = await getCurrentUser();

  const lab = await prisma.laboratory.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      educationLevel: true,
      activities: {
        orderBy: { stepNumber: 'asc' },
      },
      quizzes: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!lab || lab.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment viewCount
  await prisma.laboratory.update({
    where: { id: lab.id },
    data: { viewCount: { increment: 1 } },
  });

  // If user is logged in, record or fetch progress & favorite
  let userProgress = null;
  let isFavorited = false;
  let quizAttempt = null;

  if (user) {
    userProgress = await startOrUpdateLabProgress(lab.id);

    const fav = await prisma.favorite.findUnique({
      where: {
        userId_laboratoryId: {
          userId: user.id,
          laboratoryId: lab.id,
        },
      },
    });
    isFavorited = Boolean(fav);

    if (lab.quizzes.length > 0) {
      quizAttempt = await prisma.quizAttempt.findFirst({
        where: {
          userId: user.id,
          quizId: lab.quizzes[0].id,
        },
        orderBy: { completedAt: 'desc' },
      });
    }
  }

  let completedActivityIds: string[] = [];
  if (userProgress?.completedActivityIds) {
    try {
      completedActivityIds = JSON.parse(userProgress.completedActivityIds);
    } catch {
      completedActivityIds = [];
    }
  }

  let learningObjectives: string[] = [];
  try {
    learningObjectives = JSON.parse(lab.learningObjectives);
  } catch {
    learningObjectives = [lab.learningObjectives];
  }

  const diffBadge = getDifficultyBadge(lab.difficulty);
  const typeBadge = getSimulationTypeBadge(lab.simulationType);
  const primaryQuiz = lab.quizzes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/laboratorium"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>

        {user && (
          <FavoriteButton labId={lab.id} initialFavorited={isFavorited} />
        )}
      </div>

      {/* Lab Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            <CategoryIcon name={lab.category.icon} className="w-3.5 h-3.5" />
            {lab.category.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
            {lab.educationLevel.name}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeBadge.color}`}>
            {typeBadge.label}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffBadge.color}`}>
            {diffBadge.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(lab.duration)}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {lab.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl">
            {lab.shortDescription}
          </p>
        </div>

        {/* User Progress Banner if logged in */}
        {user && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-tealbrand-50/50 to-white border border-brand-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  userProgress?.status === 'COMPLETED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 text-white'
                }`}
              >
                {userProgress?.status === 'COMPLETED' ? '✓' : '▶'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Status Pembelajaran:{' '}
                  <span
                    className={
                      userProgress?.status === 'COMPLETED'
                        ? 'text-emerald-700'
                        : 'text-brand-700'
                    }
                  >
                    {userProgress?.status === 'COMPLETED'
                      ? 'Selesai Sempurna'
                      : 'Sedang Berlangsung'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {completedActivityIds.length} dari {lab.activities.length} aktivitas diselesaikan
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Waktu interaksi: {Math.round((userProgress?.timeSpentSeconds || 60) / 60)} Menit
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE SIMULATION AREA (SECTION G) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Area Simulasi Virtual
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Komponen Eksperimen Langsung
          </span>
        </div>

        {/* Render Modular Simulation Engine */}
        <LabSimulationEngine
          slug={lab.slug}
          title={lab.title}
          simulationType={lab.simulationType}
          simulationConfig={lab.simulationConfig}
        />
      </section>

      {/* TWO COLUMN CONTENT: Educational Details (Left 7) & Checklist/Quiz (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Learning Objectives & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Learning Objectives */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Tujuan Pembelajaran
            </h3>
            <ul className="space-y-2.5">
              {learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-tealbrand-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full Description & Prerequisites */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Deskripsi Modul &amp; Teori Pengantar
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{lab.fullDescription}</p>
            </div>

            {lab.prerequisites && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Materi Prasyarat: </span>
                  <span>{lab.prerequisites}</span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-tealbrand-600" />
              Petunjuk Penggunaan &amp; Langkah Eksperimen
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
              {lab.instructions}
            </div>
          </div>
        </div>

        {/* Right Column: Activities Checklist & Evaluation Quiz */}
        <div className="lg:col-span-5 space-y-6">
          {/* Activities list */}
          {lab.activities.length > 0 && (
            <LabActivityList
              labId={lab.id}
              activities={lab.activities}
              initialCompletedIds={completedActivityIds}
              isLoggedIn={Boolean(user)}
            />
          )}

          {/* Quiz */}
          {primaryQuiz && (
            <LabQuizPlayer
              quiz={primaryQuiz}
              labId={lab.id}
              isLoggedIn={Boolean(user)}
              initialAttempt={quizAttempt}
            />
          )}
        </div>
      </div>
    </div>
  );
}
