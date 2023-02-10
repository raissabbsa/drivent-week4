import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createReservation( userId: number, roomId: number ) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

export async function createRoom( hotelId: number ) {
    return prisma.room.create({
        data: {
            name: faker.name.firstName(),
            capacity: faker.datatype.number(),
            hotelId
        }
    })
}