import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskType = 'Add' | 'Remove' | 'Move' | 'Adjust Facing' | 'Reset Shelf' | 'Update Label' | 'Install Fixture';
export type Priority = 'High' | 'Medium' | 'Low';

export interface ExecutionTask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  skuName?: string;
  skuId?: string;
  fromPosition?: string;
  toPosition?: string;
  fromFacings?: number;
  toFacings?: number;
  priority: Priority;
  reason: string;
  impact: string;
  status: TaskStatus;
  assignedTo: string | null;
  assignedToName?: string;
  dueDate: string | null;
  storeName: string;
  storeGroup: string;
  pogName: string;
  category: string;
  createdAt: string;
  localizationId: string;
  source?: 'AI POG Audit' | 'Localization Engine' | 'Broadcast' | 'Manual' | 'Field Signal' | 'BOH Alert';
  sourceLink?: string;
  fieldSignalId?: string;
  slaHours?: number;
  severityRationale?: string;
  confidenceScore?: number;
  beforeImage?: string;
  afterImage?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ExecutionTasksContextType {
  tasks: ExecutionTask[];
  addTasks: (newTasks: ExecutionTask[]) => void;
  updateTask: (taskId: string, updates: Partial<ExecutionTask>) => void;
  assignTask: (taskId: string, memberId: string, memberName: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  getTasksByLocalization: (localizationId: string) => ExecutionTask[];
  teamMembers: TeamMember[];
}

const teamMembers: TeamMember[] = [
  { id: 'user-1', name: 'John Smith', role: 'Store Manager', avatar: 'JS' },
  { id: 'user-2', name: 'Sarah Johnson', role: 'Merchandiser', avatar: 'SJ' },
  { id: 'user-3', name: 'Mike Chen', role: 'Stock Associate', avatar: 'MC' },
  { id: 'user-4', name: 'Emily Davis', role: 'Regional Lead', avatar: 'ED' },
  { id: 'user-5', name: 'Alex Rivera', role: 'Field Rep', avatar: 'AR' },
];

const ExecutionTasksContext = createContext<ExecutionTasksContextType | undefined>(undefined);

export const ExecutionTasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);

  const addTasks = (newTasks: ExecutionTask[]) => {
    setTasks(prev => [...newTasks, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<ExecutionTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const assignTask = (taskId: string, memberId: string, memberName: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, assignedTo: memberId, assignedToName: memberName } : task
    ));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const getTasksByLocalization = (localizationId: string) => {
    return tasks.filter(task => task.localizationId === localizationId);
  };

  return (
    <ExecutionTasksContext.Provider value={{
      tasks,
      addTasks,
      updateTask,
      assignTask,
      updateTaskStatus,
      getTasksByLocalization,
      teamMembers,
    }}>
      {children}
    </ExecutionTasksContext.Provider>
  );
};

export const useExecutionTasks = () => {
  const context = useContext(ExecutionTasksContext);
  if (!context) {
    throw new Error('useExecutionTasks must be used within an ExecutionTasksProvider');
  }
  return context;
};
