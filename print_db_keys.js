import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
console.log(Object.keys(db).filter(k => k.toLowerCase().includes('lpg')));
process.exit(0);
