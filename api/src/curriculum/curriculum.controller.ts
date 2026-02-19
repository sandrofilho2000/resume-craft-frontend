import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CurriculumService } from './curriculum.service';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';

interface AuthRequest extends Request {
  user: { userId: number; email: string };
}

@UseGuards(AuthGuard('jwt'))
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService) {}

  @Get()
  async getMine(@Req() req: AuthRequest) {
    return this.curriculum.getByUserId(req.user.userId);
  }

  @Put()
  async updateMine(@Req() req: AuthRequest, @Body() body: UpdateCurriculumDto) {
    return this.curriculum.upsert(req.user.userId, body.data);
  }
}
