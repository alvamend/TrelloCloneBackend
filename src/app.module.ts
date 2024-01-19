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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    MongooseModule.forRoot(process.env.DB_QUERY),
    MongooseModule.forFeature(AppSchemas)
  ],
  controllers: [AppController, UserController, AuthController, AdminController],
  providers: [AppService, UserService, AuthService, AdminService],
})
export class AppModule {}
