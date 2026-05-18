import { Server } from "socket.io";   //Socket.io backend package import.

const connectToSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {   //connection is buil-in function run when any user req on "http://localhost:5000"

    console.log("User connected:", socket.id);

    socket.on("join-meeting", (meetingId) => {
      socket.join(meetingId);   //built-in function

      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
      });

      console.log("User joined meeting:", meetingId);
    });

    socket.on("offer", ({ offer, meetingId }) => {
      socket.to(meetingId).emit("receive-offer", offer);   //send offer to all other user in same room
    });

    socket.on("answer", ({ answer, meetingId }) => {
      socket.to(meetingId).emit("receive-answer", answer);
    });

    socket.on("ice-candidate", ({ candidate, meetingId }) => {    //browser jab network route find karta hai tab ye event auto-run hota hai
      socket.to(meetingId).emit("receive-ice-candidate", candidate);
    });
  });
};

export default connectToSocket;