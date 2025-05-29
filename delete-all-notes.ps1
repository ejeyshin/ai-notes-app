# delete-all-notes.ps1
$json = Get-Content -Raw -Path "all-notes.json" | ConvertFrom-Json
foreach ($item in $json.Items) {
  $userId = $item.userId.S
  $noteId = $item.noteId.S
  Write-Host "🧨 Deleting noteId: $noteId for user: $userId"
  aws dynamodb delete-item --table-name ai_notes --key "{\"userId\":{\"S\":\"$userId\"},\"noteId\":{\"S\":\"$noteId\"}}"
}
