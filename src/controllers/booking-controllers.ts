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

export async function postReserves(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const {roomId } = req.body;
    
    try{
        if(!roomId) return res.sendStatus(httpStatus.NOT_FOUND);

        const result = await bookingService.postBooking(userId, roomId);
        return res.status(httpStatus.OK).send({bookingId: result})

    } catch(err) {
        if(err.message === "not found" ){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        else if(err.message === "forbiden" ){
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
    }
}

export async function updateReserves(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const {roomId } = req.body;
    const { bookingId } = req.params;
    try{
        if(!roomId) return res.sendStatus(httpStatus.NOT_FOUND);
        await bookingService.updateBooking(userId, roomId, Number(bookingId));
        return res.status(httpStatus.OK).send({bookingId});

    } catch(err) {
        if(err.message === "not found" ){
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        else if(err.message === "forbiden" ){
            return res.sendStatus(httpStatus.FORBIDDEN);
        }
    }


}