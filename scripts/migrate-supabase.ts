import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// 載入環境變數
config()

async function migrateWithSupabase() {
    try {
        console.log('🔗 使用 Supabase SDK 執行遷移...');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        // 使用 service role key 來執行管理操作
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        console.log('📝 開始建立 User 表格...');
        
        // 建立 users 表格的 SQL
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email_verified BOOLEAN DEFAULT false,
                email_verify_token TEXT,
                reset_token TEXT,
                reset_token_expires TIMESTAMPTZ,
                role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now(),
                last_login TIMESTAMPTZ,
                login_count INTEGER DEFAULT 0
            );
        `;
        
        const { error: usersError } = await supabase.rpc('exec_sql', { 
            sql: createUsersTable 
        });
        
        if (usersError) {
            console.log('嘗試直接執行 SQL...');
            // 如果 rpc 不可用，嘗試其他方法
            console.log('SQL 指令:');
            console.log(createUsersTable);
            console.log('\n請手動在 Supabase SQL Editor 中執行上述 SQL');
            return;
        }
        
        console.log('✅ Users 表格建立成功！');
        
        // 測試表格是否建立成功
        const { data, error } = await supabase
            .from('users')
            .select('count(*)')
            .single();
            
        if (error) {
            console.error('❌ 表格驗證失敗:', error);
        } else {
            console.log('✅ Users 表格驗證成功！');
        }
        
        console.log('\n🎉 遷移完成！');
        
    } catch (error) {
        console.error('❌ 遷移失敗:', error);
        console.log('\n💡 請手動在 Supabase SQL Editor 中執行 SQL 指令');
    }
}

// 執行遷移
migrateWithSupabase();