'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createLabAction(prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const title = (formData.get('title') as string) || '';
  const slug = (formData.get('slug') as string) || '';
  const shortDescription = (formData.get('shortDescription') as string) || '';
  const fullDescription = (formData.get('fullDescription') as string) || '';
  const categoryId = (formData.get('categoryId') as string) || '';
  const educationLevelId = (formData.get('educationLevelId') as string) || '';
  const subject = (formData.get('subject') as string) || '';
  const learningObjectivesRaw = (formData.get('learningObjectives') as string) || '';
  const prerequisites = (formData.get('prerequisites') as string) || '';
  const duration = parseInt(formData.get('duration') as string) || 30;
  const difficulty = (formData.get('difficulty') as string) || 'BEGINNER';
  const simulationType = (formData.get('simulationType') as string) || 'WEB_INTERACTIVE';
  const thumbnail = (formData.get('thumbnail') as string) || '';
  const instructions = (formData.get('instructions') as string) || '';
  const status = (formData.get('status') as string) || 'DRAFT';
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true';

  if (!title.trim() || !slug.trim() || !categoryId || !educationLevelId) {
    return { error: 'Judul, slug URL, kategori, dan jenjang pendidikan wajib diisi.' };
  }

  // Check unique slug
  const existingSlug = await prisma.laboratory.findUnique({
    where: { slug: slug.trim().toLowerCase() },
  });
  if (existingSlug) {
    return { error: 'Slug URL ini sudah digunakan laboratorium lain. Gunakan slug yang unik.' };
  }

  // Parse objectives
  const objectivesArray = learningObjectivesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const lab = await prisma.laboratory.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        categoryId,
        educationLevelId,
        subject: subject.trim(),
        learningObjectives: JSON.stringify(objectivesArray),
        prerequisites: prerequisites.trim() || null,
        duration,
        difficulty,
        simulationType,
        thumbnail: thumbnail.trim() || null,
        instructions: instructions.trim() || 'Ikuti petunjuk simulasi di layar.',
        status,
        featured,
        createdById: admin.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    // Create a default initial activity
    await prisma.learningActivity.create({
      data: {
        laboratoryId: lab.id,
        stepNumber: 1,
        title: 'Eksplorasi Konsep Dasar',
        description: 'Buka modul simulasi dan catat parameter awal.',
        taskType: 'SIMULATION',
        estimatedMinutes: Math.round(duration / 2),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'CREATE_LABORATORY',
        entity: 'Laboratory',
        entityId: lab.id,
        details: JSON.stringify({ title: lab.title, slug: lab.slug, status: lab.status }),
      },
    });
  } catch (err: any) {
    return { error: err.message || 'Gagal menyimpan laboratorium.' };
  }

  revalidatePath('/admin/laboratorium');
  revalidatePath('/laboratorium');
  redirect('/admin/laboratorium');
}

export async function updateLabAction(labId: string, prevState: any, formData: FormData) {
  const admin = await requireAdmin();

  const title = (formData.get('title') as string) || '';
  const shortDescription = (formData.get('shortDescription') as string) || '';
  const fullDescription = (formData.get('fullDescription') as string) || '';
  const categoryId = (formData.get('categoryId') as string) || '';
  const educationLevelId = (formData.get('educationLevelId') as string) || '';
  const subject = (formData.get('subject') as string) || '';
  const learningObjectivesRaw = (formData.get('learningObjectives') as string) || '';
  const prerequisites = (formData.get('prerequisites') as string) || '';
  const duration = parseInt(formData.get('duration') as string) || 30;
  const difficulty = (formData.get('difficulty') as string) || 'BEGINNER';
  const simulationType = (formData.get('simulationType') as string) || 'WEB_INTERACTIVE';
  const thumbnail = (formData.get('thumbnail') as string) || '';
  const instructions = (formData.get('instructions') as string) || '';
  const status = (formData.get('status') as string) || 'DRAFT';
  const featured = formData.get('featured') === 'on' || formData.get('featured') === 'true';

  const objectivesArray = learningObjectivesRaw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const existing = await prisma.laboratory.findUnique({ where: { id: labId } });
    if (!existing) return { error: 'Laboratorium tidak ditemukan' };

    await prisma.laboratory.update({
      where: { id: labId },
      data: {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        categoryId,
        educationLevelId,
        subject: subject.trim(),
        learningObjectives: JSON.stringify(objectivesArray),
        prerequisites: prerequisites.trim() || null,
        duration,
        difficulty,
        simulationType,
        thumbnail: thumbnail.trim() || null,
        instructions: instructions.trim(),
        status,
        featured,
        publishedAt:
          status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'UPDATE_LABORATORY',
        entity: 'Laboratory',
        entityId: labId,
        details: JSON.stringify({ title, status, featured }),
      },
    });
  } catch (err: any) {
    return { error: err.message || 'Gagal memperbarui laboratorium.' };
  }

  revalidatePath('/admin/laboratorium');
  revalidatePath(`/admin/laboratorium/${labId}/edit`);
  revalidatePath('/laboratorium');
  redirect('/admin/laboratorium');
}

export async function deleteLabAction(labId: string) {
  const admin = await requireAdmin();

  const lab = await prisma.laboratory.findUnique({ where: { id: labId } });
  if (!lab) return { error: 'Laboratorium tidak ditemukan' };

  await prisma.laboratory.delete({ where: { id: labId } });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'DELETE_LABORATORY',
      entity: 'Laboratory',
      entityId: labId,
      details: JSON.stringify({ title: lab.title, slug: lab.slug }),
    },
  });

  revalidatePath('/admin/laboratorium');
  revalidatePath('/laboratorium');
  return { success: true };
}

export async function toggleLabStatusAction(labId: string, newStatus: string) {
  const admin = await requireAdmin();

  const lab = await prisma.laboratory.update({
    where: { id: labId },
    data: {
      status: newStatus,
      publishedAt: newStatus === 'PUBLISHED' ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CHANGE_LAB_STATUS',
      entity: 'Laboratory',
      entityId: labId,
      details: JSON.stringify({ newStatus }),
    },
  });

  revalidatePath('/admin/laboratorium');
  revalidatePath('/laboratorium');
  return { success: true, status: lab.status };
}

export async function toggleLabFeaturedAction(labId: string) {
  const admin = await requireAdmin();

  const current = await prisma.laboratory.findUnique({ where: { id: labId } });
  if (!current) return { error: 'Laboratorium tidak ditemukan' };

  const updated = await prisma.laboratory.update({
    where: { id: labId },
    data: { featured: !current.featured },
  });

  revalidatePath('/admin/laboratorium');
  revalidatePath('/laboratorium');
  return { success: true, featured: updated.featured };
}

export async function createCategoryAction(prevState: any, formData: FormData) {
  const admin = await requireAdmin();
  const name = (formData.get('name') as string) || '';
  const slug = (formData.get('slug') as string) || '';
  const description = (formData.get('description') as string) || '';
  const icon = (formData.get('icon') as string) || 'Layers';

  if (!name.trim() || !slug.trim()) {
    return { error: 'Nama dan slug kategori wajib diisi.' };
  }

  try {
    await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        icon: icon.trim(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        details: JSON.stringify({ name, slug }),
      },
    });
  } catch (err: any) {
    return { error: 'Kategori atau slug sudah terdaftar.' };
  }

  revalidatePath('/admin/kategori');
  revalidatePath('/');
  return { success: 'Kategori berhasil ditambahkan.' };
}

export async function deleteCategoryAction(catId: string) {
  const admin = await requireAdmin();
  await prisma.category.delete({ where: { id: catId } });
  revalidatePath('/admin/kategori');
  revalidatePath('/');
  return { success: true };
}

export async function createEducationLevelAction(prevState: any, formData: FormData) {
  const admin = await requireAdmin();
  const name = (formData.get('name') as string) || '';
  const slug = (formData.get('slug') as string) || '';
  const description = (formData.get('description') as string) || '';

  if (!name.trim() || !slug.trim()) {
    return { error: 'Nama dan slug jenjang wajib diisi.' };
  }

  try {
    await prisma.educationLevel.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
      },
    });
  } catch (err: any) {
    return { error: 'Jenjang atau slug sudah terdaftar.' };
  }

  revalidatePath('/admin/jenjang');
  return { success: 'Jenjang pendidikan berhasil ditambahkan.' };
}

export async function toggleUserStatusAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    return { error: 'Anda tidak dapat menonaktifkan akun admin Anda sendiri.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'Pengguna tidak ditemukan.' };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'TOGGLE_USER_STATUS',
      entity: 'User',
      entityId: userId,
      details: JSON.stringify({ email: user.email, isActive: updated.isActive }),
    },
  });

  revalidatePath('/admin/pengguna');
  return { success: true, isActive: updated.isActive };
}

export async function updateSettingsAction(prevState: any, formData: FormData) {
  await requireAdmin();

  const siteName = (formData.get('site_name') as string) || '';
  const siteTagline = (formData.get('site_tagline') as string) || '';
  const contactEmail = (formData.get('contact_email') as string) || '';
  const contactPhone = (formData.get('contact_phone') as string) || '';

  const pairs = [
    { key: 'site_name', value: siteName },
    { key: 'site_tagline', value: siteTagline },
    { key: 'contact_email', value: contactEmail },
    { key: 'contact_phone', value: contactPhone },
  ];

  for (const p of pairs) {
    await prisma.siteSetting.upsert({
      where: { key: p.key },
      create: { key: p.key, value: p.value },
      update: { value: p.value },
    });
  }

  revalidatePath('/admin/pengaturan');
  return { success: 'Pengaturan platform berhasil diperbarui.' };
}
