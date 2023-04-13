const mongoose = require("mongoose");
const { Chat, User } = require("../models");
const { StatusCodes } = require("http-status-codes");

const { chatSchema } = require("../utils/joiSchema");

//changed some stuff in the function, the request body should be receiving just the content of the message
//and we have to append the receiver "name" or "username" to the route, so we can fetch the receiver id
//after the success, the user should be redirected back to the in-chat

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
    if (error) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send(validation.error.details[0].message);
      return;
    }

    value.sender = userId;
    const { sender, receiver } = value;

    // add the new message to the database
    await Chat.create(value);

    /**find all the chats between the two users where
     * the sender is either the receiver or sender */
    const chatBetweenTheUsers = await Chat.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: -1 }); // sort by created time

    // returning the entire chat history between the sender and the receiver to the sender
    res.status(200).json({ data: chatBetweenTheUsers });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
};

//if any chat is started we should add the receiver id to the authenticated user as a friend
// so we'll just fetch the friend field to get all chats

//This route will be executed whenever a user hit the chat page
const getAllChatsOfAUser = async (req, res, next) => {
  const { userId } = req.payload;
  const allChats = await Chat.find({
    $or: [{ sender: userId }, { receiver: userId }],
  });
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
