
export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  license_number?: string;
  hospital_affiliation?: string;
}

export interface AuthContextType {
  currentDoctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}
