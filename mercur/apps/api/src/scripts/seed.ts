import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";
import { createSellerDefaultsWorkflow } from '@mercurjs/core/workflows'

/** INR amounts in paise (₹1 = 100) */
const inr = (rupees: number) => Math.round(rupees * 100)

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["in"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "inr",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);

  const existingRegions = await regionModuleService.listRegions({}, {
    relations: ["countries"],
  });

  const assignedCountries = new Set<string>();
  for (const r of existingRegions) {
    for (const c of r.countries || []) {
      assignedCountries.add(c.iso_2);
    }
  }

  const unassignedCountries = countries.filter(c => !assignedCountries.has(c));

  let region;
  if (unassignedCountries.length === 0) {
    region = existingRegions.find(r =>
      r.countries?.some(c => countries.includes(c.iso_2))
    ) || existingRegions[0];
    logger.info("Countries already assigned to a region, skipping region creation.");
  } else if (unassignedCountries.length < countries.length) {
    logger.info(`Some countries already assigned, creating region with: ${unassignedCountries.join(", ")}`);
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: unassignedCountries,
            payment_providers: [
              "pp_system_default",
              ...(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
                ? ["pp_razorpay_razorpay"]
                : []),
            ],
          },
        ],
      },
    });
    region = regionResult[0];
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries,
            payment_providers: [
              "pp_system_default",
              ...(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
                ? ["pp_razorpay_razorpay"]
                : []),
            ],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions();
  const existingCountryCodes = new Set(existingTaxRegions.map((tr) => tr.country_code));
  const countriesToCreate = countries.filter((c) => !existingCountryCodes.has(c));

  if (countriesToCreate.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: countriesToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } else {
    logger.info("Tax regions already exist, skipping.");
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const existingStockLocations = await stockLocationModule.listStockLocations({
    name: "Mumbai Warehouse",
  });

  let stockLocation;
  if (existingStockLocations.length) {
    stockLocation = existingStockLocations[0];
    logger.info("Stock location 'Mumbai Warehouse' already exists, skipping.");
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Mumbai Warehouse",
            address: {
              city: "Mumbai",
              country_code: "IN",
              province: "MH",
              postal_code: "400001",
              address_1: "Andheri East, MIDC",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
    logger.info("Stock location already linked to fulfillment provider, skipping.");
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "India Warehouse delivery",
  });

  let fulfillmentSet;
  if (existingFulfillmentSets.length) {
    fulfillmentSet = existingFulfillmentSets[0];
    logger.info("Fulfillment set 'India Warehouse delivery' already exists, skipping.");
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "India Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "India",
          geo_zones: [
            {
              country_code: "in",
              type: "country",
            },
          ],
        },
      ],
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_set_id: fulfillmentSet.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Delivery in 3–5 business days across India.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "inr",
              amount: inr(79),
            },
            {
              region_id: region.id,
              amount: inr(79),
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Delivery in 1–2 business days across major Indian cities.",
            code: "express",
          },
          prices: [
            {
              currency_code: "inr",
              amount: inr(149),
            },
            {
              region_id: region.id,
              amount: inr(149),
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  }
  logger.info("Finished seeding fulfillment data.");

  logger.info("Seeding ELAI platform shipping option...");
  try {
    const { MercurModules } = await import("@mercurjs/types");
    const platformShipping = container.resolve(MercurModules.PLATFORM_SHIPPING) as {
      listPlatformShippingOptions: (filters?: Record<string, unknown>) => Promise<unknown[]>;
      createPlatformShippingOptions: (data: unknown[]) => Promise<unknown[]>;
    };
    const existingPlatformOptions =
      await platformShipping.listPlatformShippingOptions({
        is_default: true,
      });
    if (!existingPlatformOptions.length) {
      await platformShipping.createPlatformShippingOptions([
        {
          name: "ELAI Standard Delivery",
          description:
            "ELAI arranges courier pickup and delivery (BlueDart / Shiprocket). You pack the order.",
          courier_label: "BlueDart / Shiprocket",
          currency_code: "inr",
          amount: 79,
          country_codes: { countries: ["in"] },
          is_active: true,
          is_default: true,
        },
      ]);
      logger.info("Created default ELAI Standard Delivery option.");
    } else {
      logger.info("Default ELAI shipping option already exists, skipping.");
    }
  } catch (error: unknown) {
    logger.warn(
      `Skipping ELAI platform shipping seed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to stock location, skipping.");
  }
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Elai Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to API key, skipping.");
  }
  logger.info("Finished seeding publishable API key data.");

  // Products, categories, collections, and seller stores stay empty for admin.
  // Catalog taxonomy: bun run seed:elai-catalog
  logger.info(
    "Skipping products / catalog / seller stores  leave empty for admin. Run seed:elai-catalog for types, categories, collections, and attributes."
  );

  await createSellerDefaultsWorkflow(container).run({})

  logger.info("Finished seeding seller defaults (roles).");
}
