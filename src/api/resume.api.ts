// src/api/resume.api.ts

import { ContactSection } from '@/types/contact.types';
import type { Resume } from '@/types/resume.types';
import { http } from './http';

export type CreateResumeDTO = {
  name: string;
  job_title: string;
  company_name?: string;
};

export type EditResumeDTO = Partial<CreateResumeDTO>;
export type EditContactDTO = Partial<ContactSection>;

export async function getResumeById(id: number, mode='') {
  let result = await http<Resume>(`/resume/${id}/${mode}`);
  let obj:any;
  if (mode !== 'header') {
    obj = {}
    obj[mode] = result
  } else {
    obj = result;
  }
  return obj  ;
}

export async function createResume(dto: CreateResumeDTO) {
  return http<Resume, CreateResumeDTO>(`/resume/create`, {
    method: 'POST',
    body: dto,
  });
}

export async function editResume(id: number, dto: EditResumeDTO, route="") {
  return http<Resume, EditResumeDTO>(`/resume/${id}/${route}`, {
    method: 'PATCH',
    body: dto,
  });
}

export async function editContact(resumeId: number, dto: EditContactDTO) {
  return http<ContactSection, EditContactDTO>(`/resume/${resumeId}/contact`, {
    method: 'PUT',
    body: dto,
  });
}
