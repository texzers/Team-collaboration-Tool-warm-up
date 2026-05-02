import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Filter } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-200' },
  { id: 'REVIEW', title: 'Review', color: 'bg-purple-200' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-200' },
];

const DEMO_TASKS = [
  { id: '1', title: 'Design new landing page wireframes', status: 'TODO', priority: 'HIGH', position: 1, dueDate: '2026-05-10', assignees: [{ id: 'a1', displayName: 'Alice', avatarUrl: '' }] },
  { id: '2', title: 'Set up CI/CD pipeline', status: 'TODO', priority: 'MEDIUM', position: 2, dueDate: '2026-05-12', assignees: [{ id: 'a2', displayName: 'Bob', avatarUrl: '' }] },
  { id: '3', title: 'Implement user authentication flow', status: 'IN_PROGRESS', priority: 'CRITICAL', position: 1, dueDate: '2026-05-08', assignees: [{ id: 'a1', displayName: 'Alice', avatarUrl: '' }, { id: 'a3', displayName: 'Carol', avatarUrl: '' }] },
  { id: '4', title: 'API rate limiting middleware', status: 'IN_PROGRESS', priority: 'HIGH', position: 2, dueDate: null, assignees: [{ id: 'a2', displayName: 'Bob', avatarUrl: '' }] },
  { id: '5', title: 'Write unit tests for auth module', status: 'REVIEW', priority: 'MEDIUM', position: 1, dueDate: '2026-05-06', assignees: [{ id: 'a3', displayName: 'Carol', avatarUrl: '' }] },
  { id: '6', title: 'Database schema migration', status: 'DONE', priority: 'HIGH', position: 1, dueDate: '2026-05-01', assignees: [{ id: 'a1', displayName: 'Alice', avatarUrl: '' }] },
  { id: '7', title: 'Setup monitoring & alerts', status: 'DONE', priority: 'LOW', position: 2, dueDate: '2026-04-28', assignees: [{ id: 'a2', displayName: 'Bob', avatarUrl: '' }] },
];

const DEMO_PROJECTS: Record<string, { name: string; description: string }> = {
  'demo-project-id': { name: 'Website Redesign', description: 'Q3 Marketing site refresh' },
  'website-redesign': { name: 'Website Redesign', description: 'Complete overhaul of the marketing website' },
  'q3-marketing': { name: 'Q3 Marketing', description: 'Q3 campaign planning and execution' },
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'bg-slate-100 text-slate-700';
    case 'MEDIUM': return 'bg-blue-50 text-blue-700';
    case 'HIGH': return 'bg-orange-50 text-orange-700';
    case 'CRITICAL': return 'bg-red-50 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = DEMO_PROJECTS[projectId || 'demo-project-id'] || DEMO_PROJECTS['demo-project-id'];
  const [tasks, setTasks] = React.useState(DEMO_TASKS);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex(t => t.id === draggableId);
    const [movedTask] = newTasks.splice(taskIndex, 1);
    movedTask.status = destination.droppableId;
    newTasks.push(movedTask);
    setTasks(newTasks);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h2>
          <p className="text-slate-500 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {['Alice', 'Bob', 'Carol'].map((name, i) => (
              <img key={i} src={`https://ui-avatars.com/api/?name=${name}&background=random`} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 relative" style={{ zIndex: 3 - i }} alt={name} />
            ))}
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2"><Filter size={16} /> Filter</Button>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2"><Settings size={16} /></Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white"><Plus size={16} /> New Task</Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id).sort((a, b) => a.position - b.position);
            return (
              <div key={column.id} className="flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h3>
                    <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><Plus size={18} /></button>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50' : ''}`}>
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50 rotate-2' : 'hover:border-slate-300'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                              </div>
                              <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug mb-3">{task.title}</h4>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1"><Calendar size={12} /><span>{format(new Date(task.dueDate), 'MMM d')}</span></div>
                                  )}
                                </div>
                                <div className="flex -space-x-2">
                                  {task.assignees.map(a => (
                                    <img key={a.id} src={`https://ui-avatars.com/api/?name=${a.displayName}&background=random`} alt={a.displayName} title={a.displayName} className="w-6 h-6 rounded-full border border-white dark:border-slate-900" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
