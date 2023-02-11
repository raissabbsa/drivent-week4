import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import httpStatus from "http-status";

async function getBooking(userId: number) {
    const booking = await bookingRepository.findBookings(userId);
    if(!booking) throw notFoundError();

    return booking;
}

async function postBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw { message: "forbiden" }

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket) throw { message: "forbiden" }

    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw { message: "forbiden" }
    }

    const room = await bookingRepository.findroomWithId(roomId);
    if(!room) throw { message: "not found" }

    const isRoomFull = await bookingRepository.findBookingWithRoomId(roomId);
    if(isRoomFull.length >= room.capacity) throw { message: "forbiden" }

    const booking = await bookingRepository.createBooking(userId, roomId);
    return booking.id;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
    const room = await bookingRepository.findroomWithId(roomId);
    if(!room) throw { message: "not found" }

    const isRoomFull = await bookingRepository.findBookingWithRoomId(roomId);
    if(isRoomFull.length >= room.capacity) throw { message: "forbiden" }

    const booking = await bookingRepository.findBookingWithId(bookingId);
    if(!booking) throw { message: "forbiden" }

    await bookingRepository.putBooking(bookingId, roomId);

}

const bookingService = {
    getBooking,
    postBooking,
    updateBooking
  };
  
  export default bookingService;
  