import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ProfileRepository, ProfileService, ProfileResolver],
})
export class ProfileModule {}
