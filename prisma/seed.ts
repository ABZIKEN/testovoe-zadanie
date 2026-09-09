import { PrismaClient } from '@prisma/client';
import { profileData } from './profile.data';

export async function seed(prisma: PrismaClient): Promise<void> {
  const { id, name, description, links, skills, projects, experience } = profileData;
  // One transaction makes the owned aggregate replacement atomic and repeatable.
  await prisma.$transaction(async (tx) => {
    await tx.profile.upsert({ where: { id }, create: { id, name, description }, update: { name, description } });
    await tx.professionalLink.deleteMany({ where: { profileId: id } });
    await tx.skill.deleteMany({ where: { profileId: id } });
    await tx.project.deleteMany({ where: { profileId: id } });
    await tx.experience.deleteMany({ where: { profileId: id } });
    await tx.profile.update({
      where: { id },
      data: {
        links: { create: links.map((link, sortOrder) => ({ ...link, sortOrder, id: `${id}-link-${sortOrder}` })) },
        skills: { create: skills.map((name, sortOrder) => ({ name, sortOrder, id: `${id}-skill-${sortOrder}` })) },
        projects: { create: projects.map((project, sortOrder) => ({ ...project, sortOrder, id: `${id}-project-${sortOrder}` })) },
        experience: { create: experience.map(({ achievements, ...job }, sortOrder) => ({
          ...job, sortOrder, id: `${id}-job-${sortOrder}`,
          achievements: { create: achievements.map((text, index) => ({
            text, sortOrder: index, id: `${id}-job-${sortOrder}-achievement-${index}`,
          })) },
        })) },
      },
    });
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seed(prisma)
    .then(() => console.log('Profile seeded successfully'))
    .catch((error: unknown) => { console.error('Database seed failed:', error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
}
