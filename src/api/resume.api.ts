// src/api/resume.api.ts

import type { Resume } from '@/types/resume.types';
import { http } from './http';

export type CreateResumeDTO = {
  name: string;
  job_title: string;
  company_name?: string;
};

export type EditResumeDTO = Partial<CreateResumeDTO>;

export async function getResumeById(id: number) {
  return http<Resume>(`/resume/${id}`);
}

export async function createResume(dto: CreateResumeDTO) {
  return http<Resume, CreateResumeDTO>(`/resume/create`, {
    method: 'POST',
    body: dto,
  });
}

export async function updateResume(id: number, dto: EditResumeDTO) {
  return http<Resume, EditResumeDTO>(`/resume/${id}`, {
    method: 'PATCH',
    body: dto,
  });
}
