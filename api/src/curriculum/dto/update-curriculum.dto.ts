import { IsObject } from 'class-validator';

export class UpdateCurriculumDto {
  @IsObject()
  data: Record<string, unknown>;
}
