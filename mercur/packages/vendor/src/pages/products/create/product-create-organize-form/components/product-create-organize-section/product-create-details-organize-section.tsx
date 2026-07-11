import { useState } from "react";

import { Heading } from "@medusajs/ui";
import { useTranslation } from "react-i18next";

import { Form } from "@components/common/form";
import { SwitchBox } from "@components/common/switch-box";
import { Combobox } from "@components/inputs/combobox";
import { useComboboxData } from "@hooks/use-combobox-data";
import { sdk, fetchQuery } from "@lib/client";
import { useTabbedForm } from "@components/tabbed-form";
import { ProductCreateSchemaType } from "../../../types";
import { CategoryCombobox } from "@pages/products/common/components/category-combobox";

export const ProductCreateOrganizationSection = () => {
  const { t } = useTranslation();
  const form = useTabbedForm<ProductCreateSchemaType>();

  const collections = useComboboxData({
    queryKey: ["product_collections"],
    queryFn: (params) =>
      sdk.vendor.collections.query({ offset: 0, limit: 100, ...params }),
    getOptions: (data) =>
      data.collections.map((collection: any) => ({
        label: collection.title!,
        value: collection.id!,
      })),
  });

  const types = useComboboxData({
    queryKey: ["product_types", "creating"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-types", {
        method: "GET",
        query: params,
      }),
    getOptions: (data) =>
      data.product_types.map((type: any) => ({
        label: type.value,
        value: type.id,
      })),
  });

  const tags = useComboboxData({
    queryKey: ["product_tags", "creating"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-tags", {
        method: "GET",
        query: params,
      }),
    getOptions: (data) =>
      data.product_tags.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })),
  });

  return (
    <div id="organize" className="flex flex-col gap-y-8">
      <div>
        <Heading>{t("products.organization.header")}</Heading>
        <p className="text-ui-fg-subtle mt-1 text-sm">
          {t("products.organization.hint")}
        </p>
      </div>
      <SwitchBox
        control={form.control}
        name="discountable"
        label={t("products.fields.discountable.label")}
        description={t("products.fields.discountable.hint")}
        optional
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field
          control={form.control}
          name="tags"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional tooltip={t("products.fields.tags.hint")}>
                  {t("products.fields.tags.label")}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={tags.options}
                    searchValue={tags.searchValue}
                    onSearchValueChange={tags.onSearchValueChange}
                    fetchNextPage={tags.fetchNextPage}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
        <Form.Field
          control={form.control}
          name="type_id"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional tooltip={t("products.fields.type.hint")}>
                  {t("products.fields.type.label")}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={types.options}
                    searchValue={types.searchValue}
                    onSearchValueChange={types.onSearchValueChange}
                    fetchNextPage={types.fetchNextPage}
                    allowClear
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field
          control={form.control}
          name="categories"
          render={({ field }) => {
            const [isFocused, setIsFocused] = useState(false);

            return (
              <Form.Item>
                <Form.Label tooltip={t("products.fields.primaryCategory.tooltip")}>
                  {t("products.fields.primaryCategory.label")}
                </Form.Label>
                <Form.Control>
                  <CategoryCombobox
                    {...field}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setIsFocused(false);
                      field.onBlur();
                    }}
                    isSingleSelect
                    allowClear={false}
                  />
                </Form.Control>
                {!isFocused && <Form.ErrorMessage />}
              </Form.Item>
            );
          }}
        />
        <Form.Field
          control={form.control}
          name={"secondary_categories" as any}
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label
                  optional
                  tooltip={t("products.fields.secondaryCategories.hint")}
                >
                  {t("products.fields.secondaryCategories.label", "Secondary Categories")}
                </Form.Label>
                <Form.Control>
                  <CategoryCombobox
                    {...field}
                    value={field.value || []}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field
          control={form.control}
          name="collection_id"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label
                  optional
                  tooltip={t("products.fields.collection.hint")}
                >
                  {t("products.fields.collection.label")}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={collections.options}
                    searchValue={collections.searchValue}
                    onSearchValueChange={collections.onSearchValueChange}
                    fetchNextPage={collections.fetchNextPage}
                    allowClear
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
