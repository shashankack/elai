// Route: /orders/:id/:f_id/create-shipment
import { useParams } from "react-router-dom"

import { RouteFocusModal, RouteModalLoading } from "@components/modals"
import { useOrder } from "@hooks/api/orders"
import { OrderCreateShipmentForm } from "./order-create-shipment-form"

export const Component = () => {
  const { id, f_id } = useParams()

  const { order, isLoading, isError, error } = useOrder(id!, {
    fields: "*fulfillments,*fulfillments.items,*fulfillments.labels",
  })

  if (isError) {
    throw error
  }

  const fulfillment = order?.fulfillments?.find((f) => f.id === f_id)
  const ready = !isLoading && !!order && !!fulfillment

  return (
    <RouteFocusModal>
      {ready ? (
        <OrderCreateShipmentForm
          order={order}
          fulfillment={fulfillment}
        />
      ) : (
        <RouteModalLoading />
      )}
    </RouteFocusModal>
  )
}
