import { PrismaClient } from '../prisma-generated/postgres-client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔗 測試 Supabase 連接...');
        
        // 測試基本連接
        await prisma.$connect();
        console.log('✅ Supabase 資料庫連接成功！');
        
        // 測試查詢
        const result = await prisma.$queryRaw`SELECT version();`;
        console.log('📊 PostgreSQL 版本:', result);
        
        // 檢查是否有表格
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        console.log('🗂️ 現有表格:', tables);
        
        console.log('\n🎉 Supabase 連接測試完成！');
        
    } catch (error) {
        console.error('❌ Supabase 連接失敗:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('authentication failed')) {
                console.log('💡 建議檢查：資料庫密碼是否正確');
            } else if (error.message.includes('timeout')) {
                console.log('💡 建議檢查：網路連接或防火牆設定');
            } else if (error.message.includes('does not exist')) {
                console.log('💡 建議檢查：專案 URL 或資料庫名稱');
            }
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// 執行測試
testConnection()
    .catch((e) => {
        console.error('測試過程發生錯誤:', e);
        process.exit(1);
    });