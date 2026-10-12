'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, CheckSquare } from 'lucide-react';
import { toggleActivityCompletion } from '@/app/actions/learning';

interface Activity {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  taskType: string;
  estimatedMinutes: number;
}

interface LabActivityListProps {
  labId: string;
  activities: Activity[];
  initialCompletedIds: string[];
  isLoggedIn: boolean;
}

export function LabActivityList({
  labId,
  activities,
  initialCompletedIds,
  isLoggedIn,
}: LabActivityListProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const total = activities.length;
  const completedCount = completedIds.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleToggle = async (actId: string) => {
    if (!isLoggedIn) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk menyimpan progres belajar.');
      return;
    }

    setLoadingId(actId);
    try {
      const res = await toggleActivityCompletion(labId, actId);
      if (res.success) {
        setCompletedIds(res.completedActivityIds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" />
            Daftar Aktivitas &amp; Lembar Eksperimen
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Selesaikan seluruh aktivitas terstruktur berikut untuk memverifikasi pemahaman.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-700">
            {completedCount} dari {total} Selesai
          </span>
          <span className="block text-[11px] font-mono text-brand-600 font-bold">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-600 to-tealbrand-500 h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Activities list */}
      <div className="space-y-3">
        {activities.map((act) => {
          const isDone = completedIds.includes(act.id);
          const isLoading = loadingId === act.id;

          return (
            <div
              key={act.id}
              onClick={() => handleToggle(act.id)}
              className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-50 hover:border-brand-300'
              }`}
            >
              <button
                type="button"
                className={`mt-0.5 text-lg transition-transform ${isLoading ? 'animate-spin' : ''}`}
                disabled={isLoading}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                    Langkah {act.stepNumber}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.estimatedMinutes} Menit
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-tealbrand-700 bg-tealbrand-100/60 px-1.5 py-0.5 rounded">
                    {act.taskType}
                  </span>
                </div>

                <h4
                  className={`text-sm font-bold ${
                    isDone ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'
                  }`}
                >
                  {act.title}
                </h4>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
