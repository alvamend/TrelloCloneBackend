import { Schema } from "mongoose";

export const AttachmentSchema = new Schema({
    cardId: {
        type: Schema.Types.ObjectId,
        ref: 'List'
    },
    filename: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    description: {
        type: String,
        default: ''
    }
})