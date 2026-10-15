# List users by name and email domain

**$ARGUMENTS** is two space-separated values: a name, then a domain (e.g. `Ana example.com`). Split it on the first space to get `NAME` and `DOMAIN`.

## Steps
1. Make sure the server is running (`npm run dev`), then fetch all users:
   ```
   curl -s http://localhost:3000/users
   ```
2. Filter the results with `jq`, matching `name` case-insensitively against `NAME` and `email` against `@DOMAIN`:
   ```
   curl -s http://localhost:3000/users | jq --arg name "NAME" --arg domain "DOMAIN" \
     '[.[] | select((.name | ascii_downcase | contains($name | ascii_downcase)) and (.email | endswith("@" + $domain)))]'
   ```
   (substitute the actual `NAME` and `DOMAIN` values parsed from `$ARGUMENTS` before running)
3. Print the matching users.
