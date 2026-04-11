import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

async function main() {
  const existing = await prisma.systemUser.findUnique({ where: { name: 'admin' } });
  if (existing) {
    console.log('Admin already exists');
    return;
  }
  const password = await bcrypt.hash('admin123', 10);
  await prisma.systemUser.create({
    data: { name: 'admin', email: 'admin@luxesuits.com', phone: '01000000000', password, role: 'ADMIN' }
  });
  console.log('Admin created — name: admin, password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
