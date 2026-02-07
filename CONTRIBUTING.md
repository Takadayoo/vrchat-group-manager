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

## その他のガイドライン

詳細な貢献ガイドは Issue #9 で整備予定です。

- 開発環境セットアップ
- コーディング規約
- テスト方法
- リリースフロー

---

## 質問・サポート

不明点があれば、以下で質問してください：

- GitHub Issues
- GitHub Discussions（準備中）
