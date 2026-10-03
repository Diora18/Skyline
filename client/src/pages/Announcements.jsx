import { useState, useEffect, useContext } from 'react';
import announcementService from '@/services/announcementService';
import { AuthContext } from '@/context/AuthContext';
import { Megaphone, Plus, Trash2, Calendar, MailCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Announcements() {
  const { isAdmin } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // New Notice Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general');
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await announcementService.getAnnouncements(filter !== 'All' ? { category: filter.toLowerCase() } : {});
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !body) return;

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        title,
        body,
        category,
        sendEmail,
      });
      setShowModal(false);
      setTitle('');
      setBody('');
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message || 'Failed to delete notice');
    }
  };

  const categories = ['All', 'General', 'Event', 'Urgent', 'Merch', 'Opportunity'];

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Bulletin Board</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Club Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Official news, event alerts, and important updates from Skyline SSA officers.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowModal(true)} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Publish Notice
          </Button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mt-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === cat
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bulletin Feed */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Fetching bulletin updates...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No announcements</h3>
          <p className="text-muted-foreground text-sm mt-1">No updates matching filter: <span className="font-semibold text-foreground uppercase">{filter}</span>.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {announcements.map((item) => {
            const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            const poster = item.postedBy?.name || 'Skyline Officer';

            return (
              <div key={item._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.emailSent && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                          <MailCheck className="h-3 w-3" /> Email Broadcasted
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-extrabold">{item.title}</h2>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete notice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                  {item.body}
                </p>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Posted by <span className="font-semibold text-foreground">{poster}</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <h3 className="text-2xl font-extrabold">Publish Bulletin Announcement</h3>
            <p className="text-xs text-muted-foreground mt-1">Post news to the student portal feed.</p>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Pizza Social this Thursday!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General</option>
                  <option value="event">Event Alert</option>
                  <option value="urgent">Urgent Notice</option>
                  <option value="merch">Merchandise Drop</option>
                  <option value="opportunity">Career & Opportunity</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Notice Body</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Full announcement text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="sendEmail" className="text-xs font-medium text-muted-foreground">
                  Simulate sending email notification broadcast to all active members
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-full">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Publish Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
