import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createRoomWithHotelId, createTicket, createTicketType, createTicketTypeRemote, createUser } from "../factories";
import { createReservation, createRoom, createRoomWith1Vacancy, createTicketTypeTrue, createTicketTypeWithoutHotel } from "../factories/booking-factory";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });

  const server = supertest(app);

  describe("GET /booking", () => {
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
        });

    });
  });

  describe("POST /booking", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response =  await server.post("/booking");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response =  await server.post('/booking').set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();

        const token = jwt.sign({userId: userWithoutSession.id}, process.env.JWT_SECRET);

        const response =  await server.post('/booking').set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when doesn't have a body", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 403 when user doesnt have an enrollment yet", async () => {
            const token = await generateValidToken();
            const roomId = faker.datatype.number();
      
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
          });
      
          it("should respond with status 403 when user doesnt have a ticket yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            const roomId = faker.datatype.number();
      
            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
          });

          it("should respond with status 403 when ticket has not been paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const roomId = faker.datatype.number();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});
      
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when ticketType is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeRemote();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const roomId = faker.datatype.number();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});
      
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when ticketType doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user); 
            const ticketType = await createTicketTypeWithoutHotel();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const roomId = faker.datatype.number();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});
      
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });
      

        it("should respond with status 404 when room doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeTrue();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const roomId = faker.datatype.number();

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId});

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 403 when room has no vacancy", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeTrue();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWith1Vacancy(hotel.id);
            await createReservation(user.id, room.id);

            const response = await server
                .post("/booking")
                .set("Authorization", `Bearer ${token}`)
                .send({roomId: room.id});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 200 and bookingId when room has vacancy", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeTrue();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoom(hotel.id);

            const response = await server
                .post("/booking")
                .set("Authorization", `Bearer ${token}`)
                .send({roomId: room.id});

            expect(response.status).toBe(httpStatus.OK)
        });        
    });
  });

  describe("POST /booking/:bookingId", () => {
    it("should respond with status 401 if no token is given", async () => {
        const bookingId = faker.datatype.number();

        const response =  await server.put("/booking/"+bookingId);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const bookingId = faker.datatype.number();

        const response =  await server.put("/booking/"+bookingId).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const bookingId = faker.datatype.number();

        const token = jwt.sign({userId: userWithoutSession.id}, process.env.JWT_SECRET);

        const response =  await server.put("/booking/"+bookingId).set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when room doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const roomId = faker.datatype.number();
            const bookingId = faker.datatype.number();
            const response = await server.put("/booking/"+bookingId).set("Authorization", `Bearer ${token}`).send({roomId});

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 403 when room has no vacancy", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWith1Vacancy(hotel.id);
            await createReservation(user.id, room.id);
            const bookingId = faker.datatype.number();

            const response = await server
                .put("/booking/"+bookingId)
                .set("Authorization", `Bearer ${token}`)
                .send({roomId: room.id});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 403 when booking doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoom(hotel.id);
            const bookingId = faker.datatype.number();

            const response = await server
                .put("/booking/"+bookingId)
                .set("Authorization", `Bearer ${token}`)
                .send({roomId: room.id});

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });

        it("should respond with status 200 and data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoom(hotel.id);
            const booking = await createReservation(user.id, room.id);
            const newRoom = await createRoom(hotel.id);
            const response = await server
                .put("/booking/"+booking.id)
                .set("Authorization", `Bearer ${token}`)
                .send({roomId: newRoom.id});

            expect(response.status).toBe(httpStatus.OK);
        });

    });
  });
