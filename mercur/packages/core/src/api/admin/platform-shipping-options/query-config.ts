export const platformShippingOptionFields = [
  "id",
  "name",
  "description",
  "courier_label",
  "currency_code",
  "amount",
  "country_codes",
  "is_active",
  "is_default",
  "metadata",
  "created_at",
  "updated_at",
]

export const platformShippingOptionQueryConfig = {
  list: {
    defaults: platformShippingOptionFields,
    isList: true,
  },
  retrieve: {
    defaults: platformShippingOptionFields,
    isList: false,
  },
}
