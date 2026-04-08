import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import path from 'path';

async function checkDb(dbPath: string) {
    console.log(`\nChecking DB at: ${dbPath}`);
    const adapter = new PrismaLibSql({
        url: `file:${dbPath}`,
    });
    const prisma = new PrismaClient({ adapter });
    try {
        const depts = await prisma.department.findMany({ take: 5 });
        const logs = await prisma.auditLog.findMany({ take: 5 });
        console.log(`Depts: ${depts.length}, Logs: ${logs.length}`);
        if (depts.length > 0) console.log('Sample Dept:', depts[0].name);
        if (logs.length > 0) console.log('Sample Log:', logs[0].action);
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    await checkDb(path.resolve('dev.db'));
    await checkDb(path.resolve('backend/dev.db'));
}

main();
