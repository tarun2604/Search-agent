declare module '../data/doctors.json' {
  interface Specialty {
    name: string;
  }

  interface Address {
    locality: string;
    city: string;
    address_line1: string;
    location: string;
    logo_url: string;
  }

  interface Clinic {
    name: string;
    address: Address;
  }

  interface Doctor {
    id: string;
    name: string;
    name_initials: string;
    photo: string;
    doctor_introduction: string;
    specialities: Specialty[];
    fees: string;
    experience: string;
    languages: string[];
    clinic: Clinic;
    video_consult: boolean;
    in_clinic: boolean;
  }

  const doctors: Doctor[];
  export default doctors;
} 