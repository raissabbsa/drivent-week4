import { prisma } from "@/config";

async function findBookings( userId: number ) {
    return prisma.booking.findFirst({
        where: { userId },
        include: {
            Room: true,
        }
    })
}

async function findroomWithId( id: number ) {
    return prisma.room.findFirst({
        where: {id}
    })
}

async function findBookingWithRoomId( roomId: number ) {
    return prisma.booking.findMany({
        where: { roomId }
    })
}

async function findBookingWithId( id: number ) {
    return prisma.booking.findFirst({
        where: {id}
    })
}
async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

async function putBooking(id: number, roomId: number) {
    return prisma.booking.update({
        where: {
            id
        },
        data: {
            roomId
        }
    })
}

const bookingRepository = {
    findBookings,
    findroomWithId,
    createBooking,
    findBookingWithRoomId,
    findBookingWithId,
    putBooking
  };
  
  export default bookingRepository;