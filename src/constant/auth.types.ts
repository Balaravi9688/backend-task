export interface AuthRequestBody {
  name?: string;
  email: string;
  password: string;
}

export interface LOGINRequestBody {
  email: string;
  password: string;
}
