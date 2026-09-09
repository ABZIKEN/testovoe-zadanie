import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async getProfile() {
    const profile = await this.repository.findOwner();
    if (!profile) throw new ServiceUnavailableException('Profile has not been initialized');
    return {
      ...profile,
      experience: profile.experience.map(({ achievements, ...job }) => ({
        ...job,
        achievements: achievements.map(({ text }) => text),
      })),
    };
  }
}
