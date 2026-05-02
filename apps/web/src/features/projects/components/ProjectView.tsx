import React from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../../tasks/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus, Users, Settings, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';

const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      // In a real app we'd have a GET /api/projects/:id endpoint
      // For now, we mock the project data fetch
      const res = await api.get('/projects');
      const project = res.data.data.find((p: any) => p.id === projectId);
      return project || { name: 'Website Redesign', description: 'Q3 Marketing site refresh' };
    },
    enabled: !!projectId,
  });
};

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId || '');

  if (isLoading) return <div className="p-8">Loading project...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {project?.name}
          </h2>
          {project?.description && (
            <p className="text-slate-500 mt-1">{project.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {[1, 2, 3].map(i => (
              <img 
                key={i}
                src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} 
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 z-10 relative"
                alt="Member"
              />
            ))}
            <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs text-slate-500 z-0 relative ml-1">
              +
            </button>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Settings size={16} />
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <Plus size={16} /> New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard projectId={projectId || 'demo-project-id'} />
      </div>
    </div>
  );
};
