import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getReserves(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try{
        const result = await bookingService.getBooking( userId );
        return res.status(httpStatus.OK).send(result);

    } catch(err) {
        return res.status(httpStatus.NOT_FOUND).send({});
    }
}