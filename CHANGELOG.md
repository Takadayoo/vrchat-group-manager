# Changelog

このプロジェクトのすべての注目すべき変更は、このファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいています。
このプロジェクトは [セマンティックバージョニング](https://semver.org/lang/ja/) に準拠しています。

## [Unreleased]

## [0.2.3] - 2026-02-03

### Added

- アプリの自動アップデート機能（tauri-plugin-updater）
- GitHub Actions による基本CIパイプライン（Frontend Check / Rust Check）
- 貢献者ガイドライン（CONTRIBUTING.md）
- Issue テンプレート（機能要望、バグ報告、ドキュメント、ディスカッション）
- PR テンプレート
- Git Flow ブランチ戦略（main / develop / feature/\*）
- README.md に貢献方法セクションを追加

### Fixed

- アイコンを RGBA 形式に変換（CI 環境でのビルドエラー修正）
- ESLint エラー・警告の修正（use-mobile.ts, GroupsPage.tsx）

### Changed

- ESLint 設定で shadcn/ui コンポーネントの警告を除外
- .gitignore に .claude/ と .vscode/ を追加

## [0.2.2] - 2026-02-03

### Changed

- アップデート機能のテストリリース

## [0.2.1] - 2026-02-03

### Changed

- アップデート機能のテストリリース

## [0.2.0] - 2026-02-02

### Added

- VRChat API トークンによるログイン機能
- 所属グループの一覧表示
- グループメンバーの可視状態を一括変更（公開 / フレンドのみ / 非公開）
- Windows 資格情報マネージャーによるトークンの安全な保存
- NSIS インストーラー（アンインストール時のデータ削除オプション付き）

[Unreleased]: https://github.com/Takadayoo/vrchat-group-manager/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/Takadayoo/vrchat-group-manager/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/Takadayoo/vrchat-group-manager/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/Takadayoo/vrchat-group-manager/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Takadayoo/vrchat-group-manager/releases/tag/v0.2.0
