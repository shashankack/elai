import { model } from "@medusajs/framework/utils"
import PlatformShippingOptIn from "./platform-shipping-opt-in"

const PlatformShippingOption = model
  .define("PlatformShippingOption", {
    id: model.id({ prefix: "psopt" }).primaryKey(),
    name: model.text().searchable(),
    description: model.text().nullable(),
    courier_label: model.text().nullable(),
    currency_code: model.text().default("inr"),
    amount: model.bigNumber(),
    country_codes: model.json().default({ countries: ["in"] }),
    is_active: model.boolean().default(true),
    is_default: model.boolean().default(false),
    metadata: model.json().nullable(),
    opt_ins: model.hasMany(() => PlatformShippingOptIn, {
      mappedBy: "platform_shipping_option",
    }),
  })
  .cascades({
    delete: ["opt_ins"],
  })

export default PlatformShippingOption
