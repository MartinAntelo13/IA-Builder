import { z } from 'zod';

export const MEMBER_STATUSES = ['active', 'disabled', 'invited'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const memberSchema = z.object({
  jobTitle: z.string().trim().max(100, 'Máximo 100 caracteres'),
  departmentId: z.string().nullable(),
  managerId: z.string().nullable(),
  roleCodes: z.array(z.string()).min(1, 'Elegí al menos un rol'),
  status: z.enum(MEMBER_STATUSES),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
