# インシデントレポート: UrawaCup3 v2ブランチ上書き事故

## 発生日時
2026年1月16日

## 概要
UrawaCup2のリポジトリ再構成作業中に、誤ってUrawaCup3のv2ブランチを上書きし、本番環境のデプロイが一時的に機能しなくなった。

---

## 原因分析

### 直接的原因
1. **リポジトリの混同**: UrawaCup2とUrawaCup3が別々のリポジトリであることを十分に認識せずに操作した
2. **force push の実行**: `git push -f urawacup3 master:v2` により、UrawaCup3のv2ブランチの履歴を完全に上書きした

### 根本原因
1. **リポジトリ構成の複雑さ**:
   - UrawaCup (D:/UrawaCup) → github.com/daichi223-web/UrawaCup
   - UrawaCup2 (D:/UrawaCup2) → github.com/daichi223-web/UrawaCup2
   - UrawaCup3 → github.com/daichi223-web/UrawaCup3 (ローカルクローンなし)
   - 3つのリポジトリが存在し、それぞれ異なるコードベースを持っていた

2. **Vercel接続先の確認不足**:
   - Vercelが `UrawaCup3` に接続されていることを確認せずに、`UrawaCup2` のコードをプッシュしようとした
   - ユーザーからの情報（"urawa-cup3" プロジェクト名）を見落とした

3. **作業フローの問題**:
   - リポジトリ再構成という大きな変更を、十分な確認なしに実行した
   - 「v2ブランチがない」という状況を、「作成すればいい」と判断してしまった

### 時系列
1. ユーザーが「v2をメインにしたい」と要求
2. UrawaCup2内でv2ブランチを作成し、リポジトリを再構成
3. Vercelがデプロイされないため、原因を調査
4. UrawaCup3が別リポジトリであることが判明
5. **誤操作**: UrawaCup2のコードをUrawaCup3にforce push
6. UrawaCup3の元のv2コードが上書きされる
7. Vercelのデプロイが失敗（Root Directory問題）
8. frontendフォルダをルートに移動してpush
9. デプロイは成功するが、1グループ機能が欠落
10. 元のコミット(623d32f)をGitHub APIで発見し、復元

---

## 影響範囲

### 影響を受けたもの
- UrawaCup3リポジトリのv2ブランチ
- Vercel本番環境（一時的に古いコードがデプロイ）
- ユーザーの作業時間

### 影響を受けなかったもの
- UrawaCup3のmainブランチ（後で復元）
- Vercelの古いデプロイキャッシュ（これにより復旧可能だった）
- UrawaCup2のコード（元々のリポジトリは無傷）

---

## 復旧手順

1. GitHub APIで元のコミット(623d32f)が残存していることを確認
   ```bash
   curl -s "https://api.github.com/repos/daichi223-web/UrawaCup3/commits/623d32f"
   ```

2. コミットをフェッチして復元
   ```bash
   git fetch origin 623d32f173f4f274360ef9d59eb735a670b2eb70
   git branch -f v2 623d32f
   git push origin v2 --force
   ```

---

## 再発防止策

### 即時対応
1. **リポジトリ関係の文書化**: どのリポジトリがどこに接続されているか明確に記録する
2. **force pushの禁止**: 本番ブランチへのforce pushは原則禁止とする

### 中長期対応
1. **リポジトリの統合検討**: UrawaCup2とUrawaCup3を統合し、混乱を防ぐ
2. **ブランチ保護ルールの設定**: GitHubでv2/mainブランチに保護ルールを設定
3. **デプロイ前チェックリスト**:
   - [ ] どのリポジトリに変更を加えるか確認
   - [ ] どのVercelプロジェクトに影響するか確認
   - [ ] force pushが必要な場合、バックアップを取得

### 教訓
- **複数リポジトリがある場合は、必ず接続先を確認する**
- **force pushは最後の手段。実行前に必ずバックアップを確認**
- **Vercelのプロジェクト名とGitHubリポジトリ名が異なる場合は特に注意**

---

## 未完了タスク

以下の機能はUrawaCup2で開発されたが、UrawaCup3のv2にはまだマージされていない：

1. **組み合わせ確定機能（色変更）**
   - `is_confirmed` フラグ
   - 入れ替え後は元の色、確定後は会場色

2. **グループ色 E〜H 追加**
   - 8会場対応

3. **研修試合生成ロジック改善**
   - 連戦なし
   - 全チーム2試合保証
   - 削除機能

これらは手動でUrawaCup3にマージする必要がある。

---

## 関連コミット

### UrawaCup3 (復元済み)
- `623d32f` - Fix change detection and improve highlight styling (元のv2)

### UrawaCup2 (開発中の機能)
- `67a8ccc9` - Add group colors E-H to support up to 8 venues
- `1e27d12c` - 組み合わせ確定機能追加
- `da626a02` - 研修試合生成ロジック改善

---

## 記録者
Claude (自動生成)

## 承認
(要確認)
