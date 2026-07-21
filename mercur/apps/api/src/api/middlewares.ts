import { authenticate, defineMiddlewares } from "@medusajs/medusa"

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/carts/:id/razorpay/confirm",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
})
