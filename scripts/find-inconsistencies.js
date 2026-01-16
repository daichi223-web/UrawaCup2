#!/usr/bin/env node
/**
 * 不整合検出スクリプト
 * 
 * 実行方法:
 *   node scripts/find-inconsistencies.js
 * 
 * 検出する問題:
 *   1. ハードコードされたENUM値
 *   2. 重複した定義
 *   3. schema.sqlとコードの不一致
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const SCHEMA_FILE = path.join(__dirname, '../../supabase/schema.sql');

// 検出パターン
const PATTERNS = {
    // ハードコードされた文字列リテラル（ENUMの可能性が高い）
    hardcodedEnums: [
        { pattern: /status:\s*['"](\w+)['"]/g, name: 'status値' },
        { pattern: /team_type:\s*['"](\w+)['"]/g, name: 'team_type値' },
        { pattern: /role:\s*['"](\w+)['"]/g, name: 'role値' },
        { pattern: /stage:\s*['"](\w+)['"]/g, name: 'stage値' },
        { pattern: /approval_status:\s*['"](\w+)['"]/g, name: 'approval_status値' },
    ],

    // 配列で定義された定数（重複定義の可能性）
    arrayConstants: /(?:const|let)\s+(\w+(?:TYPES?|STATUS(?:ES)?|ROLES?|STAGES?))\s*(?::\s*\w+(?:\[\])?)?\s*=\s*\[([^\]]+)\]/gi,

    // as any の使用（型の問題を隠蔽）
    asAny: /as\s+any/g,
};

// schema.sql からENUM定義を抽出
function extractEnumsFromSchema(schemaContent) {
    const enums = {};
    const enumRegex = /CREATE\s+TYPE\s+(\w+)\s+AS\s+ENUM\s*\(([^)]+)\)/gi;

    let match;
    while ((match = enumRegex.exec(schemaContent)) !== null) {
        const enumName = match[1];
        const values = match[2]
            .split(',')
            .map(v => v.trim().replace(/['"]/g, ''));
        enums[enumName] = values;
    }

    return enums;
}

// ファイルを再帰的に検索
function findFiles(dir, extensions) {
    const results = [];

    function walk(currentDir) {
        const files = fs.readdirSync(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!file.startsWith('.') && file !== 'node_modules') {
                    walk(filePath);
                }
            } else if (extensions.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        }
    }

    walk(dir);
    return results;
}

// メイン処理
function main() {
    console.log('🔍 不整合検出スクリプト\n');

    const issues = [];

    // 1. schema.sql のENUM定義を取得
    let schemaEnums = {};
    if (fs.existsSync(SCHEMA_FILE)) {
        const schemaContent = fs.readFileSync(SCHEMA_FILE, 'utf-8');
        schemaEnums = extractEnumsFromSchema(schemaContent);
        console.log('📋 schema.sql のENUM定義:');
        for (const [name, values] of Object.entries(schemaEnums)) {
            console.log(`   ${name}: [${values.join(', ')}]`);
        }
        console.log('');
    } else {
        console.log('⚠️  schema.sql が見つかりません\n');
    }

    // 2. TypeScript/TSX ファイルを検索
    const files = findFiles(SRC_DIR, ['.ts', '.tsx']);
    console.log(`📁 検査対象: ${files.length} ファイル\n`);

    // 3. 各ファイルをチェック
    const constantDefinitions = new Map(); // 定数名 → 定義場所のリスト

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);
        const lines = content.split('\n');

        // 3a. ハードコードされたENUM値を検出
        for (const { pattern, name } of PATTERNS.hardcodedEnums) {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
                const lineNum = content.substring(0, match.index).split('\n').length;
                const value = match[1];

                // schema.sql の定義と照合
                let warning = '';
                for (const [enumName, enumValues] of Object.entries(schemaEnums)) {
                    if (name.includes(enumName.replace('_', ''))) {
                        if (!enumValues.includes(value)) {
                            warning = ` ⚠️  "${value}" は ${enumName} に存在しない可能性`;
                        }
                    }
                }

                issues.push({
                    type: 'hardcoded',
                    file: relativePath,
                    line: lineNum,
                    message: `ハードコードされた${name}: "${value}"${warning}`,
                });
            }
        }

        // 3b. 配列定数の重複定義を検出
        let match;
        PATTERNS.arrayConstants.lastIndex = 0;
        while ((match = PATTERNS.arrayConstants.exec(content)) !== null) {
            const constName = match[1];
            const lineNum = content.substring(0, match.index).split('\n').length;

            if (!constantDefinitions.has(constName)) {
                constantDefinitions.set(constName, []);
            }
            constantDefinitions.get(constName).push({
                file: relativePath,
                line: lineNum,
                values: match[2],
            });
        }

        // 3c. as any の使用を検出
        PATTERNS.asAny.lastIndex = 0;
        while ((match = PATTERNS.asAny.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'asAny',
                file: relativePath,
                line: lineNum,
                message: '`as any` の使用（型の問題を隠蔽している可能性）',
            });
        }
    }

    // 4. 重複定義をチェック
    for (const [constName, definitions] of constantDefinitions) {
        if (definitions.length > 1) {
            issues.push({
                type: 'duplicate',
                file: definitions.map(d => d.file).join(', '),
                line: '-',
                message: `"${constName}" が複数箇所で定義されています:\n` +
                    definitions.map(d => `      - ${d.file}:${d.line}`).join('\n'),
            });
        }
    }

    // 5. 結果を表示
    console.log('='.repeat(60));
    console.log('検出結果');
    console.log('='.repeat(60));

    if (issues.length === 0) {
        console.log('\n✅ 問題は検出されませんでした\n');
        return;
    }

    // タイプ別に集計
    const byType = {
        hardcoded: issues.filter(i => i.type === 'hardcoded'),
        duplicate: issues.filter(i => i.type === 'duplicate'),
        asAny: issues.filter(i => i.type === 'asAny'),
    };

    console.log(`\n🔴 ハードコードされた値: ${byType.hardcoded.length} 件`);
    for (const issue of byType.hardcoded.slice(0, 10)) {
        console.log(`   ${issue.file}:${issue.line} - ${issue.message}`);
    }
    if (byType.hardcoded.length > 10) {
        console.log(`   ... 他 ${byType.hardcoded.length - 10} 件`);
    }

    console.log(`\n🟠 重複定義: ${byType.duplicate.length} 件`);
    for (const issue of byType.duplicate) {
        console.log(`   ${issue.message}`);
    }

    console.log(`\n🟡 as any の使用: ${byType.asAny.length} 件`);
    for (const issue of byType.asAny.slice(0, 5)) {
        console.log(`   ${issue.file}:${issue.line}`);
    }
    if (byType.asAny.length > 5) {
        console.log(`   ... 他 ${byType.asAny.length - 5} 件`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`合計: ${issues.length} 件の潜在的な問題`);
    console.log('='.repeat(60));

    // 推奨アクション
    console.log('\n📌 推奨アクション:');
    console.log('   1. npm run db:types で型を自動生成');
    console.log('   2. ハードコードされた値を型定義からインポート');
    console.log('   3. 重複定義を統一して1箇所に集約');
    console.log('   4. as any を適切な型に置き換え');
}

main();
