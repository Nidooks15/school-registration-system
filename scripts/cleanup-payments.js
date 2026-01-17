import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up PENDING payments...');
  
  const deleted = await prisma.payment.deleteMany({
    where: {
      paymentStatus: 'PENDING',
    },
  });

  console.log(`✅ Deleted ${deleted.count} ghost pending payments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
