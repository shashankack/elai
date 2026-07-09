# ELAI Vendor Dashboard — Complete Guide for Sellers

Welcome to ELAI. This guide explains how to use the **Vendor Dashboard** — the website where you manage your shop, products, and orders on ELAI.

You do **not** need technical knowledge to follow this guide. Take it one section at a time.

---

## Table of contents

- [ELAI Vendor Dashboard — Complete Guide for Sellers](#elai-vendor-dashboard--complete-guide-for-sellers)
  - [Table of contents](#table-of-contents)
  - [1. What is the Vendor Dashboard?](#1-what-is-the-vendor-dashboard)
  - [2. Before you start](#2-before-you-start)
  - [3. How to get your account](#3-how-to-get-your-account)
    - [Standard ELAI flow (recommended)](#standard-elai-flow-recommended)
    - [Your status while waiting](#your-status-while-waiting)
  - [4. Seller onboarding wizard (first-time setup)](#4-seller-onboarding-wizard-first-time-setup)
    - [Step 1 — Storefront](#step-1--storefront)
    - [Step 2 — Business address](#step-2--business-address)
    - [Step 3 — Legal \& tax](#step-3--legal--tax)
    - [Step 4 — Bank \& payouts](#step-4--bank--payouts)
    - [After the wizard](#after-the-wizard)
  - [5. Logging in](#5-logging-in)
    - [Forgot password?](#forgot-password)
    - [After login](#after-login)
  - [6. Choosing your store](#6-choosing-your-store)
  - [7. Understanding your screen](#7-understanding-your-screen)
    - [Left sidebar  main menu](#left-sidebar--main-menu)
    - [Top of the page](#top-of-the-page)
    - [Settings area](#settings-area)
  - [8. Setting up your shop (first-time checklist)](#8-setting-up-your-shop-first-time-checklist)
    - [Step 1 — Store details](#step-1--store-details)
    - [Step 2 — Address](#step-2--address)
    - [Step 3 — Company details](#step-3--company-details)
    - [Step 4 — Payment details](#step-4--payment-details)
  - [9. Shipping and delivery setup](#9-shipping-and-delivery-setup)
    - [Simple path for small sellers](#simple-path-for-small-sellers)
    - [Per-product shipping (optional)](#per-product-shipping-optional)
    - [If you only sell digital or pickup-only](#if-you-only-sell-digital-or-pickup-only)
  - [10. Adding products](#10-adding-products)
    - [Start a new product](#start-a-new-product)
    - [Step-by-step wizard](#step-by-step-wizard)
      - [Step 1  Details](#step-1--details)
      - [Step 2  Organize](#step-2--organize)
      - [Step 3  Attributes](#step-3--attributes)
      - [Step 4  Variants](#step-4--variants)
      - [Step 5  Inventory](#step-5--inventory)
    - [Saving your work](#saving-your-work)
  - [11. Product statuses — what they mean](#11-product-statuses--what-they-mean)
    - [If your product is rejected](#if-your-product-is-rejected)
  - [12. Managing your product list](#12-managing-your-product-list)
    - [Useful actions](#useful-actions)
    - [Inside a product page](#inside-a-product-page)
  - [13. Categories and collections](#13-categories-and-collections)
    - [Categories](#categories)
    - [Collections](#collections)
  - [14. Stock and inventory](#14-stock-and-inventory)
    - [Good habits](#good-habits)
  - [15. Handling orders](#15-handling-orders)
    - [Order list](#order-list)
    - [Open an order](#open-an-order)
    - [Typical fulfillment steps](#typical-fulfillment-steps)
      - [1. New order (unfulfilled)](#1-new-order-unfulfilled)
      - [2. Fulfill items](#2-fulfill-items)
      - [3. Allocate stock (if asked)](#3-allocate-stock-if-asked)
      - [4. Create shipment](#4-create-shipment)
      - [5. Mark as shipped / delivered](#5-mark-as-shipped--delivered)
    - [Packing tips for local / small sellers](#packing-tips-for-local--small-sellers)
    - [Cancellations](#cancellations)
  - [16. Customers](#16-customers)
  - [17. Offers and discounts (promotions)](#17-offers-and-discounts-promotions)
    - [Promotions](#promotions)
    - [Campaigns](#campaigns)
  - [18. Payouts (getting paid)](#18-payouts-getting-paid)
    - [What you should do](#what-you-should-do)
  - [19. Settings and your team](#19-settings-and-your-team)
    - [Your profile](#your-profile)
    - [Store closure / time off](#store-closure--time-off)
    - [Inviting team members](#inviting-team-members)
  - [20. When can shoppers see my products?](#20-when-can-shoppers-see-my-products)
    - [Checklist before going live](#checklist-before-going-live)
  - [21. Day-to-day routine](#21-day-to-day-routine)
    - [Quiet days (few orders)](#quiet-days-few-orders)
    - [Busy days](#busy-days)
    - [Weekly](#weekly)
  - [22. Common problems and fixes](#22-common-problems-and-fixes)
  - [23. Glossary — simple meanings](#23-glossary--simple-meanings)
  - [24. Quick reference card](#24-quick-reference-card)
  - [25. Need help?](#25-need-help)

---

## 1. What is the Vendor Dashboard?

The **Vendor Dashboard** is your **seller control panel** on ELAI. Think of it like the “back office” of your shop.

From here you can:

- Set up your business profile (name, address, bank details)
- Add and edit products (photos, prices, sizes, etc.)
- See orders from customers
- Pack and ship orders
- Check stock levels
- View payout information

**What it is not:** It is not the public ELAI shopping website. Customers shop on **https://elaai.co** (and the ELAI app when live). You work behind the scenes in the Vendor Dashboard.

**Live URLs:**

| What | URL |
|------|-----|
| **Apply / register** | **https://vendor.elaai.co/register** |
| **Vendor dashboard (login)** | **https://vendor.elaai.co** |
| **ELAI shop (customers)** | **https://elaai.co/shop** |

For local development: `http://localhost:7001` (vendor), `http://localhost:3000` (landing + shop).

---

## 2. Before you start

Keep these ready:

| What you need | Why |
|---------------|-----|
| **Email address** you used to register on ELAI | To log in |
| **Password** you chose at registration | To log in |
| **Stable internet** | The dashboard needs a connection to ELAI’s servers |
| **Computer or large tablet** | Easier than phone for adding many products |
| **Product photos** | Clear images help sales |
| **Basic business info** | Shop name, address, GST/business details if you have them |
| **Bank account details (India)** | Account holder name, bank name, account number, IFSC — for payouts |

**Browser:** Use an up-to-date version of Chrome, Edge, Firefox, or Safari.

---

## 3. How to get your account

ELAI uses the **Mercur Vendor Portal** for seller registration and the dashboard. There is no separate “seller portal” app — everything starts at **vendor.elaai.co**.

### Standard ELAI flow (recommended)

1. **Apply from the ELAI website**  
   On **https://elaai.co**, click **Apply as Seller** (or go directly to **https://vendor.elaai.co/register**).

2. **Create your login**  
   Enter your **email** and **password**. This same login unlocks the vendor dashboard after ELAI approves your store.

3. **Complete the onboarding wizard (4 steps)**  
   A short, India-focused form collects your store, address, GST/company, and bank details. See [Section 4](#4-seller-onboarding-wizard-first-time-setup).

4. **Wait for ELAI to review**  
   Your seller account is created with status **Pending**. ELAI reviews within a few business days.

5. **Log in and finish setup**  
   Once approved, sign in at **https://vendor.elaai.co**, complete any remaining items in Settings, add products, and publish.

### Your status while waiting

| Status | What it means for you |
|--------|------------------------|
| **Pending** | Application received; ELAI has not approved yet. You may still log in and prepare your shop, but customers will **not** see your products on ELAI until you are approved. |
| **Active** | You are approved. Once your products are also approved, they can appear on **elaai.co/shop**. |
| **Inactive** | Your shop is paused by ELAI. Contact support if you think this is a mistake. |

---

## 4. Seller onboarding wizard (first-time setup)

After you create your account at **/register**, you see the **Join the ELAI marketplace** wizard — four steps with ELAI branding. It is simplified for **Indian sellers** (INR, India address, IFSC bank details).

You can **Skip** on address, company, and payment steps if you want to finish later in **Settings → Store** — but completing them now speeds up approval and payouts.

### Step 1 — Storefront

**What you fill in:**

- **Store name** — how customers know you (e.g. “Priya’s Accessories”)
- **Store email** — public contact email for your shop

**What ELAI sets automatically (you do not see these fields):**

- **Currency** — INR (Indian Rupee)
- **Store handle** — auto-generated from your store name (used in URLs)
- Phone, description, and currency picker are hidden to keep signup short; add them later in Settings if needed.

### Step 2 — Business address

**What you fill in:**

- **Location name** — e.g. “Main studio” or “Head office”
- **Address** — street / building
- **PIN code**
- **City**

**What ELAI sets automatically:**

- **Country** — India

You will not see a country dropdown, state/province field, or “apartment line 2” — the form assumes an Indian business address.

**Skip:** You can skip and add the address later in Settings → Store → Address.

### Step 3 — Legal & tax

**What you fill in:**

- **Legal business name** (optional) — registered company name if you have one
- **GSTIN** (optional) — your GST number if registered

**Hidden:** Registration number field (not required in the wizard).

**Skip:** You can skip and add details later in Settings → Store → Professional details.

### Step 4 — Bank & payouts

**Indian bank account for ELAI payouts:**

- **Account holder name** (required)
- **Bank name** (optional)
- **Account number** (optional)
- **IFSC code** (optional)

There is **no** IBAN, SWIFT/BIC, or international bank picker — payouts are India-only in this flow.

**Skip:** You can skip and add bank details later in Settings → Store → Payment details.

### After the wizard

You see **Application submitted!** — your seller account is **Pending** until ELAI approves. You can **Continue to dashboard** to select your store and start adding products while you wait.

**Questions during signup?** Email **Blameus2026@gmail.com** (also shown on the registration screen).

---

## 5. Logging in

1. Open **https://vendor.elaai.co** (or the link from your welcome email).
2. You will see the **Login** page.
3. Enter your **email**.
4. Enter your **password**.
5. Click **Continue** (or **Log in**).

### Forgot password?

1. On the login page, click **Reset password** (or similar link).
2. Enter your email.
3. Check your inbox for a reset link.
4. Set a new password and log in again.

### After login

- If you belong to **one shop**, you go straight to your dashboard.
- If you belong to **more than one shop**, you will see **Select a store**  pick the shop you want to work on.

---

## 6. Choosing your store

On the **Select a store** screen you will see each shop you can access.

Each shop shows a **status badge**:

| Badge | Meaning |
|-------|---------|
| **Pending** | Waiting for ELAI approval |
| **Active** | Approved and can sell (once products are live) |
| **Inactive** | Suspended |

Click the shop you want to open. You can switch shops later using the **store name dropdown** at the top of the screen.

To create an additional shop (if allowed), use **Add new store** and follow the setup steps.

---

## 7. Understanding your screen

After you select a store, you land on **Orders**. Here is how the screen is organized.

### Left sidebar  main menu

| Menu item | What you use it for |
|-----------|---------------------|
| **Orders** | See new sales and ship them to customers |
| **Products** | Add and edit what you sell |
| **Collections** | Group products (e.g. “Festive collection”, “Bestsellers”) |
| **Categories** | Place products in ELAI’s category tree (earrings, bags, etc.) |
| **Inventory** | Check and adjust stock |
| **Customers** | See people who bought from you |
| **Promotions** | Create discount codes or offers |
| **Campaigns** | Run time-limited sales |
| **Price Lists** | Special prices (advanced  optional for small sellers) |
| **Payouts** | See payment history from ELAI |
| **Settings** (gear icon) | Your profile, shop details, team, shipping locations |

### Top of the page

- **Store switcher**  change to another shop if you have several.
- **Search**  press **Ctrl+K** (Windows) or **Cmd+K** (Mac) to search quickly.

### Settings area

Click **Settings** in the sidebar for:

- Your personal **Profile**
- **Store** details (name, logo, address, bank)
- **Users** (invite staff)
- **Locations** (where you ship from)
- **Product types** and **tags** (optional organization)

---

## 8. Setting up your shop (first-time checklist)

When you open **Settings → Store**, you may see a box called **Complete store profile**. Finish all steps so ELAI and customers have correct information.

If you **skipped** steps during the onboarding wizard, complete them here. If you already submitted address, GST, or bank details in the wizard, review them for accuracy.

### Step 1 — Store details

**Go to:** Settings → Store → Edit (or **Add store details**)

Fill in:

- **Store name** — how customers know you
- **Email** — shop contact email
- **Phone** — number customers or ELAI can reach you on *(add here if you skipped it in onboarding)*
- **Description** — a short story about your shop *(optional; not asked during signup)*
- **Logo / banner** — upload a clear logo if you have one

**Note:** Currency is **INR** for ELAI sellers. You cannot change currency after the store is created.

### Step 2 — Address

**Go to:** Settings → Store → Address

Add where your business operates from (studio, shop, or dispatch address). Country is **India** for ELAI sellers.

Fill in street, city, and **PIN code** at minimum.

### Step 3 — Company details

**Go to:** Settings → Store → Professional details

If you have them, add:

- Registered business name (legal name)
- **GSTIN** (Tax ID)

Registration number is optional and not required in the ELAI signup flow.

### Step 4 — Payment details

**Go to:** Settings → Store → Payment details

Add the **Indian bank account** where you want to receive money from ELAI:

- Account holder name (as per bank)
- Bank name
- Account number
- **IFSC code**

Double-check numbers. Wrong IFSC or account details delay payouts.

When all four steps show as complete, the checklist disappears. You are ready for the next stages.

---

## 9. Shipping and delivery setup

If you sell **physical items** that need to be posted or couriered, you must set up **shipping** before customers can check out smoothly.

**Go to:** Settings → **Locations**

### Simple path for small sellers

1. **Create a location**  
   Example name: “Main dispatch  Mumbai” or “Home studio”.  
   This is where you pack orders from.

2. **Shipping profiles**  
   A profile describes *how* items ship (standard box, light items, etc.).    
   For most small sellers, the **default** profile is enough to start.

3. **Shipping options**  
   Add at least one option customers can choose, for example:
   - **Standard delivery**  ₹X, 5–7 days  
   - **Express**  ₹Y, 2–3 days (optional)

4. **Service zones**  
   Define **where you ship** (e.g. all India, or specific states).

### Per-product shipping (optional)

On each product page you can assign a **shipping profile** if some items are heavy or need special handling.

### If you only sell digital or pickup-only

Contact ELAI support for guidance. Physical product flows assume shipping is configured.

---

## 10. Adding products

Products are what customers buy. Each product needs at least a **name**, **price**, and usually a **photo**.

### Start a new product

1. Click **Products** in the sidebar.
2. Click **Create** (or **Add product**).
3. You will see a step-by-step form.

### Step-by-step wizard

#### Step 1  Details

- **Title**  clear name (e.g. “Handmade terracotta jhumka earrings”)
- **Description**  materials, size, care instructions, story
- **Images**  upload several good photos (front, side, on model if possible)
- **Subtitle / handle**  often auto-filled; handle is used in the web link

**Photo tips:**

- Use daylight or bright, even light
- Plain background helps
- Show scale (on hand or with a coin/ruler) for small accessories

#### Step 2  Organize

- **Categories**  pick the best ELAI category (e.g. Earrings → Jhumkas)
- **Collections**  optional groups you create (e.g. “Diwali 2026”)
- **Type & tags**  optional; helps search and filters

#### Step 3  Attributes

Extra fields ELAI may ask for (material, color family, occasion, etc.). Fill what applies.

#### Step 4  Variants

A **variant** is a sellable version of the product.

Examples:

- One size / one color → **single variant**
- Sizes S, M, L → **three variants**
- Colors red, blue → **two variants**

For each variant set:

- **Price** (selling price)
- **SKU** (your internal code  optional but useful for stock)
- **Stock** (how many you have), if tracked

#### Step 5  Inventory

Link stock to your **location** (from Section 9).  
Enter quantities so the system knows how many you can sell.

### Saving your work

At the end you have two important buttons:

| Button | What happens |
|--------|----------------|
| **Save as draft** | Saved only for you. **Not** sent to ELAI for review. Use while you are still writing or photographing. |
| **Publish** | Submits the product to **ELAI for approval**. It does **not** go live on the shop immediately. |

**Important:** “Publish” means **“Please review my product”**, not “live on ELAI now”.

---

## 11. Product statuses — what they mean

Every product has a **status**. Look for a colored label on the product page or list.

| Status | Color (usual) | Meaning | Can shoppers buy it? |
|--------|---------------|---------|----------------------|
| **Draft** | Grey | You are still working on it | No |
| **Proposed** | Orange | Waiting for ELAI to approve | No |
| **Published** | Green | Approved and live | Yes |
| **Rejected** | Red | ELAI asked for changes | No |

### If your product is rejected

1. Open the product and read any notes from ELAI (or check email from support).
2. Fix photos, description, price, or category as needed.
3. **Publish** again to resubmit.

---

## 12. Managing your product list

**Go to:** **Products**

You will see a table of all your products.

### Useful actions

- **Search**  find by name
- **Filter**  by status (draft, proposed, published, rejected)
- **Open a product**  click a row to edit details, photos, prices, stock
- **Bulk edit**  change several products at once (use carefully)

### Inside a product page

Typical sections:

- **General**  title, description, status
- **Media**  add or reorder photos
- **Variants**  prices, SKUs, options
- **Stock**  quantities per location
- **Shipping profile**  how this item ships
- **Sales channels**  where it is sold (ELAI will configure)

Save changes after edits. Major updates may need ELAI to review again depending on ELAI policy.

---

## 13. Categories and collections

### Categories

**Go to:** **Categories**

Categories are the **ELAI marketplace structure**  like aisles in a department store.  
Assign each product to the most accurate category so customers can browse and find you.

You can **organize** the tree if ELAI allows sellers to manage certain categories; otherwise pick from what ELAI provides.

### Collections

**Go to:** **Collections**

Collections are **your own groupings**, for example:

- “New arrivals”
- “Under ₹499”
- “Wedding edit”

Create a collection, then **add products** to it. Useful for storytelling and seasonal selling.

---

## 14. Stock and inventory

**Go to:** **Inventory**

Here you see stock levels across your products and locations.

### Good habits

- Update stock when you sell offline or at a local market
- Set stock to **0** when out of stock  avoids selling items you cannot ship
- After a busy period, do a quick count and adjust numbers

When an order comes in, the system may **reserve** stock. You might need to **allocate** stock during fulfillment (see Section 15).

---

## 15. Handling orders

**Go to:** **Orders**

This is one of the most important areas. Check it **daily** when you are actively selling.

### Order list

You see orders that include **your** items. In a marketplace, one customer checkout might split into several sellers  you only fulfill **your** part.

### Open an order

Click an order to see:

- **What was bought** (items, quantities)
- **Customer delivery address**
- **Payment status** (handled by ELAI)
- **Fulfillment status** (your packing/shipping job)

### Typical fulfillment steps

Follow the buttons on the order page. Order may vary slightly, but usually:

#### 1. New order (unfulfilled)

You see items waiting to be packed.

#### 2. Fulfill items

- Click **Fulfill** (or **Create fulfillment**)
- Choose which items you are shipping now
- Choose **location** (where you ship from)
- Confirm

#### 3. Allocate stock (if asked)

Reserves the items from your inventory so stock counts stay correct.

#### 4. Create shipment

- Enter **courier name** (e.g. Delhivery, India Post, Blue Dart, local courier)
- Enter **tracking number** from the courier
- Save

#### 5. Mark as shipped / delivered

Update status when the parcel leaves your hands and when it is delivered (if the system asks).

### Packing tips for local / small sellers

- Photograph the packed order (optional but helpful for disputes)
- Keep courier receipt until delivery is confirmed
- Use waterproof outer packing for monsoon season

### Cancellations

If you cannot fulfill, contact ELAI support **before** delaying too long. Do not ignore orders.

---

## 16. Customers

**Go to:** **Customers**

See people who have ordered from your shop. Useful for repeat buyers and support.

You generally **cannot** see full payment card details  ELAI handles payment security.

---

## 17. Offers and discounts (promotions)

**Go to:** **Promotions** and **Campaigns**

Optional for small sellers, but useful for festivals or slow weeks.

### Promotions

Create rules like:

- 10% off orders over ₹999
- ₹50 off a specific product
- Free shipping above a cart value (if ELAI supports it for your shop)

### Campaigns

Schedule promotions between start and end dates (e.g. Diwali sale week).

Start simple  one clear offer is easier to manage than many overlapping rules.

---

## 18. Payouts (getting paid)

**Go to:** **Payouts**

ELAI collects payment from customers. Your **payout** is the money ELAI transfers to you after fees and marketplace rules.

### What you should do

1. Keep **payment details** correct in Settings → Store (Indian bank + **IFSC**)
2. Check **Payouts** regularly for status: pending, paid, etc.
3. Match payouts to your bank statement

Exact timing (weekly, bi-weekly, after delivery, etc.) depends on ELAI’s seller agreement. Ask ELAI support if unsure.

---

## 19. Settings and your team

### Your profile

**Settings → Profile**  your name, email, language preference.

### Store closure / time off

**Settings → Store → Store closure**  if you are on holiday or cannot ship for a period, set dates here so ELAI can hide or pause your shop as configured.

### Inviting team members

If family or staff help you pack orders:

1. **Settings → Users**
2. **Invite user**
3. Enter their email
4. Choose a **role**:

| Role | Typical use |
|------|-------------|
| **Administration** | Full shop management |
| **Order management** | Pack and ship orders |
| **Inventory** | Stock updates |
| **Accounting** | Payouts and reports |
| **Support** | Customer questions |

They receive an email link to join your shop.

---

## 20. When can shoppers see my products?

Both **you** (the seller) and **each product** must be approved.

```
Register at vendor.elaai.co/register
       ↓
Complete onboarding wizard (4 steps)
       ↓
ELAI approves your SELLER account  →  Status: Active
       ↓
You add products and click Publish   →  Product status: Proposed
       ↓
ELAI approves each product         →  Product status: Published
       ↓
Customers see items on elaai.co/shop
```

### Checklist before going live

- [ ] Seller status is **Active** (not Pending)
- [ ] Store profile checklist is complete
- [ ] Shipping is set up (for physical goods)
- [ ] At least one product is **Published** (green)
- [ ] Photos and prices are correct
- [ ] Stock numbers are realistic

---

## 21. Day-to-day routine

### Quiet days (few orders)

1. Log in once
2. Check **Orders**  anything new?
3. Glance at **Inventory** for low stock

### Busy days

1. **Orders**  fulfill new sales first
2. Print or write packing slips if you use them
3. Update **tracking numbers** same day you hand to courier
4. Reply to ELAI or customer issues if any

### Weekly

1. Review **Proposed** products  still waiting on ELAI?
2. Add **new products** or refresh photos
3. Check **Payouts**
4. Update stock after local sales or markets

---

## 22. Common problems and fixes

| Problem | What to try |
|---------|-------------|
| **Cannot log in** | Check email/password; use Reset password; confirm you registered at **vendor.elaai.co/register** |
| **“Session expired”** | Log in again; do not share your password |
| **Published but not on elaai.co/shop** | Product is probably still **Proposed** — wait for ELAI approval; confirm seller is **Active** |
| **Order button greyed out** | Complete shipping setup in Settings → Locations |
| **Wrong stock after sale** | Open order → complete fulfillment and allocation steps |
| **Page blank or errors** | Refresh browser; try another browser; check internet |
| **Skipped onboarding steps** | Open **Settings → Store** and complete address, GST, or bank details |
| **Invite link does not work** | Link may be expired — ask shop admin to send a new invite |
| **Forgot which store to pick** | Use the store name you registered; contact ELAI if unsure |

When contacting support, include:

- Your shop name
- Your email
- Screenshot of the error
- Order number (if about an order)

---

## 23. Glossary — simple meanings

| Term | Simple meaning |
|------|----------------|
| **Dashboard** | Your seller control panel website |
| **Draft** | Product saved but not submitted for review |
| **Proposed** | Submitted to ELAI; waiting for approval |
| **Published** | Live for customers to buy |
| **Variant** | A specific version of a product (size/color/price) |
| **SKU** | Your internal product code |
| **Inventory / stock** | How many units you have |
| **Fulfillment** | Packing and sending an order |
| **Shipment** | Parcel sent with courier + tracking |
| **Tracking number** | Courier code customers use to follow delivery |
| **Payout** | Money ELAI sends to your bank |
| **Collection** | Your custom group of products |
| **Category** | ELAI’s browse structure (where your product sits) |
| **Promotion** | Discount or special offer |
| **IFSC** | Indian bank branch code (needed for payouts) |
| **GSTIN** | Indian GST tax identification number |
| **Pending (seller)** | ELAI still reviewing your seller application |
| **Active (seller)** | You are approved to sell |

---

## 24. Quick reference card

| Task | Where to go |
|------|-------------|
| Apply as seller | **https://vendor.elaai.co/register** (or **Apply as Seller** on elaai.co) |
| Log in | **https://vendor.elaai.co** |
| Complete shop profile | Settings → Store |
| Set up shipping | Settings → Locations |
| Add a product | Products → Create |
| Submit product for review | Create/Edit → **Publish** |
| See orders | Orders |
| Ship an order | Orders → [order] → Fulfill → Shipment |
| Update stock | Inventory or product → Stock |
| Bank details (IFSC) | Settings → Store → Payment details |
| Invite helper | Settings → Users → Invite |
| Check earnings | Payouts |
| Customer-facing shop | **https://elaai.co/shop** |

---

## 25. Need help?

This guide covers the Vendor Dashboard itself. For things outside the dashboard:

- **Application status** — **Blameus2026@gmail.com**
- **Product rejection reasons** — email or dashboard message from ELAI
- **Payment timing and fees** — refer to your seller agreement or ELAI support
- **Technical emergencies** (site down) — ELAI technical support

Keep this document saved. You can return to any section using the [table of contents](#table-of-contents) at the top.

---

*ELAI Vendor Dashboard Guide — for Indian sellers including small-scale and local businesses. Live URLs: vendor.elaai.co (dashboard), elaai.co (shop). Last updated for Mercur vendor onboarding (India-only, simplified wizard).*
