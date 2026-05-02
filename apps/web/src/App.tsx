import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardLayout } from './features/dashboard/components/DashboardLayout';
import { ProjectView } from './features/projects/components/ProjectView';
import { ChatView } from './features/chat/components/ChatView';

const DashboardHome = () => {
  return (
    <>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-500 dark:text-slate-400 mb-1 text-sm">My Tasks</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-500 dark:text-slate-400 mb-1 text-sm">Completed This Week</h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-500 dark:text-slate-400 mb-1 text-sm">Upcoming Deadlines</h3>
          <p className="text-3xl font-bold text-orange-500">3</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-medium text-slate-500 dark:text-slate-400 mb-1 text-sm">Unread Messages</h3>
          <p className="text-3xl font-bold text-primary">5</p>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Routes>
      <Route 
        path="/" 
        element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        } 
      />
      <Route 
        path="/projects/:projectId" 
        element={
          <DashboardLayout>
            <ProjectView />
          </DashboardLayout>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <DashboardLayout>
            <Navigate to="/projects/demo-project-id" replace />
          </DashboardLayout>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <DashboardLayout>
            <ChatView />
          </DashboardLayout>
        } 
      />
      {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
