const mongoose = require("mongoose");
const { Chat, User } = require("../models");
const { StatusCodes } = require("http-status-codes");

const { chatSchema } = require("../utils/joiSchema");

const createChat = async (req, res, next) => {
  /**validate the data sent from the client
   * the two usersId (sender and receiver) will
   * be sent together with the text and all chats between the
   * two users will be returned back to the sender */
  // later the code will be modified that the userId will be
  // gotten from the user payload instead from the client
  const { userId } = req.payload;
  try {
    const validation = chatSchema(req.body);
    const { value, error } = validation;
    console.log({ value });
    if (error) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send(validation.error.details[0].message);
      return;
    }
    const { receiver } = value;
    value.sender = userId;
    // add the new message to the database
    await Chat.create({ ...value });
    /**find all the chats between the two users where
     * the sender is either the receiver or sender */
    const chatBetweenTheUsers = await Chat.find({
      $or: [
        { sender: userId, receiver: receiver },
        { sender: receiver, receiver: userId },
      ],
    }).sort({ createdAt: -1 }); // sort by created time

    // returning the entire chat history between the sender and the receiver to the sender
    res.status(200).json({ data: chatBetweenTheUsers });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
};

// //This route will be executed whenever a user hit the chat page
/**THIS IS THE REAL CONTROLLER */
const getAllChatsOfAUser = async (req, res, next) => {
  const { userId } = req.payload; 

  /**Get all chats where the user is a participant sorted by date*/
  const allChats = await Chat.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 });
  const sortedChats = []; //the finally sorted chats array will be returned to the caller
// console.log({allChats} , { userId })
  /**loop through the chats and separate chat he has with different users */
  for (let i = 0; i < allChats.length; i++) {
    let chat = allChats[i]; //a particular chat object from allChats array(array of chat objects)
    let { receiver, sender } = chat;
    const currentUserId = userId;
    const partnerId =
      sender.toString() !== currentUserId //if the sender is not the current user
        ? sender.toString()
        : receiver.toString();
    let chatWithPartner = [];
    let unreadMessages = 0;
    // console.log(chat) 
    // return;
    /**find all chats the user has with the partner and put them together */
    for (let chat of allChats) {

      if (
        chat.receiver.toString() === partnerId ||
        chat.sender.toString() === partnerId
      ) {
        // to pick out the unread messages the partner sent to the user
        if (chat.sender.toString() === partnerId && !chat.read) {
          unreadMessages += 1;
        }
        chatWithPartner.push(chat);
        const chatIndex = allChats.indexOf(
          (chat) =>
            chat.receiver.toString() === partnerId ||
            chat.sender.toString() === partnerId
        );
        const deletedChat = allChats.splice(chatIndex, 1); //delete the chat so it wont be looped again
      }
    }
    sortedChats.push({ unreadMessages, chatWithPartner });
  }
  res.status(StatusCodes.OK).json({ data: sortedChats });
};

// const getAllChatsOfAUser = async (req, res, next) => {
//     const { userId } = req.payload;

//     /**Get all chats where the user is a participant sorted by date*/
//     const allChats = await Chat.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     }).sort({ createdAt: -1 });
//     const sortedChats = []; //the finally sorted chats array will be returned to the caller
//     /**loop through the chats and separate chat he has with different users */

//     for (let i = 0; i < allChats.length; i++) {
//       let chat = allChats[i]; //a particular chat object from allChats array(array of chat objects)
//       let { receiver, sender } = chat;
//       const currentUserId = new mongoose.Types.ObjectId(userId);
//       const partnerId = (sender === currentUserId) ? receiver : sender;
//       /**check if the partner and the user chats have been added to the sortedChats already */
//       if (
//         sortedChats.some(
//           (chat) => chat.receiver === partnerId || chat.sender === partnerId
//         )
//       )
//         continue; //skip the loop if the chat with the partner is already in the sortedChats

//       //the chat with the partner here will be added to the chat with the partner
//       let chatWithPartner = allChats.find(
//         (chat) => (chat.sender.equals(currentUserId) && chat.receiver.equals(partnerId)) || (chat.sender.equals(partnerId) && chat.receiver.equals(currentUserId))
//       );

//       if (chatWithPartner !== null) {
//         sortedChats.push(chatWithPartner);
//       }
//     }
//     res.status(StatusCodes.OK).json({ data: sortedChats });
//   };

const getAllChatsWithOtherUsers = async (req, res, next) => {
  const { userId } = req.payload;

  // Find all chats where the user is either the sender or receiver
  const allChats = await Chat.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: 1 });

  // Group the chats by the other user's ID
  const chatsByUser = allChats.reduce((accumulator, chat) => {
    // Get the ID of the other user in the chat
    const otherUserId =
      chat.sender.toString() === userId ? chat.receiver : chat.sender;

    // If the other user already has a group of chats, add the current chat to that group
    if (accumulator[otherUserId]) {
      accumulator[otherUserId].push(chat);
    }
    // If the other user doesn't have a group of chats yet, create a new group with the current chat
    else {
      accumulator[otherUserId] = [chat];
    }

    return accumulator;
  }, {});

  // Sort each group of chats by date
  Object.keys(chatsByUser).forEach((userId) => {
    chatsByUser[userId].sort((a, b) => a.createdAt - b.createdAt);
  });

  res.status(StatusCodes.OK).json({ data: chatsByUser });
};

const getUserChatsWithAnotherUser = async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const { friendId } = req.params;
    /**find the chats between the two users  */
    const chatsBetweenTheUsers = await Chat.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    }).sort({ createdAt: -1 });
    /**update all the read values of the chats where the user is the recipient to true */

    const chatIds = chatsBetweenTheUsers
      .filter(
        (chatObject) => chatObject.receiver.toString() === userId.toString() //return chat object where user is the receiver
      )
      .map((chatObject) => chatObject._id.toString()); //return only the string chat id of the chats
    if (chatIds.length > 0) {
      const result = await Chat.updateMany(
        { _id: { $in: chatIds } },
        { $set: { read: true } }
      );
    }
    res.status(StatusCodes.OK).json({ data: chatsBetweenTheUsers });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = {
  createChat,
  getUserChatsWithAnotherUser,
  getAllChatsOfAUser,
};
