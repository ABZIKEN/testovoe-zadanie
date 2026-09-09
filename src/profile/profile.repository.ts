import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOwner() {
    // A single bounded aggregate: relation queries stay constant as rows grow.
    return this.prisma.profile.findUnique({
      where: { id: 'abzal-alanov' },
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
        skills: { orderBy: { sortOrder: 'asc' } },
        projects: { orderBy: { sortOrder: 'asc' } },
        experience: {
          orderBy: { sortOrder: 'asc' },
          include: { achievements: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
  }
}
