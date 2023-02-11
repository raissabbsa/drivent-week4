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

export async function createRoomWith1Vacancy( hotelId: number ) {
  return prisma.room.create({
      data: {
          name: faker.name.firstName(),
          capacity: 1,
          hotelId
      }
  })
}

export async function createTicketTypeRemote() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: true,
        includesHotel: faker.datatype.boolean(),
      },
    });
  }
export async function createTicketTypeWithoutHotel() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: false,
      },
    });
}

export async function createTicketTypeTrue() {
    return prisma.ticketType.create({
      data: {
        name: faker.name.findName(),
        price: faker.datatype.number(),
        isRemote: false,
        includesHotel: true,
      },
    });
  }

