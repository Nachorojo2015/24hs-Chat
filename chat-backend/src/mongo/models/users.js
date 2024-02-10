import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    "user-image": {
        type: String
    },
    message: {
        type: Array
    },
    time: {
        type: String
    }
})

export const usersModel = mongoose.model("users",messagesSchema)