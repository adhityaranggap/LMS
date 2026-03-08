export interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  avgQuizScore: number | null;
  ungradedEssays: number;
}

export interface StudentRow {
  student_id: string;
  created_at: string;
  course_id: string | null;
  last_login: string | null;
  modules_visited: number;
  avg_score: number | null;
}

export interface LoginSession {
  student_id: string;
  photo: string | null;
  login_time: string;
}

export type SortKey = 'student_id' | 'last_login' | 'modules_visited' | 'avg_score';
export type SortDir = 'asc' | 'desc';

export type SidebarTab = 'dashboard' | 'students' | 'history' | 'content' | 'face' | 'scoreboard' | 'audit' | 'fraud' | 'lecturers';

export interface FaceStatusRow {
  student_id: string;
  is_face_registered: number;
  created_at: string;
  face_registered_at: string | null;
  descriptor_count: number;
}

export interface LecturerAccount {
  id: number;
  username: string;
  display_name: string;
  password_changed_at: string | null;
  created_at: string;
}

export interface ScoreboardRow {
  rank: number;
  student_id: string;
  course_id: string | null;
  quiz_avg: number;
  modules_visited: number;
  lab_activity: number;
  login_count: number;
  case_count: number;
  composite_score: number;
}

export interface FaceMismatchLog {
  student_id: string;
  distance: number;
  matched: number;
  attempt_number: number;
  created_at: string;
}
