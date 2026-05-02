import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks, useMoveTask } from '../hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-200' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-200' },
  { id: 'REVIEW', title: 'Review', color: 'bg-purple-200' },
  { id: 'DONE', title: 'Done', color: 'bg-emerald-200' },
];

export const KanbanBoard = ({ projectId }: KanbanBoardProps) => {
  const { data: serverTasks, isLoading } = useTasks(projectId);
  const { mutate: moveTask } = useMoveTask(projectId);
  
  // Local state for optimistic UI updates during drag
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (serverTasks) setTasks(serverTasks);
  }, [serverTasks]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading tasks...</div>;

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex(t => t.id === draggableId);
    const [movedTask] = newTasks.splice(taskIndex, 1);
    
    movedTask.status = destination.droppableId;
    
    // Find the tasks in the destination column
    const destTasks = newTasks.filter(t => t.status === destination.droppableId).sort((a, b) => a.position - b.position);
    
    // Calculate new position
    let newPosition;
    if (destTasks.length === 0) {
      newPosition = 65536;
    } else if (destination.index === 0) {
      newPosition = destTasks[0].position / 2;
    } else if (destination.index === destTasks.length) {
      newPosition = destTasks[destTasks.length - 1].position + 65536;
    } else {
      newPosition = (destTasks[destination.index - 1].position + destTasks[destination.index].position) / 2;
    }

    movedTask.position = newPosition;
    newTasks.push(movedTask);
    
    // Force re-render with optimistically updated tasks
    setTasks(newTasks);

    // Call API
    moveTask({
      taskId: draggableId,
      data: { status: destination.droppableId, position: newPosition }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'bg-slate-100 text-slate-700';
      case 'MEDIUM': return 'bg-blue-50 text-blue-700';
      case 'HIGH': return 'bg-orange-50 text-orange-700';
      case 'CRITICAL': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map(column => {
          const columnTasks = tasks
            .filter(t => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={column.id} className="flex-shrink-0 w-80 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h3>
                  <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <Plus size={18} />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 group
                              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary ring-opacity-50 rotate-2' : 'hover:border-slate-300 dark:hover:border-slate-600'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug mb-3">
                              {task.title}
                            </h4>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1" title="Due Date">
                                    <Calendar size={12} />
                                    <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex -space-x-2">
                                {task.assignees?.map((assignee: any) => (
                                  <img 
                                    key={assignee.id}
                                    src={assignee.avatarUrl || `https://ui-avatars.com/api/?name=${assignee.displayName}&background=random`} 
                                    alt={assignee.displayName}
                                    title={assignee.displayName}
                                    className="w-6 h-6 rounded-full border border-white dark:border-slate-900"
                                  />
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
  );
};
