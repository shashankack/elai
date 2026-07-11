import { DAL } from "@medusajs/framework/types"
import { MedusaService } from "@medusajs/framework/utils"
import { PlatformShippingOption, PlatformShippingOptIn } from "./models"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
}

class PlatformShippingModuleService extends MedusaService({
  PlatformShippingOption,
  PlatformShippingOptIn,
}) {
  protected readonly baseRepository_: DAL.RepositoryService

  constructor({ baseRepository }: InjectedDependencies) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)
    this.baseRepository_ = baseRepository
  }
}

export default PlatformShippingModuleService
