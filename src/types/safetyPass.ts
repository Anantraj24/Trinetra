export interface SafetyPass {
  uid: string;
  name: string;
  phone: string;
  emergencyContact: string;
  bloodGroup: string;
  medicalNote?: string;
  expiryDate: string; // ISO string
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
