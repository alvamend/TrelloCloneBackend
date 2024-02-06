import { BoardSchema } from "src/schemas/board.schema";
import { ListSchema } from "src/schemas/list.schema";
import { UserSchema } from "src/schemas/user.schema";
import { WorkspaceSchema } from "src/schemas/workspace.schema";

export const AppSchemas = [
    {
        name: 'User',
        schema: UserSchema
    },{
        name: 'Workspace',
        schema: WorkspaceSchema
    },{
        name: 'Board',
        schema: BoardSchema
    },{
        name: 'List',
        schema: ListSchema
    }
]