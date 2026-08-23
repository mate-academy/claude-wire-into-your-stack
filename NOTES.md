1. Go to chose Filesystem as map server to ./docs with cclaude mcp add --scope project filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/olcay.sevim/AIBasedConformityAssessment/GH git play ground/claude-wire-into-your-stack/docs 

Asked for approval
olcay.sevim@CyberWhizOlcaySevim claude-wire-into-your-stack % claude mcp list
filesystem: npx -y @modelcontextprotocol/server-filesystem /Users/olcay.sevim/AIBasedConformityAssessment/GH git play ground/claude-wire-into-your-stack/docs - ⏸ Pending approval (run `claude` to
approve)

{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/olcay.sevim/AIBasedConformityAssessment/GH",
        "git",
        "play",
        "ground/claude-wire-into-your-stack/docs"
        "Read-only"
      ],
Manual olarak read-only izni verdim.
2. Yazılan dosyalarda tab yerine iki boşluk karakter girilmesini otomatikleştirmek için tab-remover skill oluşturuldu.
3.İmla kontrolü için custom komut eklendi. Her istendiğinde verilen dil ile imla kontrolü yapacak.

/imla-kontrol                 Istenen $ARGUMENTS dilinde noktalama işaretlerini düzelt. Her cümle başlangıcını büyük harf yap (project)

4.Hook için veritabanına direkt yazmanın engellenmesi istendi.
Created a live PreToolUse hook that enforces the CLAUDE.md rule "all data access goes through db/store.js":

- .claude/hooks/no-direct-db-write.sh — the guard script, two checks:
  - Bash matcher: blocks commands that hit a DB client or file directly (sqlite3, psql, mysql, mongosh, redis-cli, raw INSERT/UPDATE/DELETE, or shell redirects into *.db/*.sqlite).
  - Write|Edit matcher: blocks edits to routes/*.js that add their own module-level state (let/var x = []/{}/new Map()/new Set()) or write to disk directly (fs.writeFileSync/appendFileSync/etc.), instead of going through db/store.js.
- .claude/settings.json — wires both matchers to the script, committed to the repo (per your .gitignore note that project-scoped settings are shared with the team; settings.local.json stays personal).

Verified live: a real sqlite3 ... INSERT INTO Bash call was blocked, adding let cache = []; to routes/users.js via Edit was blocked, and a harmless comment-only edit to the same file went through untouched — then reverted.

5. Filesytem read-only yaptım. Böylece headless komutta yazma istersem ne olacağını görmüş oldum. 
claude -p "random karakterler ile proje içerisine test.md adında her biri maksimum beş kelimelik 10 cümle oluştur" --allowedTools write
ayı oluşturmak için izin gerekiyor — onaylarsan `test.md` dosyasını rastgele karakterlerden oluşan, her biri en fazla beş kelimelik 10 cümleyle oluşturacağım.

