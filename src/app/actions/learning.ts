'use server';

import { prisma } from '@/lib/prisma';
import { requireUser, getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function startOrUpdateLabProgress(labId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const existing = await prisma.learningProgress.findUnique({
      where: {
        userId_laboratoryId: {
          userId: user.id,
          laboratoryId: labId,
        },
      },
    });

    if (!existing) {
      const created = await prisma.learningProgress.create({
        data: {
          userId: user.id,
          laboratoryId: labId,
          status: 'IN_PROGRESS',
          completedActivityIds: '[]',
          timeSpentSeconds: 60,
          lastAccessedAt: new Date(),
        },
      });
      return created;
    } else {
      const updated = await prisma.learningProgress.update({
        where: { id: existing.id },
        data: {
          lastAccessedAt: new Date(),
          timeSpentSeconds: { increment: 60 },
        },
      });
      return updated;
    }
  } catch (err) {
    console.warn('[LearningAction] startOrUpdateLabProgress error:', err);
    return null;
  }
}

export async function toggleActivityCompletion(labId: string, activityId: string) {
  const user = await requireUser();

  const progress = await prisma.learningProgress.findUnique({
    where: {
      userId_laboratoryId: {
        userId: user.id,
        laboratoryId: labId,
      },
    },
  });

  let currentIds: string[] = [];
  if (progress && progress.completedActivityIds) {
    try {
      currentIds = JSON.parse(progress.completedActivityIds);
    } catch {
      currentIds = [];
    }
  }

  const isCompleted = currentIds.includes(activityId);
  const nextIds = isCompleted
    ? currentIds.filter((id) => id !== activityId)
    : [...currentIds, activityId];

  // Count total activities of this lab
  const totalActivities = await prisma.learningActivity.count({
    where: { laboratoryId: labId },
  });

  const shouldMarkCompleted = totalActivities > 0 && nextIds.length >= totalActivities;

  const updatedProgress = await prisma.learningProgress.upsert({
    where: {
      userId_laboratoryId: {
        userId: user.id,
        laboratoryId: labId,
      },
    },
    create: {
      userId: user.id,
      laboratoryId: labId,
      status: shouldMarkCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      completedActivityIds: JSON.stringify(nextIds),
      completedAt: shouldMarkCompleted ? new Date() : null,
      lastAccessedAt: new Date(),
    },
    update: {
      completedActivityIds: JSON.stringify(nextIds),
      status: shouldMarkCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: shouldMarkCompleted ? new Date() : null,
      lastAccessedAt: new Date(),
    },
  });

  revalidatePath(`/laboratorium`);
  revalidatePath(`/dashboard`);
  return { success: true, completedActivityIds: nextIds, status: updatedProgress.status };
}

export async function submitQuizAttempt(
  quizId: string,
  labId: string,
  userAnswers: Record<string, number>
) {
  const user = await requireUser();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    return { error: 'Kuis tidak ditemukan' };
  }

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  quiz.questions.forEach((q) => {
    const selected = userAnswers[q.id];
    if (selected === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const passed = score >= quiz.passingScore;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: user.id,
      score,
      answers: JSON.stringify(userAnswers),
      passed,
      completedAt: new Date(),
    },
  });

  // If passed, also evaluate if lab should be marked COMPLETED
  if (passed) {
    const totalActivities = await prisma.learningActivity.count({
      where: { laboratoryId: labId },
    });

    const progress = await prisma.learningProgress.findUnique({
      where: {
        userId_laboratoryId: {
          userId: user.id,
          laboratoryId: labId,
        },
      },
    });

    let completedActs: string[] = [];
    if (progress?.completedActivityIds) {
      try {
        completedActs = JSON.parse(progress.completedActivityIds);
      } catch {
        completedActs = [];
      }
    }

    // Mark completed if activities are all done or no activities
    if (completedActs.length >= totalActivities) {
      await prisma.learningProgress.upsert({
        where: {
          userId_laboratoryId: {
            userId: user.id,
            laboratoryId: labId,
          },
        },
        create: {
          userId: user.id,
          laboratoryId: labId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }
  }

  revalidatePath(`/dashboard`);
  revalidatePath(`/laboratorium`);

  return {
    success: true,
    score,
    passed,
    correctCount,
    totalQuestions,
    passingScore: quiz.passingScore,
  };
}

export async function toggleFavoriteAction(labId: string) {
  const user = await requireUser();

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_laboratoryId: {
        userId: user.id,
        laboratoryId: labId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    revalidatePath(`/laboratorium`);
    revalidatePath(`/dashboard`);
    return { favorited: false };
  } else {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        laboratoryId: labId,
      },
    });
    revalidatePath(`/laboratorium`);
    revalidatePath(`/dashboard`);
    return { favorited: true };
  }
}
