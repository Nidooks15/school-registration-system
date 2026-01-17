import { PrismaClient } from '@prisma/client';
import { generateReceipt } from '../utils/pdf.js';

const prisma = new PrismaClient();

async function main() {
  console.log('📄 Regenerating missing receipts...');
  
  const payments = await prisma.payment.findMany({
    where: {
      paymentStatus: 'PAID',
      receiptUrl: null,
    },
    include: {
      student: true,
    },
  });

  console.log(`Found ${payments.length} payments missing receipts.`);

  for (const payment of payments) {
    try {
      console.log(`Generating receipt for payment ${payment.id}...`);
      const receiptUrl = await generateReceipt(payment, payment.student);
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: { receiptUrl },
      });
      
      console.log(`✅ Success: ${receiptUrl}`);
    } catch (error) {
      console.error(`❌ Failed for ${payment.id}:`, error.message);
    }
  }

  console.log('🏁 Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
