export interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "provider" | "admin";
  avatar?: string;
  phone?: string;
  createdAt: Date;
  token?: string; // JWT token for authenticated requests
  department?: string; // Add department field
  departmentId?: object; // Add departmentId field
}

export interface Complaint {
  id: string;
  _id: string; // MongoDB document ID
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  location: Location;
  submittedBy: string;
  assignedTo?: string;
  attachments: Attachment[];
  isEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rating?: number;
  feedback?: string;
  updates: ComplaintUpdate[];
  department?: string; // Add department field
  departmentId?: object; // Add departmentId field
}

export interface ComplaintUpdate {
  id: string;
  message: string;
  attachments?: Attachment[];
  createdBy: string;
  createdAt: Date;
  type: "status_change" | "progress_update" | "message";
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video" | "document";
  size: number;
}

export type Location =
  | {
      latitude: number;
      longitude: number;
      address: string;
      city: string;
      region: string;
    }
  | {
      type: "Point";
      coordinates: [number, number];
      address: string;
      city: string;
      region: string;
    };

export type ComplaintCategory =
  | "electricity"
  | "water"
  | "roads"
  | "sanitation"
  | "street_lights"
  | "drainage"
  | "public_transport"
  | "other";

export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "closed";

export type Priority = "low" | "medium" | "high" | "critical";

export interface Department {
  id: string;
  name: string;
  category: ComplaintCategory[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  staff: User[];
}

export interface Task {
  id: string;
  complaintId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: "pending" | "in_progress" | "completed";
  priority: Priority;
  dueDate: Date;
  equipment?: string[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  totalComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  complaintsByCategory: Record<ComplaintCategory, number>;
  complaintsByStatus: Record<ComplaintStatus, number>;
  monthlyTrends: Array<{
    month: string;
    complaints: number;
    resolved: number;
  }>;
}
