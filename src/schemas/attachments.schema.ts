import { Schema } from "mongoose";

export const AttachmentSchema = new Schema({
    listId: {
        type: Schema.Types.ObjectId,
        ref: 'List'
    },
    filename: {
        type: String,
        required: true
    }
})