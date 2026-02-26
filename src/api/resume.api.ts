// src/api/resume.api.ts

import { ContactSection } from '@/types/contact.types';
import { EducationSection } from '@/types/education.types';
import { ExperienceSection } from '@/types/experience.types';
import { LanguagesSection } from '@/types/languages.types';
import { ProfileSection } from '@/types/profile.types';
import { ProjectsSection } from '@/types/projects.types';
import type { Resume } from '@/types/resume.types';
import { SkillsSection } from '@/types/skills.types';
import { http } from './http';

export type CreateResumeDTO = {
  name: string;
  job_title?: string;
  company_name?: string;
};

export type CreateResumeResponse = {
  id: number;
  name: string;
  job_title: string;
  company_name: string;
};

export type ResumeBasicListItem = {
  id: number;
  name: string;
  header_name: string;
  job_title: string;
  company_name: string;
  meta_title: string;
  header_role: string;
  created_at: string;
};

export type ListResumesBasicParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type ResumeBasicListResponse = {
  items: ResumeBasicListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EditResumeDTO = Partial<CreateResumeDTO>;
export type EditContactDTO = Partial<ContactSection>;
export type EditProfileDTO = Partial<ProfileSection>;
export type EditSkillsDTO = Partial<SkillsSection>;
export type EditExperienceDTO = Partial<ExperienceSection>;
export type EditProjectsDTO = Partial<ProjectsSection>;
export type EditEducationDTO = Partial<EducationSection>;
export type EditLanguagesDTO = Partial<LanguagesSection>;

export async function listResumesBasic(params: ListResumesBasicParams = {}) {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (typeof params.page === 'number') search.set('page', String(params.page));
  if (typeof params.pageSize === 'number') search.set('pageSize', String(params.pageSize));

  const suffix = search.toString() ? `?${search.toString()}` : '';
  const data = await http<ResumeBasicListItem[] | ResumeBasicListResponse>(`/resume${suffix}`);

  // Backward-compatible normalization: supports old array response and new paginated response
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? (data.length || 10),
      totalPages: 1,
    } satisfies ResumeBasicListResponse;
  }

  return data;
}

export async function getResumeById(id: number, mode='') {
  let result = await http<Resume>(`/resume/${id}/${mode}`);
  let obj:any;
  if (mode !== 'header' && mode) {
    obj = {}
    const keyMap: Record<string, string> = {
      profile: 'profileSection',
      skills: 'skillSection',
      projects: 'projectsSection',
      education: 'educationSection',
      languages: 'languagesSection',
    };
    obj[keyMap[mode] ?? mode] = result
  } else {
    obj = result;
  }
  return obj  ;
}

export async function createResume(dto: CreateResumeDTO) {
  return http<CreateResumeResponse, CreateResumeDTO>(`/resume/create`, {
    method: 'POST',
    body: dto,
  });
}

export async function deleteResume(id: number) {
  return http<{ success?: boolean } | Resume | string>(`/resume/${id}`, {
    method: 'DELETE',
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

export async function editProfile(resumeId: number, dto: EditProfileDTO) {
  return http<ProfileSection, EditProfileDTO>(`/resume/${resumeId}/profile`, {
    method: 'POST',
    body: dto,
  });
}

export async function editSkills(resumeId: number, dto: EditSkillsDTO) {
  return http<SkillsSection, EditSkillsDTO>(`/resume/${resumeId}/skills`, {
    method: 'POST',
    body: dto,
  });
}

export async function editExperience(resumeId: number, dto: EditExperienceDTO) {
  return http<ExperienceSection, EditExperienceDTO>(`/resume/${resumeId}/experience`, {
    method: 'POST',
    body: dto,
  });
}

export async function editProjects(resumeId: number, dto: EditProjectsDTO) {
  return http<ProjectsSection, EditProjectsDTO>(`/resume/${resumeId}/projects`, {
    method: 'POST',
    body: dto,
  });
}

export async function editEducation(resumeId: number, dto: EditEducationDTO) {
  return http<EducationSection, EditEducationDTO>(`/resume/${resumeId}/education`, {
    method: 'POST',
    body: dto,
  });
}

export async function editLanguages(resumeId: number, dto: EditLanguagesDTO) {
  return http<LanguagesSection, EditLanguagesDTO>(`/resume/${resumeId}/languages`, {
    method: 'POST',
    body: dto,
  });
}
