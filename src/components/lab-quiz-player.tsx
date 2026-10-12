'use client';

import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { submitQuizAttempt } from '@/app/actions/learning';
import confetti from 'canvas-confetti';

interface Question {
  id: string;
  question: string;
  options: string; // JSON array of string
  explanation?: string | null;
  order: number;
}

interface LabQuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description?: string | null;
    passingScore: number;
    questions: Question[];
  };
  labId: string;
  isLoggedIn: boolean;
  initialAttempt?: {
    score: number;
    passed: boolean;
    answers: string;
  } | null;
}

export function LabQuizPlayer({
  quiz,
  labId,
  isLoggedIn,
  initialAttempt,
}: LabQuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (initialAttempt?.answers) {
      try {
        return JSON.parse(initialAttempt.answers);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    passingScore: number;
  } | null>(() => {
    if (initialAttempt) {
      return {
        score: initialAttempt.score,
        passed: initialAttempt.passed,
        correctCount: Math.round((initialAttempt.score / 100) * quiz.questions.length),
        totalQuestions: quiz.questions.length,
        passingScore: quiz.passingScore,
      };
    }
    return null;
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (result) return; // Prevent changing after submission until retry
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk mencatat hasil kuis evaluasi.');
      return;
    }

    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm('Anda belum menjawab semua pertanyaan. Yakin ingin mengumpulkan sekarang?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quiz.id, labId, answers);
      if (res.success && res.score !== undefined) {
        setResult({
          score: res.score,
          passed: !!res.passed,
          correctCount: res.correctCount || 0,
          totalQuestions: res.totalQuestions || 0,
          passingScore: res.passingScore || quiz.passingScore,
        });

        if (res.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            {quiz.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {quiz.description || 'Kuis evaluasi pemahaman materi laboratorium.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
            Nilai Kelulusan: {quiz.passingScore}%
          </span>
        </div>
      </div>

      {/* Result Card if submitted */}
      {result && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300 ${
            result.passed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md ${
                result.passed ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {result.score}%
            </div>
            <div>
              <h4 className="font-extrabold text-base">
                {result.passed ? 'Selamat! Anda Lulus Evaluasi 🎉' : 'Belum Mencapai Nilai Kelulusan'}
              </h4>
              <p className="text-xs mt-0.5 opacity-80">
                Benar {result.correctCount} dari {result.totalQuestions} soal (Standar kelulusan:{' '}
                {result.passingScore}%).
              </p>
            </div>
          </div>

          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Kuis</span>
          </button>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => {
          let options: string[] = [];
          try {
            options = JSON.parse(q.options);
          } catch {
            options = [];
          }

          const selectedOption = answers[q.id];

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/90 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 pl-8">
                {options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-[1.01]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-white text-brand-700 border-white'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation note if evaluated */}
              {result && q.explanation && (
                <div className="mt-2 ml-8 p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Penjelasan: </span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!result && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 ${
              submitting
                ? 'bg-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-brand-600 to-tealbrand-600 hover:from-brand-700 hover:to-tealbrand-700 hover:scale-[1.02]'
            }`}
          >
            <span>{submitting ? 'Memeriksa Jawaban...' : 'Kumpulkan Jawaban Kuis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
