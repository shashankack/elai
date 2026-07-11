import { useParams } from "react-router-dom"
import { RouteFocusModal, RouteModalLoading } from "@components/modals"
import { useRegion } from "@hooks/api/regions"
import { AddCountriesForm } from "./_components/add-countries-form"

const RegionAddCountries = () => {
  const { id } = useParams()

  const {
    region,
    isPending: isLoading,
    isError,
    error,
  } = useRegion(id!, {
    fields: "*payment_providers",
  })

  if (isError) {
    throw error
  }

  const ready = !isLoading && !!region

  return (
    <RouteFocusModal>
      {ready ? (
        <AddCountriesForm region={region} />
      ) : (
        <RouteModalLoading />
      )}
    </RouteFocusModal>
  )
}

export const Component = RegionAddCountries
