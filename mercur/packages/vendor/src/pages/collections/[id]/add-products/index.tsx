// Route: /collections/:id/add-products
import { useParams } from "react-router-dom"
import { RouteFocusModal, RouteModalLoading } from "@components/modals"
import { useCollection } from "@hooks/api/collections"
import { AddProductsToCollectionForm } from "./add-products-to-collection-form"

export const Component = () => {
  const { id } = useParams()
  const { product_collection, isLoading, isError, error } = useCollection(id!)

  if (isError) throw error

  const ready = !isLoading && !!product_collection

  return (
    <RouteFocusModal>
      {ready ? (
        <AddProductsToCollectionForm collection={product_collection} />
      ) : (
        <RouteModalLoading />
      )}
    </RouteFocusModal>
  )
}
