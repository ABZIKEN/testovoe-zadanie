import { Query, Resolver } from '@nestjs/graphql';
import { Profile } from './profile.model';
import { ProfileService } from './profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}

  @Query(() => Profile, { description: 'Digital business card of Abzal Alanov' })
  profile(): Promise<Profile> { return this.service.getProfile(); }
}
