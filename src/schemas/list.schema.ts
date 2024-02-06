import { Schema } from "mongoose";

export const ListSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    boardRef: {
        type: Schema.Types.ObjectId,
        ref: 'Board'
    },
    status: {
        type: String,
        default: 'active'
    }
},{
    timestamps: false,
    versionKey: false
})