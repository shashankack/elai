import { RouteFocusModal } from "../../components/modals"
import { CreatePlatformShippingOptionForm } from "./create-platform-shipping-option-form"

export const PlatformShippingOptionCreatePage = () => {
  return (
    <RouteFocusModal>
      <CreatePlatformShippingOptionForm />
    </RouteFocusModal>
  )
}

export const Component = PlatformShippingOptionCreatePage
