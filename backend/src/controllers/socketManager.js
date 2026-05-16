import { Server } from "socket.io";   //Socket.io backend package import.

const connectToSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {   //connection is in buil-it function run when any user req on "http://localhost:5000"

    console.log("User connected:", socket.id);

    socket.on("join-meeting", (meetingId) => {
      const room = io.sockets.adapter.rooms.get(meetingId);
      const existingUsers = room ? [...room] : [];
        
      socket.join(meetingId);
        
      socket.emit("existing-users", existingUsers);
        
      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
      });
    });

    socket.on("offer", ({ offer, targetSocketId  }) => {
      //socket.to(meetingId).emit("receive-offer", offer);   
      socket.to(targetSocketId).emit("receive-offer", {
        offer,
        fromSocketId: socket.id,
      });     //send offer to all other user in same room
    });

    socket.on("answer", ({ answer, targetSocketId  }) => {
      //socket.to(meetingId).emit("receive-answer", answer);
      socket.to(targetSocketId).emit("receive-answer", {
        answer,
        fromSocketId: socket.id,
      });
    });

    socket.on("ice-candidate", ({ candidate, targetSocketId  }) => {
      //socket.to(meetingId).emit("receive-ice-candidate", candidate);
      socket.to(targetSocketId).emit("receive-ice-candidate", {
        candidate,
        fromSocketId: socket.id,
      });
    });
  });
};

export default connectToSocket;