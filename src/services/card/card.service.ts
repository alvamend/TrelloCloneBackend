import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';
import { CardCreateDto } from 'src/dto/card/card.create.dto';
import { CardEditDto } from 'src/dto/card/card.edit.dto';
import { CardMemberManagement } from 'src/dto/card/card.member.dto';
import { CardInterface } from 'src/interfaces/card.interface';
import { UserInterface } from 'src/interfaces/user.interface';
import { StorageService } from '../storage/storage.service';
import { CardAddTaskDto } from 'src/dto/card/card.add.task.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectModel('Card') private Card: Model<CardInterface>,
    @InjectModel('User') private User: Model<UserInterface>,
  ) {}

  create = async (body: CardCreateDto, req: Request): Promise<Object> => {
    try {
      const createdCard = await this.Card.create({
        title: body.title,
        description: body?.description,
        listRef: body.listRef,
        members: [
          {
            user: req.user['sub'],
          },
        ],
      });
      if (createdCard)
        return { message: 'card was created', card: createdCard };
    } catch (error) {
      throw error;
    }
  };

  edit = async (id: string, body: CardEditDto) => {
    try {
      const editedCard = await this.Card.findOneAndUpdate(
        { _id: id },
        {
          title: body?.title,
          description: body?.description,
          status: body?.status,
          listRef: body?.listRef,
          cover: body?.cover,
          dueDate: body?.dueDate,
        },
      );

      if (!editedCard)
        throw new InternalServerErrorException('card could not be updated');
      return { message: 'card updated' };
    } catch (error) {
      throw error;
    }
  };

  getAllFromList = async (
    listId: string,
    cardStatus: string,
  ): Promise<CardInterface[]> => {
    if (listId.length !== 24) throw new NotFoundException('invalid id');
    try {
      const cards = await this.Card.find({
        listRef: listId,
        status: cardStatus,
      });
      if (!cards)
        throw new InternalServerErrorException('could not retrieve cards');

      return cards;
    } catch (error) {
      throw error;
    }
  };

  retrieveCard = async (idCard: string) => {
    try {
      const id = new mongoose.Types.ObjectId(idCard);
      const card = await this.Card.aggregate([
        {
          $match: { _id: id },
        },
        {
          $lookup: {
            from: 'users',
            foreignField: '_id',
            localField: 'members.user',
            as: 'membersInfo',
          },
        },
        {
          $lookup: {
            from: 'lists',
            foreignField: '_id',
            localField: 'listRef',
            as: 'listInfo',
          },
        },
        {
          $unwind: '$listInfo',
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            cover: 1,
            status: 1,
            listInfo: 1,
            attachments: 1,
            taskList: 1,
            members: {
              $map: {
                input: '$members',
                as: 'member',
                in: {
                  user: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$membersInfo',
                          as: 'info',
                          cond: { $eq: ['$$info._id', '$$member.user'] },
                        },
                      },
                      0,
                    ],
                  },
                  _id: '$$member._id',
                },
              },
            },
          },
        },
        {
          $project: {
            'members.user.password': 0,
            'members.user.role': 0,
            'members.user.bio': 0,
          },
        },
      ]);

      if (card.length === 0) throw new NotFoundException('card does not exist');
      return card[0];
    } catch (error) {
      throw error;
    }
  };

  addMember = async (id: string, body: CardMemberManagement) => {
    try {
      // We need to get the card information to manage the members, there's no need to validate if the card exists, that's already done in the guard
      const card: any = await this.getBoardFromCard(id);

      // Get the user information to validate if it exists
      const userExists: UserInterface = await this.User.findOne({
        email: body.email,
      });
      if (!userExists) throw new NotFoundException('user does not exist');

      //   We need to validate if the user we want to add is part of the board, ONLY BOARD members can be added, otherwise, user MUST add the user to the board first
      let userABoardMember: boolean = false;
      card.boardInfo.members.forEach((member) => {
        if (member.user.valueOf() === userExists._id.valueOf()) {
          userABoardMember = true;
        }
      });

      if (!userABoardMember)
        throw new BadRequestException(
          'user MUST be part of the board to be added',
        );

      // we need to check if the user we want to add is already part of the members
      let userAlreadyAMember: boolean = false;
      card.members.forEach((member) => {
        if (member.user.valueOf() === userExists._id.valueOf()) {
          userAlreadyAMember = true;
        }
      });

      //Add the user to the array of members, in case is not a member yet
      if (userAlreadyAMember)
        throw new BadRequestException('user is already part of the card');
      card.members.push({
        user: userExists._id,
      });

      //   Save the changes!
      //     first, we need to convert the aggregate to a mongoose document
      const documentToSave = new this.Card(card);

      //   Then, just call findbyidandupdate, passing id and we want to update members
      await this.Card.findByIdAndUpdate(documentToSave._id, {
        members: documentToSave.members,
      });

      return { message: 'user added successfully' };
    } catch (error) {
      throw error;
    }
  };

  removeMember = async (id: string, body: CardMemberManagement) => {
    try {
      // Get the user information to validate if it exists
      const userExists: UserInterface = await this.User.findOne({
        email: body.email,
      });
      if (!userExists) throw new NotFoundException('user does not exist');

      //   Get card information to check all members, card existance validation was already done in the guard
      const card: CardInterface = await this.Card.findOne({ _id: id });

      let userIsAMember: boolean = false;
      card.members.forEach((member) => {
        if (member.user.valueOf() === userExists._id.valueOf()) {
          userIsAMember = true;
        }
      });

      //   If user is not a member, it's ok, we can return simply a 200 request
      if (!userIsAMember)
        return { message: 'user is not a member of the card' };

      // If user is a member we need to create a new array without the current user, who is the one we want to delete
      const newMembers = card.members.filter((member) => {
        return member.user.valueOf() !== userExists._id.valueOf();
      });

      await card.updateOne({
        members: newMembers,
      });

      return { message: 'user removed from the card' };
    } catch (error) {
      throw error;
    }
  };

  delete = async (id: string): Promise<Object> => {
    try {
      const deletedCard = await this.Card.findOneAndDelete({ _id: id });
      if (deletedCard) return { message: 'card deleted' };
    } catch (error) {
      throw error;
    }
  };

  addTask = async (id: string, body: CardAddTaskDto): Promise<Object> => {
    try {
      // Get the card from the DB
      const card = await this.Card.findOne({ _id: id });
      if (!card) throw new NotFoundException('card does not exist');

      // Push the task array to add the new one
      card.taskList.push({
        task: body.task,
      });

      await card.save();
      return { message: 'task added to the card' };
    } catch (error) {
      throw error;
    }
  };

  deleteTask = async (cardId: string, taskId: string) => {
    try {
      const card = await this.Card.findOne({ _id: cardId });
      const newTaskArray = card.taskList.filter(
        (task) => task['_id'].valueOf() !== taskId,
      );

      await card.updateOne({
        taskList: newTaskArray,
      });

      return { message: 'task deleted' };
    } catch (error) {
      throw error;
    }
  };

  private getBoardFromCard = async (idCard: string) => {
    const id = new mongoose.Types.ObjectId(idCard);
    const cardExists = await this.Card.aggregate([
      {
        $match: { _id: id },
      },
      {
        $lookup: {
          from: 'lists',
          localField: 'listRef',
          foreignField: '_id',
          as: 'listInfo',
        },
      },
      {
        $unwind: '$listInfo',
      },
      {
        $lookup: {
          from: 'boards',
          localField: 'listInfo.boardRef',
          foreignField: '_id',
          as: 'boardInfo',
        },
      },
      {
        $unwind: '$boardInfo',
      },
    ]);

    return cardExists[0];
  };
}
