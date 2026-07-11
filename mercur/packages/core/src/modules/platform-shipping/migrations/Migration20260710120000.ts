import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260710120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "platform_shipping_option" ("id" text not null, "name" text not null, "description" text null, "courier_label" text null, "currency_code" text not null default 'inr', "amount" numeric not null, "country_codes" jsonb not null default '{"countries":["in"]}', "is_active" boolean not null default true, "is_default" boolean not null default false, "metadata" jsonb null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "platform_shipping_option_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_platform_shipping_option_deleted_at" ON "platform_shipping_option" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "platform_shipping_opt_in" ("id" text not null, "seller_id" text not null, "stock_location_id" text not null, "shipping_option_id" text null, "is_enabled" boolean not null default true, "metadata" jsonb null, "platform_shipping_option_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "platform_shipping_opt_in_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_platform_shipping_opt_in_platform_shipping_option_id" ON "platform_shipping_opt_in" ("platform_shipping_option_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_platform_shipping_opt_in_deleted_at" ON "platform_shipping_opt_in" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_platform_shipping_opt_in_unique_location_option" ON "platform_shipping_opt_in" ("stock_location_id", "platform_shipping_option_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_platform_shipping_opt_in_seller_id" ON "platform_shipping_opt_in" ("seller_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `alter table if exists "platform_shipping_opt_in" add constraint "platform_shipping_opt_in_platform_shipping_option_id_foreign" foreign key ("platform_shipping_option_id") references "platform_shipping_option" ("id") on update cascade on delete cascade;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "platform_shipping_opt_in" drop constraint if exists "platform_shipping_opt_in_platform_shipping_option_id_foreign";`
    )
    this.addSql(`drop table if exists "platform_shipping_opt_in" cascade;`)
    this.addSql(`drop table if exists "platform_shipping_option" cascade;`)
  }
}
