import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing student enrollment statuses with payments...');
  
  // Find all students
  const students = await prisma.student.findMany({
    include: {
      payments: {
        where: { paymentStatus: 'PAID' },
      },
    },
  });

  for (const student of students) {
    const hasTuition = student.payments.some(p => p.paymentType === 'TUITION_DOWN_PAYMENT');
    const hasRegistration = student.payments.some(p => p.paymentType === 'REGISTRATION_FEE');

    let newStatus = null;
    if (hasTuition) {
      newStatus = 'ENROLLED';
    } else if (hasRegistration) {
      newStatus = 'APPROVED';
    }

    if (newStatus && student.enrollmentStatus !== newStatus) {
      console.log(`Updating student ${student.firstName} ${student.lastName} to ${newStatus}`);
      await prisma.student.update({
        where: { id: student.id },
        data: { enrollmentStatus: newStatus },
      });
    }
  }

  console.log('✅ Status sync complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
