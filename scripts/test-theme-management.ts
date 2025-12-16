/**
 * 测试类目管理功能
 * 运行: npx ts-node scripts/test-theme-management.ts
 */

import { supabase } from '../lib/supabase';

async function testThemeManagement() {
  console.log('🧪 开始测试类目管理功能...\n');

  try {
    // 1. 测试获取所有类目
    console.log('1️⃣  测试获取所有类目...');
    const { data: themes, error: fetchError } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) throw fetchError;
    console.log(`✅ 成功获取 ${themes?.length || 0} 个类目`);
    console.log('现有类目:', themes?.map(t => t.name).join(', '));

    // 2. 测试创建新类目
    console.log('\n2️⃣  测试创建新类目...');
    const testThemeName = `Test-Theme-${Date.now()}`;
    const { data: newTheme, error: createError } = await supabase
      .from('themes')
      .insert([
        {
          name: testThemeName,
          description: '这是一个测试类目',
          color: '#ff6b6b',
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    console.log(`✅ 成功创建类目: ${newTheme.name}`);

    // 3. 测试更新类目
    console.log('\n3️⃣  测试更新类目...');
    const { data: updatedTheme, error: updateError } = await supabase
      .from('themes')
      .update({
        description: '更新后的描述',
        color: '#4ecdc4',
      })
      .eq('id', newTheme.id)
      .select()
      .single();

    if (updateError) throw updateError;
    console.log(`✅ 成功更新类目: ${updatedTheme.name}`);
    console.log(`   新颜色: ${updatedTheme.color}`);

    // 4. 测试删除类目
    console.log('\n4️⃣  测试删除类目...');
    const { error: deleteError } = await supabase
      .from('themes')
      .delete()
      .eq('id', newTheme.id);

    if (deleteError) throw deleteError;
    console.log(`✅ 成功删除类目: ${testThemeName}`);

    // 5. 验证删除
    console.log('\n5️⃣  验证删除...');
    const { data: remainingThemes, error: verifyError } = await supabase
      .from('themes')
      .select('*')
      .eq('name', testThemeName);

    if (verifyError) throw verifyError;
    if (remainingThemes?.length === 0) {
      console.log('✅ 验证成功: 类目已被删除');
    } else {
      throw new Error('验证失败: 类目仍然存在');
    }

    console.log('\n✨ 所有测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testThemeManagement();

