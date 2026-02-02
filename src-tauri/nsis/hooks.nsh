; Tauri NSIS Hooks
; アンインストール後に実行されるフック

!macro NSIS_HOOK_POSTUNINSTALL
  ; ユーザーに確認ダイアログを表示
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "アプリデータと保存されたログイン情報も削除しますか?$\n$\n※「いいえ」を選択すると、再インストール時にログイン情報が復元されます。" \
    IDNO skipDataDelete
  
  ; 「はい」が選択された場合の処理
  DetailPrint "アプリデータを削除中..."
  
  ; ローカルアプリデータフォルダを削除
  RmDir /r "$LOCALAPPDATA\com.takadayoo.vrchat-group-manager"
  
  ; Windows資格情報マネージャーからトークンを削除
  DetailPrint "保存されたログイン情報を削除中..."
  nsExec::ExecToLog 'cmdkey /delete:api_token.VRChatGroupManager'
  
  DetailPrint "削除が完了しました"
  Goto endDataDelete
  
  skipDataDelete:
    DetailPrint "アプリデータは保持されます"
  
  endDataDelete:
!macroend