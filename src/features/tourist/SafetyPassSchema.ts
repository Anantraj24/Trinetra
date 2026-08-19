import { z } from 'zod';

export const safetyPassSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(7, 'Please enter a valid phone number').max(20, 'Phone number is too long'),
  emergencyContact: z.string().min(7, 'Please enter a valid emergency contact number').max(20, 'Contact number is too long'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], {
    message: 'Please select a valid blood group'
  }),
  medicalNote: z.string().max(500, 'Medical note cannot exceed 500 characters').optional().or(z.literal('')),
});

export type SafetyPassFormData = z.infer<typeof safetyPassSchema>;
