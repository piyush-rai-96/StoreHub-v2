import React, { useState, useEffect } from 'react';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import OpenWithOutlined from '@mui/icons-material/OpenWithOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import LabelOutlined from '@mui/icons-material/LabelOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { Chips, Loader } from 'impact-ui';
import { useExecutionTasks, ExecutionTask as SharedExecutionTask } from '../context/ExecutionTasksContext';
import './StoreExecution.css';

// Types
type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
type TaskType = 'Add' | 'Remove' | 'Move' | 'Adjust Facing';
type Priority = 'High' | 'Medium' | 'Low';

interface ExecutionTask {
  id: string;
  type: TaskType;
  skuName: string;
  skuId: string;
  fromPosition: string;
  toPosition: string;
  fromFacings?: number;
  toFacings?: number;
  priority: Priority;
  reason: string;
  impact: string;
  status: TaskStatus;
  assignedTo: string | null;
  dueDate: string | null;
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  attachment?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const teamMembers: TeamMember[] = [
  { id: 'user-1', name: 'John Smith', role: 'Store Manager', avatar: 'JS' },
  { id: 'user-2', name: 'Sarah Johnson', role: 'Merchandiser', avatar: 'SJ' },
  { id: 'user-3', name: 'Mike Chen', role: 'Stock Associate', avatar: 'MC' },
  { id: 'user-4', name: 'Emily Davis', role: 'Regional Lead', avatar: 'ED' },
];

export const StoreExecution: React.FC = () => {
  const { tasks: sharedTasks, assignTask, updateTaskStatus: updateSharedTaskStatus, teamMembers: sharedTeamMembers } = useExecutionTasks();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<ExecutionTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | TaskStatus>('all');
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [expandedLocalizations, setExpandedLocalizations] = useState<string[]>([]);
  const [selectedLocalization, setSelectedLocalization] = useState<string | null>(null);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status } : t
    ));
  };

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'Add': return <Add sx={{ fontSize: 16 }}/>;
      case 'Remove': return <Remove sx={{ fontSize: 16 }}/>;
      case 'Move': return <OpenWithOutlined sx={{ fontSize: 16 }}/>;
      case 'Adjust Facing': return <TrackChangesOutlined sx={{ fontSize: 16 }}/>;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'In Progress': return 'in-progress';
      case 'Completed': return 'completed';
    }
  };

  const filteredTasks = tasks.filter(t => taskFilter === 'all' || t.status === taskFilter);

  // Combined tasks from shared context and local workflow
  const allTasks = [...sharedTasks, ...tasks];

  // Group shared tasks by localization ID
  const tasksByLocalization = sharedTasks.reduce((acc, task) => {
    const locId = task.localizationId;
    if (!acc[locId]) {
      acc[locId] = {
        id: locId,
        pogName: task.pogName,
        storeGroup: task.storeGroup,
        category: task.category,
        createdAt: task.createdAt,
        tasks: []
      };
    }
    acc[locId].tasks.push(task);
    return acc;
  }, {} as Record<string, { id: string; pogName: string; storeGroup: string; category: string; createdAt: string; tasks: SharedExecutionTask[] }>);

  const localizationGroups = Object.values(tasksByLocalization);

  const toggleLocalizationExpand = (locId: string) => {
    setExpandedLocalizations(prev => 
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId]
    );
  };

  const getSharedTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'Add': return <Add sx={{ fontSize: 16 }}/>;
      case 'Remove': return <Remove sx={{ fontSize: 16 }}/>;
      case 'Move': return <OpenWithOutlined sx={{ fontSize: 16 }}/>;
      case 'Adjust Facing': return <TrackChangesOutlined sx={{ fontSize: 16 }}/>;
      case 'Reset Shelf': return <RefreshOutlined sx={{ fontSize: 16 }}/>;
      case 'Update Label': return <LabelOutlined sx={{ fontSize: 16 }}/>;
      case 'Install Fixture': return <BuildOutlined sx={{ fontSize: 16 }}/>;
      default: return <InventoryOutlined sx={{ fontSize: 16 }}/>;
    }
  };

  const handleAssignTask = (taskId: string, memberId: string) => {
    const member = sharedTeamMembers.find(m => m.id === memberId);
    if (member) {
      assignTask(taskId, memberId, member.name);
    }
    setAssigningTaskId(null);
  };

  const renderTaskListTab = () => (
    <div className="exec-task-list-view">
      <div className="exec-task-list-header">
        <h3>All Execution Tasks</h3>
        <div className="exec-task-list-filters exec-task-list-filters--impact">
          <Chips
            label={`All (${allTasks.length})`}
            variant={taskFilter === 'all' ? 'filled' : 'outlined'}
            color={taskFilter === 'all' ? 'primary' : undefined}
            size="small"
            onClick={() => setTaskFilter('all')}
          />
          <Chips
            label={`Pending (${allTasks.filter(t => t.status === 'Pending').length})`}
            variant={taskFilter === 'Pending' ? 'filled' : 'outlined'}
            color={taskFilter === 'Pending' ? 'primary' : undefined}
            size="small"
            onClick={() => setTaskFilter('Pending')}
          />
          <Chips
            label={`In Progress (${allTasks.filter(t => t.status === 'In Progress').length})`}
            variant={taskFilter === 'In Progress' ? 'filled' : 'outlined'}
            color={taskFilter === 'In Progress' ? 'primary' : undefined}
            size="small"
            onClick={() => setTaskFilter('In Progress')}
          />
          <Chips
            label={`Completed (${allTasks.filter(t => t.status === 'Completed').length})`}
            variant={taskFilter === 'Completed' ? 'filled' : 'outlined'}
            color={taskFilter === 'Completed' ? 'primary' : undefined}
            size="small"
            onClick={() => setTaskFilter('Completed')}
          />
        </div>
      </div>

      {/* Localization Filter Dropdown */}
      {localizationGroups.length > 0 && (
        <div className="exec-localization-filter">
          <label>Filter by Localization:</label>
          <div className="exec-loc-dropdown">
            <button 
              className={`exec-loc-dropdown-trigger ${isLocDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
            >
              <span className="exec-loc-dropdown-value">
                {selectedLocalization 
                  ? `${localizationGroups.find(l => l.id === selectedLocalization)?.pogName} → ${localizationGroups.find(l => l.id === selectedLocalization)?.storeGroup}`
                  : `All Localizations (${localizationGroups.length})`
                }
              </span>
              <KeyboardArrowRight sx={{ fontSize: 16 }} className={`exec-loc-dropdown-icon ${isLocDropdownOpen ? 'rotated' : ''}`}/>
            </button>
            {isLocDropdownOpen && (
              <div className="exec-loc-dropdown-menu">
                <div 
                  className={`exec-loc-dropdown-item ${!selectedLocalization ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedLocalization(null);
                    setIsLocDropdownOpen(false);
                  }}
                >
                  <div className="exec-loc-dropdown-item-content">
                    <span className="exec-loc-dropdown-item-title">All Localizations</span>
                    <span className="exec-loc-dropdown-item-count">{localizationGroups.length} groups</span>
                  </div>
                  {!selectedLocalization && <CheckCircleOutlined sx={{ fontSize: 16 }} className="exec-loc-dropdown-check"/>}
                </div>
                {localizationGroups.map(loc => (
                  <div 
                    key={loc.id}
                    className={`exec-loc-dropdown-item ${selectedLocalization === loc.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedLocalization(loc.id);
                      setIsLocDropdownOpen(false);
                    }}
                  >
                    <div className="exec-loc-dropdown-item-content">
                      <span className="exec-loc-dropdown-item-title">{loc.pogName} → {loc.storeGroup}</span>
                      <div className="exec-loc-dropdown-item-meta">
                        <span className="exec-loc-dropdown-tag">{loc.category}</span>
                        <span className="exec-loc-dropdown-item-count">{loc.tasks.length} tasks</span>
                      </div>
                    </div>
                    {selectedLocalization === loc.id && <CheckCircleOutlined sx={{ fontSize: 16 }} className="exec-loc-dropdown-check"/>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {allTasks.length === 0 ? (
        <div className="exec-no-tasks">
          <InventoryOutlined sx={{ fontSize: 48 }}/>
          <h4>No Tasks Yet</h4>
          <p>Use Ask Alan to audit shelves and generate execution tasks, or create tasks directly in Operations Queue.</p>
        </div>
      ) : (
        <div className="exec-localization-groups">
          {localizationGroups.map(locGroup => {
            const isExpanded = expandedLocalizations.includes(locGroup.id) || expandedLocalizations.length === 0;
            const groupTasks = locGroup.tasks.filter(t => taskFilter === 'all' || t.status === taskFilter);
            const pendingCount = locGroup.tasks.filter(t => t.status === 'Pending').length;
            const inProgressCount = locGroup.tasks.filter(t => t.status === 'In Progress').length;
            const completedCount = locGroup.tasks.filter(t => t.status === 'Completed').length;

            if (selectedLocalization && selectedLocalization !== locGroup.id) return null;
            if (groupTasks.length === 0) return null;

            return (
              <div key={locGroup.id} className="exec-loc-group">
                <div 
                  className={`exec-loc-group-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleLocalizationExpand(locGroup.id)}
                >
                  <div className="exec-loc-group-info">
                    <KeyboardArrowRight sx={{ fontSize: 18 }} className={`exec-loc-chevron ${isExpanded ? 'rotated' : ''}`}/>
                    <div className="exec-loc-group-details">
                      <h4>{locGroup.pogName} <ArrowForwardOutlined sx={{ fontSize: 14 }}/> {locGroup.storeGroup}</h4>
                      <div className="exec-loc-group-meta">
                        <span className="exec-loc-tag category">{locGroup.category}</span>
                        <span className="exec-loc-tag date">
                          <CalendarTodayOutlined sx={{ fontSize: 12 }}/>
                          {new Date(locGroup.createdAt).toLocaleDateString()}
                        </span>
                        <span className="exec-loc-id">ID: {locGroup.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="exec-loc-group-stats">
                    <span className="exec-stat pending">{pendingCount} Pending</span>
                    <span className="exec-stat in-progress">{inProgressCount} In Progress</span>
                    <span className="exec-stat completed">{completedCount} Completed</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="exec-task-cards">
                    {groupTasks.map(task => {
                      const assignee = sharedTeamMembers.find(m => m.id === task.assignedTo);
                      
                      return (
                        <div key={task.id} className={`exec-task-card ${task.status.toLowerCase().replace(' ', '-')}`}>
                          <div className="exec-task-card-header">
                            <div className="exec-task-type-badge" data-type={task.type.toLowerCase().replace(' ', '-')}>
                              {getSharedTaskTypeIcon(task.type)}
                              <span>{task.type}</span>
                            </div>
                            <div className={`exec-task-priority ${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </div>
                          </div>
                          
                          <h4 className="exec-task-card-title">{task.title}</h4>
                          
                          <p className="exec-task-card-desc">{task.description}</p>

                          <div className="exec-task-card-meta">
                            <span className="exec-task-meta-item">
                              <StoreOutlined sx={{ fontSize: 14 }}/>
                              {task.storeName}
                            </span>
                            <span className="exec-task-meta-item">
                              <DescriptionOutlined sx={{ fontSize: 14 }}/>
                              {task.pogName}
                            </span>
                          </div>

                          <div className="exec-task-card-impact">
                            <TrendingUpOutlined sx={{ fontSize: 14 }}/>
                            <span>{task.impact}</span>
                          </div>

                          <div className="exec-task-card-footer">
                            <div className="exec-task-assignee-section">
                              {assigningTaskId === task.id ? (
                                <select 
                                  className="exec-assign-select"
                                  onChange={(e) => handleAssignTask(task.id, e.target.value)}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select team member</option>
                                  {sharedTeamMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                      {member.name} - {member.role}
                                    </option>
                                  ))}
                                </select>
                              ) : assignee ? (
                                <div className="exec-assignee-chip" onClick={() => setAssigningTaskId(task.id)}>
                                  <span className="exec-avatar small">{assignee.avatar}</span>
                                  <span>{assignee.name}</span>
                                </div>
                              ) : (
                                <button 
                                  className="exec-assign-btn"
                                  onClick={() => setAssigningTaskId(task.id)}
                                >
                                  <PersonAddAlt1Outlined sx={{ fontSize: 14 }}/>
                                  Assign
                                </button>
                              )}
                            </div>
                            
                            <select 
                              className={`exec-status-select ${getStatusColor(task.status)}`}
                              value={task.status}
                              onChange={(e) => updateSharedTaskStatus(task.id, e.target.value as TaskStatus)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Show workflow tasks separately if any */}
          {tasks.length > 0 && (
            <div className="exec-loc-group">
              <div className="exec-loc-group-header expanded">
                <div className="exec-loc-group-info">
                  <div className="exec-loc-group-details">
                    <h4>Workflow Generated Tasks</h4>
                    <div className="exec-loc-group-meta">
                      <span className="exec-loc-tag category">Store Execution</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="exec-task-cards">
                {filteredTasks.map(task => {
                  const assignee = teamMembers.find(m => m.id === task.assignedTo);
                  
                  return (
                    <div key={task.id} className={`exec-task-card ${task.status.toLowerCase().replace(' ', '-')}`}>
                      <div className="exec-task-card-header">
                        <div className="exec-task-type-badge" data-type={task.type.toLowerCase().replace(' ', '-')}>
                          {getTaskTypeIcon(task.type)}
                          <span>{task.type}</span>
                        </div>
                        <div className={`exec-task-priority ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </div>
                      </div>
                      
                      <h4 className="exec-task-card-title">{task.type}: {task.skuName}</h4>
                      
                      <p className="exec-task-card-desc">{task.reason}</p>

                      <div className="exec-task-card-impact">
                        <TrendingUpOutlined sx={{ fontSize: 14 }}/>
                        <span>{task.impact}</span>
                      </div>

                      <div className="exec-task-card-footer">
                        <div className="exec-task-assignee-section">
                          {assignee ? (
                            <div className="exec-assignee-chip">
                              <span className="exec-avatar small">{assignee.avatar}</span>
                              <span>{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="exec-unassigned">Unassigned</span>
                          )}
                        </div>
                        
                        <select 
                          className={`exec-status-select ${getStatusColor(task.status)}`}
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="exec-container">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading Store Execution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exec-container">
      {/* Image Modal */}
      {expandedImage && (
        <div className="image-modal-overlay" onClick={() => setExpandedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setExpandedImage(null)}>
              <CloseOutlined sx={{ fontSize: 24 }}/>
            </button>
            <img src={expandedImage} alt="Expanded view" />
          </div>
        </div>
      )}
      
      <div className="exec-header">
        <div>
          <h1 className="exec-title">Store Execution</h1>
          <p className="exec-subtitle">
            Compare store layouts with localized planograms and generate actionable execution tasks
          </p>
        </div>
      </div>

      <div className="exec-content">
        {renderTaskListTab()}
      </div>
    </div>
  );
};

export default StoreExecution;
