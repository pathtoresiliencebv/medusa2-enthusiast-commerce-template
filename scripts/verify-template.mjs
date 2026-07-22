import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const required = [
  "apps/backend/Dockerfile",
  "apps/backend/railway.json",
  "apps/storefront/Dockerfile",
  "apps/storefront/railway.json",
  "services/enthusiast/server/Dockerfile",
  "services/enthusiast/server/railway.json",
  "services/enthusiast/frontend/Dockerfile",
  "services/enthusiast/frontend/railway.json",
]

const failures = []
for (const file of required) {
  if (!existsSync(join(root, file))) failures.push(`Missing ${file}`)
}

const ignoredDirectories = new Set([".git", "node_modules", ".next", ".medusa"])
const secretFileNames = new Set([".env", ".env.local", ".env.production"])
const secretPatterns = [
  /ghp_[A-Za-z0-9_]{20,}/,
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
  /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/,
]

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue
    const absolute = join(directory, entry)
    const stat = statSync(absolute)
    if (stat.isDirectory()) {
      walk(absolute)
      continue
    }
    const file = relative(root, absolute)
    if (secretFileNames.has(entry)) failures.push(`Secret env file committed: ${file}`)
    if (stat.size > 2_000_000) continue
    const content = readFileSync(absolute, "utf8")
    for (const pattern of secretPatterns) {
      if (pattern.test(content)) failures.push(`Possible secret in ${file}`)
    }
  }
}

walk(root)

if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}

console.log(`Template verification passed (${required.length} deployment files checked).`)
