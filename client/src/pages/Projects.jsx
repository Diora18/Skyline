import { useState, useEffect, useContext, useCallback } from 'react';
import projectService from '@/services/projectService';
import { AuthContext } from '@/context/AuthContext';
import { FolderKanban, Calendar, CheckSquare, Plus, ArrowRight, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const { user, isOfficer, managedEventIds } = useContext(AuthContext);
  const userId = user?._id;
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects();
      const availableProjects = res.data.projects || [];

      if (!isOfficer && userId) {
        const assignedProjects = await Promise.all(
          availableProjects.map(async (project) => {
            const details = await projectService.getProjectById(project._id);
            const assignedTasks = (details.data.project?.tasks || []).filter(
              (task) => String(task.assignee?._id || task.assignee || '') === String(userId)
            );

            const linkedEventId = String(project.linkedEvent?._id || project.linkedEvent || '');
            const managesLinkedEvent = managedEventIds.includes(linkedEventId);
            if (assignedTasks.length === 0 && !managesLinkedEvent) return null;

            const doneTasks = assignedTasks.filter((task) => task.status === 'done').length;
            const visibleTasks = managesLinkedEvent ? details.data.project?.tasks || [] : assignedTasks;
            const visibleDoneTasks = visibleTasks.filter((task) => task.status === 'done').length;
            return {
              ...project,
              totalTasks: managesLinkedEvent ? visibleTasks.length : assignedTasks.length,
              doneTasks: managesLinkedEvent ? visibleDoneTasks : doneTasks,
              progress: visibleTasks.length > 0
                ? Math.round((managesLinkedEvent ? visibleDoneTasks : doneTasks) /
                  (managesLinkedEvent ? visibleTasks.length : assignedTasks.length) * 100)
                : 0,
            };
          })
        );

        setProjects(assignedProjects.filter(Boolean));
      } else {
        setProjects(availableProjects);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  }, [isOfficer, managedEventIds, userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      await projectService.createProject({
        title: newTitle,
        description: newDescription,
        deadline: newDeadline || null,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewDeadline('');
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to create initiative');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Volunteer Operations</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-1">Volunteer Projects</h1>
          <p className="text-muted-foreground text-sm max-w-lg mt-1">
            {isOfficer
              ? 'Organize event logistics, student outreach, and club initiatives with interactive Kanban task boards.'
              : 'View the project work assigned to you and track your tasks on the Kanban boards.'}
          </p>
        </div>

        {isOfficer && (
          <Button onClick={() => setShowCreateModal(true)} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New Initiative
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading volunteer projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8 space-y-4">
          <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-xl font-bold">No active projects</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {isOfficer
              ? 'No volunteer projects have been created yet. Officers can launch a new initiative above!'
              : 'There are no project tasks assigned to you right now.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {projects.map((project) => {
            const deadlineDate = project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible';
            const tasksCount = project.totalTasks || 0;
            const completedTasks = project.doneTasks || 0;
            const progressPercent = project.progress || 0;

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-all hover:border-foreground/40 hover:shadow-xl cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      {project.status || 'Active'}
                    </span>
                    {project.linkedEvent && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <Link2 className="h-3.5 w-3.5 text-primary" /> Event Linked
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-1.5 leading-relaxed">
                      {project.description || 'Club operations and volunteer task assignment board.'}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" /> Target Deadline:
                      </span>
                      <span className="font-semibold text-foreground">{deadlineDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-primary" /> Kanban Tasks:
                      </span>
                      <span className="font-semibold text-foreground">{completedTasks} / {tasksCount} Done</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Open Board</span>
                  <Button variant="ghost" size="sm" className="rounded-full group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <h3 className="text-2xl font-extrabold">New Volunteer Initiative</h3>
            <p className="text-xs text-muted-foreground mt-1">Create a new project workspace for your team.</p>

            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Logistics & Mentors"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Goals, team notes, and target outcomes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="rounded-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Create Initiative'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
