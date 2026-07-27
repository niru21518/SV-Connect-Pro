export interface RegistrationData {
  fullName: string;
  fatherName: string;

  // Existing DOB field (Keep for compatibility if still used elsewhere)
  dob: string;

  // New V2 DOB fields
  dobDay: string;
  dobMonth: string;
  dobYear: string;

  age: number;

  gender: 'Male' | 'Female' | 'Other';

  mobileNumber: string;

  state: string;
  district: string;
  villageTown: string;

  pinCode: string;

  qualification: string;

  occupation: string;

  // New V2 Dynamic Fields
  schoolCollege: string;
  companyName: string;
  businessDetails: string;

  preferredLanguage: 'Assamese' | 'Hindi' | 'English';

  declarationAccepted: boolean;
}

export interface RegistrationRecord extends RegistrationData {
  id: string;
  applicationId: string;
  createdAt: string;
  status?: string;
}

export interface IndianStateDistricts {
  [stateName: string]: string[];
}
