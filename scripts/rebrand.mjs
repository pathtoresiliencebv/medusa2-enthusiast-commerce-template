import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]])
    return pairs
  }, [])
)

for (const required of ["name", "domain", "email", "slug"]) {
  if (!args[required]) {
    console.error(`Missing --${required}`)
    process.exit(1)
  }
}

const root = fileURLToPath(new URL("..", import.meta.url))
const ignored = new Set([".git", "node_modules", ".next", ".medusa", "services"])
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".html"])
const replacements = [
  [/X-LVRO-/g, `X-${args.slug.toUpperCase()}-`],
  [/lvro:support:/g, `${args.slug}:support:`],
  [/service@lvro\.nl/g, args.email],
  [/lvro\.nl/g, args.domain],
  [/LVRO\.nl/g, args.name],
  [/LVRO/g, args.name],
]

function extension(file) {
  const index = file.lastIndexOf(".")
  return index >= 0 ? file.slice(index) : ""
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry) || entry === "rebrand.mjs") continue
    const absolute = join(directory, entry)
    const stat = statSync(absolute)
    if (stat.isDirectory()) {
      walk(absolute)
      continue
    }
    if (!extensions.has(extension(entry))) continue
    let content = readFileSync(absolute, "utf8")
    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement)
    }
    writeFileSync(absolute, content)
  }
}

walk(join(root, "apps"))
console.log(`Rebranded storefront to ${args.name} (${args.domain}). Internal IDs remain stable.`)
