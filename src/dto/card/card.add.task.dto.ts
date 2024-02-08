import { IsNotEmpty } from "class-validator";

export class CardAddTaskDto{
    @IsNotEmpty({message: 'task cannot be empty'})
    task: string;
}