import { Server } from "socket.io";   //Socket.io backend package import.
import ChatMessage from "../models/chatMessage.js";

const connectToSocket = (server) => {

  const meetingPresenters = new Map();
  let joinedMeetingId = null;

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {   //connection is buil-it function run when any user req on "http://localhost:5000"

    console.log("User connected:", socket.id);

    socket.on("join-meeting", (meetingId) => {
      joinedMeetingId = meetingId;
      const room = io.sockets.adapter.rooms.get(meetingId);
      const existingUsers = room ? [...room] : [];
        
      socket.join(meetingId);
        
      socket.emit("existing-users", existingUsers);
        
      socket.to(meetingId).emit("user-joined", {
        socketId: socket.id,
      });
    });

    socket.on("offer", ({ offer, targetSocketId  }) => {  
      socket.to(targetSocketId).emit("receive-offer", {
        offer,
        fromSocketId: socket.id,
      });     //send offer to user in same room
    });

    socket.on("answer", ({ answer, targetSocketId  }) => {
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

    socket.on("screen-share-start", ({ meetingId }, callback) => {
      const currentPresenter = meetingPresenters.get(meetingId);

      if (currentPresenter && currentPresenter !== socket.id) {
        callback?.({
          success: false,
          message: "Someone is already presenting",
        });
        return;
      }
    
      meetingPresenters.set(meetingId, socket.id);
    
      callback?.({
        success: true,
        presenterId: socket.id,
      });
    
      io.to(meetingId).emit("screen-share-started", {
        socketId: socket.id,
      });
    });

    socket.on("screen-share-stop", ({ meetingId }, callback) => {
      const currentPresenter = meetingPresenters.get(meetingId);
    
      if (currentPresenter === socket.id) {
        meetingPresenters.delete(meetingId);
      
        io.to(meetingId).emit("screen-share-stopped", {
          socketId: socket.id,
        });
      }
    
      callback?.({ success: true });
    });

    socket.on("send-message", async ({ meetingId, senderId, senderName, message }) => {
      try {
        const cleanMessage = message?.trim();
      
        if (!meetingId || !senderId || !senderName || !cleanMessage) {
          return;
        }
      
        const savedMessage = await ChatMessage.create({
          meetingId,
          senderId,
          senderName,
          message: cleanMessage,
        });
      
        io.to(meetingId).emit("receive-message", savedMessage);
      } catch (error) {
        console.log(error);
        
        socket.emit("chat-error", {
          message: "Message could not be sent",
        });
      }
    });

    socket.on("disconnect", () => {
      if (joinedMeetingId) {
        socket.to(joinedMeetingId).emit("user-left", {
          socketId: socket.id,
        });
      }
    
      for (const [meetingId, presenterId] of meetingPresenters.entries()) {
        if (presenterId === socket.id) {
          meetingPresenters.delete(meetingId);
          socket.to(meetingId).emit("screen-share-stopped", {
            socketId: socket.id,
          });
        }
      }
    });

    socket.on("leave-meeting", ({ meetingId }) => {
      socket.to(meetingId).emit("user-left", {
        socketId: socket.id,
      });
    });

  });
};

export default connectToSocket;