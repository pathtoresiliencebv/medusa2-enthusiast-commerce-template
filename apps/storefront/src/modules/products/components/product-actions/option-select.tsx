import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  swatches?: Record<string, string>
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  swatches = {},
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="flex items-center justify-between text-xs font-black uppercase text-[#555555]">
        Kies {title === "Color" ? "kleur" : title === "Size" ? "maat" : title}
        {current && (
          <span className="normal-case text-[#15162a]">{current}</span>
        )}
      </span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "flex min-h-11 min-w-[88px] items-center justify-center gap-2 border border-[#c8c3dd] bg-white px-4 text-small-regular font-bold",
                {
                  "border-[#15162a] bg-[#15162a] text-white": v === current,
                  "transition-colors hover:border-[#15162a]": v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {swatches[v] && (
                <span
                  className="h-5 w-5 rounded-full border border-black/20"
                  style={{ backgroundColor: swatches[v] }}
                  aria-hidden="true"
                />
              )}
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
