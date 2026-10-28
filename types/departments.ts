// types/department.ts

export interface Branch {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  type: "Undergraduate" | "Postgraduate" | "Ph.D" | "Diploma";
  name: string; // e.g., "B.Tech", "M.Tech"
  branches: Branch[];
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  imageUrl: string;
  qualification: string;
  specialization: string;
  email: string;
  expertise?: string;
}

export interface Lab {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface HOD {
  name: string;
  message: string;
  imageUrl: string;
}

export interface Department {
  id: string;
  slug: string; // Used for routing (e.g., "computer-science")
  name: string;
  iconUrl: string;
  coverImageUrl: string;
  about: string;
  hod: HOD;
  courses: Course[];
  faculty: Faculty[];
  labs: Lab[];
}
