import { Schema } from "mongoose";

export const WorkspaceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    privacy: {
        type: String,
        default: 'private'
    },
    members: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        workspaceRole: {
            type: String,
            default: 'administrator'
        }
    }]
},{
    timestamps: false,
    versionKey: false
})