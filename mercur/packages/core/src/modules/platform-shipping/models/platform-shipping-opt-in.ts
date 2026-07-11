import { model } from "@medusajs/framework/utils"
import PlatformShippingOption from "./platform-shipping-option"

const PlatformShippingOptIn = model
  .define("PlatformShippingOptIn", {
    id: model.id({ prefix: "psoptin" }).primaryKey(),
    seller_id: model.text().searchable(),
    stock_location_id: model.text().searchable(),
    shipping_option_id: model.text().nullable(),
    is_enabled: model.boolean().default(true),
    metadata: model.json().nullable(),
    platform_shipping_option: model.belongsTo(() => PlatformShippingOption, {
      mappedBy: "opt_ins",
    }),
  })
  .indexes([
    {
      name: "IDX_platform_shipping_opt_in_unique_location_option",
      on: ["stock_location_id", "platform_shipping_option_id"],
      unique: true,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_platform_shipping_opt_in_seller_id",
      on: ["seller_id"],
      where: "deleted_at IS NULL",
    },
  ])

export default PlatformShippingOptIn
