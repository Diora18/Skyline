import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import projectService from '@/services/projectService';
import taskService from '@/services/taskService';
import memberService from '@/services/memberService';
import volunteerService from '@/services/volunteerService';
import { AuthContext } from '@/context/AuthContext';
import { FolderKanban, Plus, ChevronRight, ChevronLeft, Trash2, CheckCircle2, Circle, Clock, AlertCircle, Loader2, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/custom-select';

export default function ProjectKanban() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOfficer, isVolunteer, managedEventIds } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // New Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [supplyInput, setSupplyInput] = useState('');
  const [supplies, setSupplies] = useState([]);
  const [creatingTask, setCreatingTask] = useState(false);

  const linkedEventId = String(project?.linkedEvent?._id || project?.linkedEvent || '');
  const canManageProjectTasks = isOfficer || managedEventIds.includes(linkedEventId);

  const fetchProjectAndTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjectById(id);
      const loadedProject = res.data.project;
      const projectTasks = loadedProject?.tasks || [];
      const eventId = String(loadedProject?.linkedEvent?._id || loadedProject?.linkedEvent || '');
      const managesLinkedEvent = managedEventIds.includes(eventId);
      const visibleTasks = isOfficer || managesLinkedEvent
        ? projectTasks
        : projectTasks.filter(
          (task) => String(task.assignee?._id || task.assignee || '') === String(user?._id || '')
        );

      setProject(loadedProject);
      setTasks(visibleTasks);
      setAccessDenied(!isOfficer && !managesLinkedEvent && visibleTasks.length === 0);
    } catch (err) {
      console.error('Failed to load project details', err);
    } finally {
      setLoading(false);
    }
  }, [id, isOfficer, managedEventIds, user?._id]);

  useEffect(() => {
    if (id) fetchProjectAndTasks();
  }, [id, fetchProjectAndTasks]);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;

    const loadVolunteers = async () => {
      try {
        if (!linkedEventId) {
          if (!cancelled) setVolunteers([]);
          return;
        }

        const response = await volunteerService.getEventApplications(linkedEventId);
        const applications = response.data.applications || [];
        const approvedApplications = applications.filter(
          (app) => app.status === 'approved' || app.status === 'completed'
        );

        const eligibleVolunteers = approvedApplications
          .filter((app) => app.user)
          .map((app) => ({
            _id: app.user._id,
            name: app.user.name,
            email: app.user.email,
            responsibility: app.responsibility || '',
          }));

        const uniqueVolunteers = [
          ...new Map(eligibleVolunteers.map((v) => [v._id, v])).values(),
        ];

        if (!cancelled) setVolunteers(uniqueVolunteers);
      } catch (err) {
        console.error('Failed to load eligible approved volunteer assignments', err);
        if (!cancelled) setVolunteers([]);
      }
    };

    loadVolunteers();
    return () => {
      cancelled = true;
    };
  }, [linkedEventId, project]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleAddSupply = () => {
    if (!supplyInput.trim()) return;
    setSupplies([...supplies, supplyInput.trim()]);
    setSupplyInput('');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setCreatingTask(true);
    try {
      await taskService.createTask({
        title: taskTitle,
        description: taskDesc,
        project: id,
        assignee: assignee || null,
        priority: taskPriority,
        supplies,
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setAssignee('');
      setSupplies([]);
      fetchProjectAndTasks();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Urgent</span>;
      case 'high':
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">High</span>;
      case 'medium':
        return <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Medium</span>;
      default:
        return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Low</span>;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-24 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Loading Kanban workspace...</p>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold">No tasks assigned to you here</h2>
        <p className="text-sm text-muted-foreground">Project boards only show work assigned to your account.</p>
        <Button onClick={() => navigate('/projects')} className="rounded-full">
          Back to My Projects
        </Button>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <Button onClick={() => navigate('/projects')} className="rounded-full">
          Back to Projects
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Initiatives
      </Link>

      {/* Project Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {project.status || 'Active'}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{project.title}</h1>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">{project.description}</p>
        </div>

        {canManageProjectTasks && (
          <Button onClick={() => setShowTaskModal(true)} className="rounded-full shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            {isOfficer ? 'Add Kanban Task' : 'Assign Volunteer Task'}
          </Button>
        )}
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3 mt-8">
        {/* Column 1: TO DO */}
        <KanbanColumn
          title="To Do"
          count={todoTasks.length}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          {todoTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onMoveRight={() => handleUpdateStatus(task._id, 'in_progress')}
              onDelete={() => handleDeleteTask(task._id)}
              onMarkDone={() => handleUpdateStatus(task._id, 'done')}
              canMarkDone={isVolunteer && String(task.assignee?._id || task.assignee) === String(user?._id)}
              isOfficer={isOfficer}
              getPriorityBadge={getPriorityBadge}
            />
          ))}
        </KanbanColumn>

        {/* Column 2: IN PROGRESS */}
        <KanbanColumn
          title="In Progress"
          count={inProgressTasks.length}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        >
          {inProgressTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onMoveLeft={() => handleUpdateStatus(task._id, 'todo')}
              onMoveRight={() => handleUpdateStatus(task._id, 'done')}
              onDelete={() => handleDeleteTask(task._id)}
              onMarkDone={() => handleUpdateStatus(task._id, 'done')}
              canMarkDone={isVolunteer && String(task.assignee?._id || task.assignee) === String(user?._id)}
              isOfficer={isOfficer}
              getPriorityBadge={getPriorityBadge}
            />
          ))}
        </KanbanColumn>

        {/* Column 3: DONE */}
        <KanbanColumn
          title="Done"
          count={doneTasks.length}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          {doneTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onMoveLeft={() => handleUpdateStatus(task._id, 'in_progress')}
              onDelete={() => handleDeleteTask(task._id)}
              canMarkDone={false}
              isOfficer={isOfficer}
              getPriorityBadge={getPriorityBadge}
              isDone
            />
          ))}
        </KanbanColumn>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <h3 className="text-2xl font-extrabold">New Task Item</h3>
            <p className="text-xs text-muted-foreground mt-1">Add a task to the project Kanban board.</p>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order 500 club lanyards"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details & instructions for assigned team..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Priority</label>
                <CustomSelect
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </CustomSelect>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Assign to Approved Volunteer</label>
                <CustomSelect
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  required={!isOfficer}
                >
                  <option value="">{isOfficer ? 'Unassigned' : 'Select Approved Volunteer...'}</option>
                  {volunteers.map((volunteer) => (
                    <option key={volunteer._id} value={volunteer._id}>
                      {volunteer.name}{volunteer.responsibility ? ` (${volunteer.responsibility})` : ''}
                    </option>
                  ))}
                </CustomSelect>
                {volunteers.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {linkedEventId
                      ? 'No approved volunteers for this event yet. Accept requests in Event Manager → Event Volunteers.'
                      : 'This project is not linked to an event with volunteer applications.'}
                  </p>
                )}
              </div>

              {/* Supplies checklist builder */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Supplies Needed</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 2x Extension Cords"
                    value={supplyInput}
                    onChange={(e) => setSupplyInput(e.target.value)}
                    className="flex-1 rounded-full border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="button" size="sm" onClick={handleAddSupply} className="rounded-full text-xs">
                    Add
                  </Button>
                </div>
                {supplies.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {supplies.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-lg flex justify-between">
                        <span>• {s}</span>
                        <button type="button" onClick={() => setSupplies(supplies.filter((_, idx) => idx !== i))} className="text-destructive">×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowTaskModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingTask} className="rounded-full">
                  {creatingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Add Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function KanbanColumn({ title, count, color, children }) {
  const hasTasks = count > 0;

  return (
    <div className="flex flex-col h-[520px] rounded-3xl border border-border bg-card/60 p-4 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-extrabold text-base">{title}</h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
            {count}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {hasTasks ? (
          children
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-border/80 bg-background/40 text-muted-foreground">
            <FolderKanban className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-bold text-muted-foreground">No task assigned</p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">There are no tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onMoveLeft, onMoveRight, onDelete, onMarkDone, canMarkDone, isOfficer, getPriorityBadge, isDone }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm transition-all hover:shadow-md ${isDone ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className={`text-base font-bold leading-snug ${isDone ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </h4>
        {getPriorityBadge(task.priority)}
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.supplies && task.supplies.length > 0 && (
        <div className="bg-muted/50 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Supplies:</span>
          {task.supplies.map((s, i) => (
            <span key={`${s}-${i}`} className="inline-block bg-background px-2 py-0.5 rounded text-[11px] text-foreground font-medium mr-1 mb-1 border border-border">
            {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="truncate max-w-25">{task.assignee?.name || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-1">
          {isOfficer && onMoveLeft && (
            <button
              onClick={onMoveLeft}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Move column left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isOfficer && onMoveRight && (
            <button
              onClick={onMoveRight}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Move column right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {canMarkDone && !isDone && (
            <button
              onClick={onMarkDone}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"
              title="Mark my task done"
            >
              <CheckCircle2 className="h-4 w-4" />
              Done
            </button>
          )}
          {isOfficer && (
            <button
              onClick={onDelete}
              className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
