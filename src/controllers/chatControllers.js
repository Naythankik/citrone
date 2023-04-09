const mongoose = require('mongoose');
const {Chat, User} = require('../models')
const { StatusCodes } = require("http-status-codes");

const { chatSchema } = require("../utils/joiSchema");

const createChat = async (req, res, next) => {
    /**validate the data sent from the client
     * the two usersId (sender and receiver) will
     * be sent together with the text and all chats between the
     * two users will be returned back to the sender */ 
    // later the code will be modified that the userId will be
    // gotten from the user payload instead from the client
  try {
    const validation = chatSchema(req.body);
    const { value, error } = validation;
    if (error) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send(validation.error.details[0].message);
      return;
    }
    const { sender, receiver } = value;
    // add the new message to the database
     await Chat.create({...value});
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
}

const getUserChatsWithAnotherUser = async( req, res, next)=>{
    /**find the chats between the two users  */
    const chatBetweenTheUsers = await Chat.find({
      $or: [
        { sender: req.sender, receiver: req.receiver },
        { sender: userBId, receiver: userAId },
      ],
    }).sort({ createdAt: -1 });
}

module.exports = {createChat}