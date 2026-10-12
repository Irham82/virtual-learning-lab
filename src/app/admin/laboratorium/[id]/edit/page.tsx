import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { LabForm } from '../../lab-form';

interface EditLabPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function EditLabPage({ params }: EditLabPageProps) {
  await requireAdmin();

  const [lab, categories, educationLevels] = await Promise.all([
    prisma.laboratory.findUnique({
      where: { id: params.id },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    prisma.educationLevel.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!lab) {
    notFound();
  }

  return (
    <LabForm
      categories={categories}
      educationLevels={educationLevels}
      initialData={lab}
      isEdit={true}
    />
  );
}
