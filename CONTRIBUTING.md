# 貢献ガイド

VRChat Group Manager への貢献に興味を持っていただきありがとうございます。

## ブランチ戦略

このプロジェクトでは Git Flow ベースのブランチ戦略を採用しています。

### ブランチの種類

#### `main` ブランチ

- 本番リリース版
- 常に安定した状態を維持
- 直接プッシュ禁止
- PR経由でのみマージ可能

#### `develop` ブランチ

- 開発統合ブランチ
- 次のリリースに向けた機能を統合
- 直接プッシュ禁止
- PR経由でのみマージ可能

#### `feature/*` ブランチ

- 個別の機能開発・修正用
- `develop` から分岐
- 命名規則：`feature/issue-{番号}-{簡潔な説明}`
- 例：`feature/issue-1-banner-setting`

---

## 開発フロー

### 1. Issue確認

- GitHub Issues から作業するIssueを選択
- 不明点があれば Issue でコメント

### 2. フィーチャーブランチ作成

```bash
git checkout develop
git pull origin develop
git checkout -b feature/issue-X-description
```

### 3. 開発作業

- コードを編集
- こまめにコミット

### 4. プッシュ＆PR作成

```bash
git add .
git commit -m "feat: 簡潔な変更内容 (#X)"
git push -u origin feature/issue-X-description
```

- GitHub上でPR作成
- Base: `develop`
- PRテンプレートに従って記入

### 5. レビュー＆マージ

- レビューを待つ（1人開発時は自己レビュー）
- 問題なければマージ

### 6. ブランチ削除

```bash
git checkout develop
git pull
git branch -d feature/issue-X-description
```

---

## コミットメッセージ

### 形式

```
<type>: <subject> (#issue番号)
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `chore`: 雑務（ビルド設定など）
- `refactor`: リファクタリング
- `test`: テスト追加・修正

### 例

```
feat: グループバナー設定機能を追加 (#1)
fix: ログイン時のエラーを修正 (#5)
docs: READMEにインストール手順を追加
```

---

## 開発環境セットアップ

### 必要な環境

- **Node.js**: v18以上
- **Rust**: 最新安定版
- **Git**: 最新版

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/Takadayoo/vrchat-group-manager.git
cd vrchat-group-manager

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run tauri:dev
```

### ビルド

```bash
# 本番ビルド
npm run tauri:build
```

---

## 外部貢献者向け：フォークからの貢献手順

外部の方が貢献する場合の手順です。

### 1. リポジトリをフォーク

GitHubのWebページで「Fork」ボタンをクリック

### 2. フォークをクローン

```bash
git clone https://github.com/YOUR_USERNAME/vrchat-group-manager.git
cd vrchat-group-manager
```

### 3. 元リポジトリをリモートに追加

```bash
git remote add upstream https://github.com/Takadayoo/vrchat-group-manager.git
```

### 4. 最新の状態に更新

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

### 5. フィーチャーブランチ作成

```bash
git checkout -b feature/issue-X-description
```

### 6. 開発＆コミット

通常の開発フローに従って作業

### 7. フォークにプッシュ

```bash
git push -u origin feature/issue-X-description
```

### 8. プルリクエスト作成

- GitHub上で元リポジトリに対してPR作成
- Base: Takadayoo/vrchat-group-manager:develop
- Compare: YOUR_USERNAME/vrchat-group-manager:feature/issue-X-description

---

## コーディング規約

### TypeScript/React

- **フォーマッター**: Prettier
- **リンター**: ESLint

- 命名規則:
  - コンポーネント: PascalCase（例：GroupList.tsx）
  - 関数・変数: camelCase（例：fetchGroups）
  - 定数: UPPER_SNAKE_CASE（例：API_BASE_URL）
- コンポーネント設計:
  - 1ファイル1コンポーネント
  - Propsの型定義を必須化
  - 副作用はuseEffectで管理

### Rust

- **フォーマッター**: rustfmt
- **リンター**: clippy

- 命名規則: Rustの標準規約に準拠
- エラーハンドリング: Result<T, E> を使用

### コード品質

コミット前に以下を実行：

```bash
npm run lint
```

---

## テスト

### テスト実行

```bash
# 全テスト実行
npm test
```

```bash
# 特定のテスト実行
npm test -- <test-file>
```

テスト作成
新機能には必ずテストを追加
テストファイルは _.test.ts または _.test.tsx

---

## リリースフロー

### バージョニング

セマンティックバージョニング（vX.Y.Z）を採用：

- **X（メジャー）**: 破壊的変更、大規模改修（0はベータ版）
- **Y（マイナー）**: 機能追加・向上
- **Z（パッチ）**: バグ修正・誤字脱字

### リリース手順

1. develop で開発・テスト
2. リリース準備ができたら develop → main へPR
3. バージョン番号を更新（package.json, Cargo.toml）
4. CHANGELOG.md を更新
5. マージ後、GitHubでリリースタグ作成

---

## 質問・サポート

不明点があれば、以下で質問してください：

- GitHub Issues
- GitHub Discussions（準備中）

---
