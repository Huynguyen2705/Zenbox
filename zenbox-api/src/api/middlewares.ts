import {
  defineMiddlewares,
  authenticate,
} from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })
export default defineMiddlewares({
  routes: [
    {
      matcher: "/custom/customer*",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    {
      method: ["POST"],
      matcher: "/store/custom/upload",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        // @ts-ignore
        upload.array("files"),
      ],
    },

  ],
})