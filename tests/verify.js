const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'virtual-learning-lab-jwt-secret-fallback-key-2025';

async function runTests() {
  console.log('=== RUNNING AUTOMATED VERIFICATION SUITE ===\n');
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Test Users and Password Hashing
    const admin = await prisma.user.findUnique({ where: { email: 'admin@virtuallearninglab.id' } });
    assert(admin !== null && admin.role === 'ADMIN', 'Admin user exists with role ADMIN');

    const isAdminPassValid = await bcrypt.compare('AdminPass123!', admin?.passwordHash || '');
    assert(isAdminPassValid, 'Admin password hashes and verifies correctly with bcrypt');

    const siswa = await prisma.user.findUnique({ where: { email: 'siswa@virtuallearninglab.id' } });
    assert(siswa !== null && siswa.role === 'USER', 'Demo student user exists with role USER');

    const isSiswaPassValid = await bcrypt.compare('SiswaPass123!', siswa?.passwordHash || '');
    assert(isSiswaPassValid, 'Student password hashes and verifies correctly with bcrypt');

    // 2. Test JWT Token Signing & Decoding
    const payload = { userId: admin.id, email: admin.email, role: admin.role, name: admin.name };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === admin.id && decoded.role === 'ADMIN', 'JWT signing and server role decoding works securely');

    // 3. Test Categories
    const categoriesCount = await prisma.category.count();
    assert(categoriesCount >= 7, `Categories table populated (${categoriesCount} categories)`);

    // 4. Test Education Levels
    const levelsCount = await prisma.educationLevel.count();
    assert(levelsCount >= 5, `Education Levels table populated (${levelsCount} levels)`);

    // 5. Test Laboratories
    const labsCount = await prisma.laboratory.count();
    assert(labsCount >= 8, `Laboratories table populated with 8 diverse labs (${labsCount} labs)`);

    const publishedLabsCount = await prisma.laboratory.count({ where: { status: 'PUBLISHED' } });
    assert(publishedLabsCount >= 8, `All initial laboratories are marked PUBLISHED (${publishedLabsCount} published)`);

    // 6. Test Specific Simulations exist and have activities & quizzes
    const sdIpasLab = await prisma.laboratory.findUnique({
      where: { slug: 'lab-ipas-sd-tata-surya' },
      include: { educationLevel: true, activities: true, quizzes: { include: { questions: true } } },
    });
    assert(sdIpasLab !== null, 'SD IPAS Solar System lab exists in database');
    assert(sdIpasLab?.educationLevel.slug === 'sd-mi', 'SD IPAS lab is correctly tagged to SD/MI education level');
    assert(sdIpasLab?.activities.length === 5, 'SD IPAS lab has 5 guided experiment activities');
    assert(sdIpasLab?.quizzes.length === 1 && sdIpasLab.quizzes[0].questions.length === 4, 'SD IPAS lab has kid-friendly quiz with 4 questions');

    const solarLab = await prisma.laboratory.findUnique({
      where: { slug: 'lab-virtual-tata-surya' },
      include: { activities: true, quizzes: { include: { questions: true } } },
    });
    assert(solarLab !== null && solarLab.simulationType === 'THREE_D', 'Solar System 3D lab exists with THREE_D simulation type');
    assert(solarLab.activities.length >= 3, `Solar System lab has structured activities (${solarLab.activities.length} activities)`);
    assert(solarLab.quizzes.length >= 1 && solarLab.quizzes[0].questions.length >= 3, 'Solar System lab has quiz and evaluation questions');

    const ratioLab = await prisma.laboratory.findUnique({
      where: { slug: 'lab-rasio-matematika' },
      include: { activities: true, quizzes: { include: { questions: true } } },
    });
    assert(ratioLab !== null && ratioLab.simulationType === 'TWO_D', 'Math Ratio lab exists with TWO_D simulation type');

    const netLab = await prisma.laboratory.findUnique({
      where: { slug: 'lab-jaringan-topologi' },
      include: { activities: true, quizzes: { include: { questions: true } } },
    });
    assert(netLab !== null, 'Network Topology lab exists');

    const subnetLab = await prisma.laboratory.findUnique({
      where: { slug: 'lab-ip-subnetting' },
      include: { activities: true, quizzes: { include: { questions: true } } },
    });
    assert(subnetLab !== null, 'Subnetting IPv4 lab exists');

    // 7. Test Progress and Audit Logs
    const progressCount = await prisma.learningProgress.count();
    assert(progressCount >= 1, `Learning progress persistence verified (${progressCount} records)`);

    const auditCount = await prisma.auditLog.count();
    assert(auditCount >= 1, `Audit logging verified (${auditCount} logs)`);

    console.log(`\n=== TEST RESULTS: ${passedCount}/${totalTests} PASSED ===`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
