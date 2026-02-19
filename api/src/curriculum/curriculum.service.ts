import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  getByUserId(userId: number) {
    return this.prisma.curriculum.findUnique({ where: { userId } });
  }

  upsert(userId: number, data: Record<string, unknown>) {
    return this.prisma.curriculum.upsert({
      where: { userId },
      create: { userId, data },
      update: { data },
    });
  }
}
