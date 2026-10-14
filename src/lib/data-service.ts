import { prisma } from './prisma';
import initialData from './initial-data.json';

export interface CatalogFilterParams {
  q?: string;
  kategori?: string;
  jenjang?: string;
  kesulitan?: string;
  tipe?: string;
  sort?: string;
}

export async function getHomeData() {
  try {
    const [totalPublishedLabs, totalCategories, totalUsers, totalActivities] = await Promise.all([
      prisma.laboratory.count({ where: { status: 'PUBLISHED' } }),
      prisma.category.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.learningActivity.count(),
    ]);

    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            laboratories: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    const featuredLabs = await prisma.laboratory.findMany({
      where: { status: 'PUBLISHED', featured: true },
      take: 4,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        educationLevel: true,
      },
    });

    const latestLabs = await prisma.laboratory.findMany({
      where: { status: 'PUBLISHED' },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        educationLevel: true,
      },
    });

    if (categories.length > 0 && latestLabs.length > 0) {
      return {
        totalPublishedLabs,
        totalCategories,
        totalUsers,
        totalActivities,
        categories,
        featuredLabs,
        latestLabs,
      };
    }
  } catch (err) {
    console.warn('[DataService] Database connection fallback for HomePage:', err);
  }

  // Fallback from initial data
  const fallbackCategories = (initialData.categories as any[]).map((cat) => ({
    ...cat,
    _count: {
      laboratories: (initialData.labs as any[]).filter(
        (l) => l.categoryId === cat.id && l.status === 'PUBLISHED'
      ).length,
    },
  }));

  const fallbackFeatured = (initialData.labs as any[])
    .filter((l) => l.featured && l.status === 'PUBLISHED')
    .slice(0, 4);

  const fallbackLatest = (initialData.labs as any[])
    .filter((l) => l.status === 'PUBLISHED')
    .slice(0, 6);

  const totalActivities = (initialData.labs as any[]).reduce(
    (acc, lab) => acc + (lab.activities?.length || 0),
    0
  );

  return {
    totalPublishedLabs: (initialData.labs as any[]).filter((l) => l.status === 'PUBLISHED').length,
    totalCategories: initialData.categories.length,
    totalUsers: 145,
    totalActivities,
    categories: fallbackCategories,
    featuredLabs: fallbackFeatured,
    latestLabs: fallbackLatest,
  };
}

export async function getCatalogData(filters: CatalogFilterParams) {
  const query = filters.q?.trim().toLowerCase() || '';
  const categorySlug = filters.kategori || '';
  const levelSlug = filters.jenjang || '';
  const difficulty = filters.kesulitan || '';
  const simulationType = filters.tipe || '';
  const sortBy = filters.sort || 'newest';

  try {
    const [categories, educationLevels] = await Promise.all([
      prisma.category.findMany({ orderBy: { order: 'asc' } }),
      prisma.educationLevel.findMany({ orderBy: { order: 'asc' } }),
    ]);

    const where: any = {
      status: 'PUBLISHED',
    };

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { shortDescription: { contains: query } },
        { subject: { contains: query } },
      ];
    }
    if (categorySlug) where.category = { slug: categorySlug };
    if (levelSlug) where.educationLevel = { slug: levelSlug };
    if (difficulty) where.difficulty = difficulty;
    if (simulationType) where.simulationType = simulationType;

    let orderBy: any = { publishedAt: 'desc' };
    if (sortBy === 'title-asc') orderBy = { title: 'asc' };
    else if (sortBy === 'duration-asc') orderBy = { duration: 'asc' };
    else if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

    const labs = await prisma.laboratory.findMany({
      where,
      orderBy,
      include: {
        category: true,
        educationLevel: true,
      },
    });

    if (categories.length > 0 && educationLevels.length > 0) {
      return { categories, educationLevels, labs };
    }
  } catch (err) {
    console.warn('[DataService] Database connection fallback for Catalog:', err);
  }

  // Fallback from initial data
  let filteredLabs = (initialData.labs as any[]).filter((l) => l.status === 'PUBLISHED');

  if (query) {
    filteredLabs = filteredLabs.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.shortDescription.toLowerCase().includes(query) ||
        l.subject.toLowerCase().includes(query)
    );
  }
  if (categorySlug) {
    filteredLabs = filteredLabs.filter((l) => l.category?.slug === categorySlug);
  }
  if (levelSlug) {
    filteredLabs = filteredLabs.filter((l) => l.educationLevel?.slug === levelSlug);
  }
  if (difficulty) {
    filteredLabs = filteredLabs.filter((l) => l.difficulty === difficulty);
  }
  if (simulationType) {
    filteredLabs = filteredLabs.filter((l) => l.simulationType === simulationType);
  }

  if (sortBy === 'title-asc') {
    filteredLabs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'duration-asc') {
    filteredLabs.sort((a, b) => a.duration - b.duration);
  } else if (sortBy === 'popular') {
    filteredLabs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  }

  return {
    categories: initialData.categories as any[],
    educationLevels: initialData.levels as any[],
    labs: filteredLabs,
  };
}

export async function getLabDetail(slug: string) {
  try {
    const lab = await prisma.laboratory.findUnique({
      where: { slug },
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

    if (lab) return lab;
  } catch (err) {
    console.warn(`[DataService] Database connection fallback for Lab detail (${slug}):`, err);
  }

  // Fallback from initial data
  const fallback = (initialData.labs as any[]).find((l) => l.slug === slug);
  return fallback || null;
}

export async function incrementLabView(labId: string) {
  try {
    await prisma.laboratory.update({
      where: { id: labId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Non-critical, ignore if DB is read-only or in fallback mode
  }
}
