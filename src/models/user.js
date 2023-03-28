const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        lowerCase: true,
        required: [true, 'first name is required'],
        min: 2
    },
    lastName: {
        type: String,
        lowerCase: true,
        required: [true, 'last name is required'],
        min: 2
    },
    email:{
        type: String,
        required: [true, 'email is required'],
        unique: true, // `email` must be unique
        match: /.+\@.+\..+/,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: [true, 'phone number is required'],
        min: 10
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        min: 6
    },
    username:{ //generating a unique username for the user
        type: String,
        required: [true,'please enter a unique username'],
        unique:true
    },
    role:{
        type: String,
        enum: ['admin', 'tutor', 'learner'],
        default: 'learner'
    },
    isActive: {
        type: Boolean,
        default: false
    }
})
const User = mongoose.model('User',userSchema)

module.exports = User
