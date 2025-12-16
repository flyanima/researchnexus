/**
 * Supabase 连接测试脚本
 * 
 * 运行此脚本以验证 Supabase 配置是否正确
 * 
 * 使用方法：
 * npx tsx scripts/test-supabase-connection.ts
 */

import { supabase } from '../lib/supabase';

async function testConnection() {
  console.log('🔍 测试 Supabase 连接...\n');

  try {
    // 测试 1: 检查环境变量
    console.log('✓ 步骤 1: 检查环境变量');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('环境变量未配置！请检查 .env.local 文件');
    }
    console.log(`  - Supabase URL: ${supabaseUrl}`);
    console.log(`  - Anon Key: ${supabaseKey.substring(0, 20)}...`);
    console.log('');

    // 测试 2: 查询 projects 表
    console.log('✓ 步骤 2: 查询 projects 表');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);

    if (projectsError) {
      throw new Error(`查询 projects 失败: ${projectsError.message}`);
    }

    console.log(`  - 找到 ${projects?.length || 0} 个项目`);
    if (projects && projects.length > 0) {
      projects.forEach((p: any) => {
        console.log(`    • ${p.name} (${p.theme})`);
      });
    }
    console.log('');

    // 测试 3: 查询 artifacts 表
    console.log('✓ 步骤 3: 查询 artifacts 表');
    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('*')
      .limit(5);

    if (artifactsError) {
      throw new Error(`查询 artifacts 失败: ${artifactsError.message}`);
    }

    console.log(`  - 找到 ${artifacts?.length || 0} 个 artifacts`);
    if (artifacts && artifacts.length > 0) {
      artifacts.forEach((a: any) => {
        console.log(`    • ${a.title} (${a.type})`);
      });
    }
    console.log('');

    // 测试 4: 检查 Storage bucket
    console.log('✓ 步骤 4: 检查 Storage bucket');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw new Error(`查询 Storage buckets 失败: ${bucketsError.message}`);
    }

    const researchBucket = buckets?.find(b => b.name === 'research-files');
    if (!researchBucket) {
      throw new Error('未找到 research-files bucket');
    }

    console.log(`  - Bucket: ${researchBucket.name}`);
    console.log(`  - Public: ${researchBucket.public ? '是' : '否'}`);
    console.log('');

    // 测试 5: 测试插入和删除（可选）
    console.log('✓ 步骤 5: 测试写入权限');
    const testProject = {
      name: 'Test Project',
      theme: 'Test',
      description: 'This is a test project'
    };

    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();

    if (insertError) {
      throw new Error(`插入测试项目失败: ${insertError.message}`);
    }

    console.log(`  - 成功创建测试项目: ${newProject.id}`);

    // 删除测试项目
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', newProject.id);

    if (deleteError) {
      throw new Error(`删除测试项目失败: ${deleteError.message}`);
    }

    console.log(`  - 成功删除测试项目`);
    console.log('');

    // 全部测试通过
    console.log('🎉 所有测试通过！Supabase 配置正确。\n');
    console.log('✅ 您可以运行 npm run dev 启动应用了！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('\n请检查：');
    console.error('1. .env.local 文件是否存在且配置正确');
    console.error('2. Supabase 项目是否处于 ACTIVE 状态');
    console.error('3. 数据库表是否已创建');
    console.error('4. RLS 策略是否已配置');
    console.error('\n详细信息请参考 DEPLOYMENT_SUMMARY.md');
    process.exit(1);
  }
}

// 运行测试
testConnection();

