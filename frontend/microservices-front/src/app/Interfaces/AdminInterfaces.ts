export interface UserDto {
  id: number;
  email: string;
  password?: string;
  role: string;
  archived: boolean;
}

export interface UserPageResponse {
  content: UserDto[];
  number?: number;
  page?: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
