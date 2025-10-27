import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// 載入環境變數
config()

async function testSupabaseSDK() {
    try {
        console.log('🔗 測試 Supabase SDK 連接...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ 缺少 Supabase 環境變數');
            console.log('需要設定：');
            console.log('- NEXT_PUBLIC_SUPABASE_URL');
            console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
            return;
        }
        
        console.log('📍 Supabase URL:', supabaseUrl);
        console.log('🔑 使用 Anon Key:', supabaseKey.substring(0, 20) + '...');
        
        // 創建 Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 測試基本連接
        const { data, error } = await supabase
            .from('_prisma_migrations')
            .select('*')
            .limit(1);
            
        if (error && error.code === 'PGRST116') {
            console.log('🔍 資料表 _prisma_migrations 不存在（這是正常的，還沒執行遷移）');
            console.log('✅ Supabase SDK 連接成功！');
        } else if (error) {
            console.error('❌ Supabase SDK 連接錯誤:', error);
        } else {
            console.log('✅ Supabase SDK 連接成功！');
            console.log('📊 找到遷移記錄:', data?.length || 0, '筆');
        }
        
        // 測試健康檢查
        const { data: healthCheck } = await supabase.rpc('version');
        console.log('🏥 資料庫健康檢查:', healthCheck ? '正常' : '無法確認');
        
        console.log('\n🎉 Supabase SDK 測試完成！');
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                console.log('💡 可能的問題：');
                console.log('   - 網路連接問題');
                console.log('   - Supabase 專案未啟動');
                console.log('   - URL 或 API Key 錯誤');
            }
        }
    }
}

// 執行測試
testSupabaseSDK();