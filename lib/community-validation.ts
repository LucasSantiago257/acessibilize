import { z } from 'zod';

export const featureKeys = ['ramp', 'stepFree', 'accessibleToilet', 'reservedParking', 'tactilePaving', 'braille', 'audioDescription', 'visualGuidance', 'libras', 'captions', 'visualAlerts', 'hearingLoop'] as const;
const status = z.enum(['present', 'partial', 'absent', 'unknown']);
const features = z.record(z.enum(featureKeys), status).default({});
const rating = z.number().int().min(1).max(5).nullable().optional();
const ratings = z.object({ physical: rating, visual: rating, hearing: rating }).strict().default({});
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const parsed = new Date(v + 'T12:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v && v >= '2000-01-01' && v <= new Date().toISOString().slice(0, 10);
}, 'Informe uma data de visita válida, até hoje.');

export const reportSchema = z.object({
  id: z.string().uuid(),
  placeId: z.string().min(1).max(100),
  authorName: z.string().trim().min(2).max(50),
  visitedAt: date,
  features,
  ratings,
  observation: z.string().trim().max(1500),
}).strict().refine(v => Object.values(v.features).some(s => s !== 'unknown') || Object.values(v.ratings).some(n => n != null), 'Dê uma nota ou informe ao menos um recurso observado.');

export const placeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3).max(100),
  category: z.enum(['Cultura e lazer', 'Parques e praças', 'Compras', 'Serviços', 'Alimentação']),
  area: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(200),
  lat: z.number().finite().min(-13.1).max(-12.7),
  lng: z.number().finite().min(-38.65).max(-38.25),
}).strict();
