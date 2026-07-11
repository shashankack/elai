// Route: /categories/:id/products
import { useParams } from "react-router-dom";
import { RouteFocusModal, RouteModalLoading } from "@components/modals";
import { useProductCategory } from "@hooks/api";
import { EditCategoryProductsForm } from "./edit-category-products-form";

export const Component = () => {
  const { id } = useParams();
  const { product_category, isLoading, isError, error } = useProductCategory(
    id!,
    { fields: "*products" },
  );

  if (isError) {
    throw error;
  }

  const ready = !isLoading && !!product_category

  return (
    <RouteFocusModal>
      {ready ? (
        <EditCategoryProductsForm
          categoryId={id!}
          products={product_category.products}
        />
      ) : (
        <RouteModalLoading />
      )}
    </RouteFocusModal>
  );
};
