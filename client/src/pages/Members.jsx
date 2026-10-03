import { useState, useEffect } from 'react';
import memberService from '@/services/memberService';
import { Users, Search, ShieldCheck, Mail, UserCheck, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Role Promotion Modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('volunteer');
  const [updating, setUpdating] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await memberService.getMembers(roleFilter !== 'all' ? { role: roleFilter } : {});
      setMembers(res.data.members || []);
    } catch (err) {
      console.error('Failed to load member directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [roleFilter]);

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    setUpdating(true);
    try {
      await memberService.updateRole(selectedMember._id, newRole);
      setSelectedMember(null);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendReminder = async (memberId) => {
    try {
      await memberService.sendReminder(memberId);
      alert('Membership renewal reminder sent successfully!');
    } catch (err) {
      alert(err.message || 'Failed to send reminder');
    }
  };

  const filteredMembers = members.filter((m) => {
    const query = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(query) ||
      m.email?.toLowerCase().includes(query) ||
      m.studentId?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen py-12 px-4 md:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Executive Operations</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Student Member Directory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage club roster, promote volunteer/officer roles, and send automated renewal notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border border-input bg-background pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary w-60"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-full border border-input bg-background px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="volunteer">Volunteer</option>
            <option value="treasurer">Treasurer</option>
            <option value="officer">Officer</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Fetching member roster...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-border p-8 mt-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-xl font-bold">No members found</h3>
          <p className="text-muted-foreground text-sm mt-1">No students matching query: <span className="font-semibold text-foreground">"{search}"</span>.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider font-bold text-muted-foreground">
                <tr>
                  <th className="p-4 pl-6">Student Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Membership</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </td>
                    <td className="p-4 font-mono text-xs font-semibold">{member.studentId || 'N/A'}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          member.membershipStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setNewRole(member.role);
                        }}
                        className="rounded-full text-xs"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Role
                      </Button>
                      {member.membershipStatus !== 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendReminder(member._id)}
                          className="rounded-full text-xs"
                          title="Send renewal reminder email"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Promotion Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground space-y-4">
            <h3 className="text-xl font-extrabold">Update Member Role</h3>
            <p className="text-xs text-muted-foreground">
              Change permissions for <span className="font-bold text-foreground">{selectedMember.name}</span>.
            </p>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Select Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="student">Student (General Member)</option>
                <option value="volunteer">Volunteer (Team Member)</option>
                <option value="treasurer">Treasurer (Financial Lead)</option>
                <option value="officer">Officer (Full Administrator)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelectedMember(null)} className="rounded-full">
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={updating} className="rounded-full">
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Save Role'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
