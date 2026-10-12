import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { LabForm } from '../lab-form';

export const revalidate = 0;

export default async function AddLabPage() {
  await requireAdmin();

  const [categories, educationLevels] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    prisma.educationLevel.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
  ]);

  return <LabForm categories={categories} educationLevels={educationLevels} />;
}
