import {
  defineMiddlewares,
  authenticate,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom/customer*",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
  ],
})