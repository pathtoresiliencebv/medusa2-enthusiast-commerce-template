#!/bin/sh
set -eu

replace_placeholder() {
  placeholder="$1"
  value="$2"

  [ "$placeholder" = "$value" ] && return 0

  escaped_value=$(printf '%s' "$value" | sed 's/[\\&|]/\\&/g')
  grep -rl --binary-files=without-match --fixed-strings "$placeholder" /app/.next /app/public 2>/dev/null |
    while IFS= read -r file; do
      sed -i "s|$placeholder|$escaped_value|g" "$file"
    done
}

replace_placeholder "https://backend.invalid" "${NEXT_PUBLIC_MEDUSA_BACKEND_URL:-https://backend.invalid}"
replace_placeholder "pk_template_runtime" "${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-pk_template_runtime}"
replace_placeholder "https://storefront.invalid" "${NEXT_PUBLIC_BASE_URL:-https://storefront.invalid}"

exec "$@"
