import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getReserves } from "@/controllers/booking-controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getReserves)

export { bookingRouter };