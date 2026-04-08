import { prisma } from './prisma';

async function main() {
  // 1. إنشاء مستخدم
  const user = await prisma.user.create({
    data: {
      name: 'Ahmed Yassin',
      email: 'ahmed@example.com',
      phone: '01012345678',
    },
  });

  // 2. إنشاء موديل لبدلة
  const suitModel = await prisma.suitModel.create({
    data: {
      name: 'Tuxedo Black Slim',
      description: 'Elegant black tuxedo for weddings.',
      basePrice: 500, // السعر لليوم
    },
  });

  // 3. إنشاء بدلة فعلية (SKU) تابعة للموديل
  const suitItem = await prisma.suitItem.create({
    data: {
      sku: 'TUX-BLK-SLM-L',
      size: 'L',
      status: 'AVAILABLE',
      suitModelId: suitModel.id,
    },
  });

  console.log('Seed Data Successfully Created!');
  console.log('-----------------------------------');
  console.log(`User ID for Testing: ${user.id}`);
  console.log(`Suit Item ID for Testing: ${suitItem.id}`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
