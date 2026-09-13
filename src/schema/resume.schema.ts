import { z } from 'zod';

const locationSchema = z.object({
  city: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
});

const profileSchema = z.object({
  network: z.string(),
  username: z.string().optional(),
  url: z.string().url().or(z.string().min(1)),
});

const basicsSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  image: z.string().optional(),
  location: locationSchema.optional(),
  profiles: z.array(profileSchema).default([]),
});

const euMetadataSchema = z.object({
  workAuthorization: z.string().optional(),
  noticePeriod: z.string().optional(),
  relocationReady: z.boolean().optional(),
  /** Free-text relocation note (shown in EU banner when set). */
  relocation: z.string().optional(),
  preferredLocations: z.array(z.string()).default([]),
  degreeRecognition: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

const workSchema = z.object({
  name: z.string(),
  position: z.string(),
  url: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional().default(''),
  location: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

const educationSchema = z.object({
  institution: z.string(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([]),
});

const languageSchema = z.object({
  language: z.string(),
  fluency: z.string(),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const resumeSchema = z.object({
  basics: basicsSchema,
  euMetadata: euMetadataSchema.optional(),
  skills: z.array(skillSchema).default([]),
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  projects: z.array(projectSchema).default([]),
});

export type ResumeData = z.infer<typeof resumeSchema>;

export function parseResume(data: unknown): ResumeData {
  return resumeSchema.parse(data);
}
