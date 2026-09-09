import { Controller, Get, Redirect, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Redirect('/graphql', 302)
  root(): void {}

  @Get('health')
  async health(): Promise<{ status: string }> {
    try {
      const profile = await this.prisma.profile.findUnique({ where: { id: 'abzal-alanov' }, select: { id: true } });
      if (!profile) throw new Error('Missing profile');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database or profile unavailable');
    }
  }
}
