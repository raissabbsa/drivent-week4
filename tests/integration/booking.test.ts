import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import { createHotel, createUser } from "../factories";
import { createReservation, createRoom } from "../factories/booking-factory";

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });

  const server = supertest(app);

  describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response =  await server.get("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response =  await server.get('/booking').set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();

        const token = jwt.sign({userId: userWithoutSession.id}, process.env.JWT_SECRET);

        const response =  await server.get('/booking').set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when user doesn't have a reservation", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it("shoud respond with status 200 and data when there is a reservation", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoom(hotel.id);
            const booking = await createReservation(user.id, room.id);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);

            expect(response.body).toEqual({
                id: booking.id,
                roomId: booking.roomId,
                userId: booking.userId,
                createdAt: booking.createdAt.toISOString(),
                updatedAt: booking.updatedAt.toISOString(),
                Room: {
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString(),
                }
            });
        })

    });
  });
