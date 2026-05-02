// ============================================================
// TeamFlow Shared Types
// Used across all frontend features for type safety
// ============================================================

/** Represents a team member / user */
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}

/** Task priority levels */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Task workflow statuses */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

/** A single task on the Kanban board */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assignees: Pick<User, 'id' | 'displayName' | 'avatarUrl'>[];
}

/** A project containing tasks */
export interface Project {
  id: string;
  name: string;
  description: string;
}

/** A chat channel */
export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
}

/** A chat message */
export interface Message {
  id: string;
  content: string;
  authorId: string;
  author: Pick<User, 'displayName' | 'avatarUrl'>;
  createdAt: string;
  channelId: string;
}

/** Kanban board column definition */
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

/** Navigation item in sidebar */
export interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  badge?: string | number;
}
