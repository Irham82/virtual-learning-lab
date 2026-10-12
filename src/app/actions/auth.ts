'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
  requireUser,
} from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string) || '';

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Input tidak valid',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });

    if (!user) {
      return { error: 'Email atau kata sandi salah' };
    }

    if (!user.isActive) {
      return { error: 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi admin.' };
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return { error: 'Email atau kata sandi salah' };
    }

    // Set cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
      },
    });
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem saat masuk.' };
  }

  // Redirect based on role or param
  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo);
  } else {
    redirect('/dashboard');
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message || 'Input tidak valid',
    };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase().trim() },
    });

    if (existing) {
      return { error: 'Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.' };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    // Rule: Public registration always creates USER role (least privilege)
    const newUser = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email.toLowerCase().trim(),
        passwordHash,
        role: 'USER',
        isActive: true,
      },
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTER',
        entity: 'User',
        entityId: newUser.id,
        details: JSON.stringify({ email: newUser.email }),
      },
    });
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan saat pendaftaran akun.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: user.id,
      },
    });
  }
  await clearSessionCookie();
  redirect('/masuk');
}

export async function updateProfileAction(prevState: any, formData: FormData) {
  const user = await requireUser();
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;

  if (!name || name.trim().length < 2) {
    return { error: 'Nama tidak boleh kurang dari 2 karakter' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.trim(),
      bio: bio ? bio.trim() : null,
    },
  });

  revalidatePath('/dashboard/profil');
  return { success: 'Profil berhasil diperbarui' };
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  const user = await requireUser();
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmNewPassword = formData.get('confirmNewPassword') as string;

  if (newPassword.length < 6) {
    return { error: 'Kata sandi baru minimal 6 karakter' };
  }

  if (newPassword !== confirmNewPassword) {
    return { error: 'Konfirmasi kata sandi baru tidak cocok' };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: 'Pengguna tidak ditemukan' };

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return { error: 'Kata sandi saat ini tidak tepat' };
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { success: 'Kata sandi Anda berhasil diperbarui' };
}
