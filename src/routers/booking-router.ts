import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getReserves, postReserves, updateReserves } from "@/controllers/booking-controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getReserves)
  .post("/", postReserves)
  .put("/:bookingId", updateReserves);

export { bookingRouter };