import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { AppSchemas } from './config/schemas';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { AdminService } from './services/admin/admin.service';
import { AdminController } from './controllers/admin/admin.controller';
import { BoardService } from './services/board/board.service';
import { BoardController } from './controllers/board/board.controller';
import { WorkspaceService } from './services/workspace/workspace.service';
import { WorkspaceController } from './controllers/workspace/workspace.controller';
import { ListService } from './services/list/list.service';
import { ListController } from './controllers/list/list.controller';
import { CardService } from './services/card/card.service';
import { CardController } from './controllers/card/card.controller';
import { StorageService } from './services/storage/storage.service';
import { AttachmentService } from './services/attachment/attachment.service';
import { AttachmentController } from './controllers/attachment/attachment.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    MongooseModule.forRoot(process.env.DB_QUERY),
    MongooseModule.forFeature(AppSchemas),
  ],
  controllers: [AppController, UserController, AuthController, AdminController, BoardController, WorkspaceController, ListController, CardController, AttachmentController],
  providers: [AppService, UserService, AuthService, AdminService, BoardService, WorkspaceService, ListService, CardService, StorageService, AttachmentService],
})
export class AppModule {}
