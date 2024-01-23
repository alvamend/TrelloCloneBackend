import { Schema } from "mongoose";

export const BoardSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    workspaceRef: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        boardRole: {
            type: String,
        }
    }],
    privacy: {
        type: String,
        default: 'private'
    },
    background: {
        type: String,
        default: '#ffffff'
    }
},{
    timestamps: false,
    versionKey: false
})