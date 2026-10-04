import { useState, useEffect, useContext } from 'react'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'
import { AuthContext } from '@/context/AuthContext'
import teamService from '@/services/teamService'
import memberService from '@/services/memberService'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { Plus, Trash2, Loader2, X, UserPlus, Mail } from 'lucide-react'

const swatches = [
  'bg-primary text-primary-foreground',
  'bg-indigo-600 text-white',
  'bg-purple-600 text-white',
  'bg-blue-600 text-white',
]

export function TeamSection() {
  const { user, isOfficer } = useContext(AuthContext)
  const canManageBoard = Boolean(isOfficer || user?.role === 'officer')

  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Add Member Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [roleInput, setRoleInput] = useState('')
  const [majorInput, setMajorInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const res = await teamService.getTeamMembers()
      setMembers(res.data.members || [])
    } catch (err) {
      console.error('Failed to load board members', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleOpenAddModal = async () => {
    setShowAddModal(true)
    setErrorMsg('')
    setSelectedUserId('')
    setNameInput('')
    setRoleInput('')
    setMajorInput('')
    setEmailInput('')

    try {
      const res = await memberService.getMembers({ limit: 100 })
      setAvailableUsers(res.data.members || [])
    } catch (err) {
      console.error('Failed to load club members for dropdown', err)
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    if (!userId) return
    const u = availableUsers.find((user) => String(user._id) === String(userId))
    if (u) {
      setNameInput(u.name || '')
      setEmailInput(u.email || '')
      const majorStr = `${u.major || ''}${u.graduationYear ? `, ${u.graduationYear}` : ''}`.trim()
      setMajorInput(majorStr)
      if (u.role === 'officer') {
        setRoleInput('Executive Officer')
      } else if (u.role === 'treasurer') {
        setRoleInput('Treasurer')
      } else if (u.role === 'volunteer') {
        setRoleInput('Volunteer Coordinator')
      }
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || !roleInput.trim()) {
      setErrorMsg('Name and Role/Position are required.')
      return
    }

    setSaving(true)
    setErrorMsg('')

    try {
      await teamService.addTeamMember({
        name: nameInput.trim(),
        role: roleInput.trim(),
        major: majorInput.trim(),
        email: emailInput.trim(),
        userId: selectedUserId || null,
      })
      setShowAddModal(false)
      fetchTeamMembers()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add board member.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (id: string, name: string) => {
    const memberId = String(id || '')
    if (!memberId) {
      alert('Unable to delete board member: missing ID.')
      return
    }

    if (!confirm(`Are you sure you want to remove ${name} from the board?`)) return

    const previousMembers = [...members]
    setMembers((prev) => prev.filter((m) => String(m._id || m.id || '') !== memberId))

    try {
      await teamService.deleteTeamMember(memberId)
    } catch (err: any) {
      setMembers(previousMembers)
      alert(err.message || 'Failed to remove board member.')
    }
  }

  return (
    <section id="team" className="scroll-mt-16 border-t border-border py-20 md:py-28 text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The board"
            title="Run by students, for students"
            description="Elected every spring by members. Say hi at any event — we don't bite."
          />

          <div className="flex items-center gap-3 shrink-0">
            {canManageBoard && (
              <Button onClick={handleOpenAddModal} className="rounded-full font-bold shadow-sm">
                <Plus className="mr-1.5 size-4" />
                Add Board Member
              </Button>
            )}
            <a
              href="mailto:board@skyline.edu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <Mail className="size-4" />
              board@skyline.edu
            </a>
          </div>
        </div>

        {/* Board Members Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading executive board...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="mt-12 p-12 text-center rounded-3xl border border-dashed border-border bg-card/40 text-muted-foreground">
            <UserPlus className="size-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground">No Board Members Listed</p>
            <p className="text-xs text-muted-foreground mt-1">
              {canManageBoard ? 'Click "Add Board Member" above to list executive team members.' : 'Executive team details will appear here soon.'}
            </p>
          </div>
        ) : (
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {members.map((m, i) => (
              <li
                key={m._id || m.id || m.name || i}
                tabIndex={0}
                className="group relative isolate flex min-h-82.5 flex-col items-center overflow-hidden rounded-3xl border border-border bg-card px-5 pb-5 pt-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {/* Delete button for Officers */}
                {canManageBoard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteMember(m._id || m.id, m.name)
                    }}
                    className="absolute top-3 right-3 z-40 p-2.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 shadow-md border border-white/20 hover:scale-110 cursor-pointer"
                    title={`Remove ${m.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}

                <div className="absolute inset-x-0 top-0 z-0 h-[58%] origin-top -translate-y-full rounded-b-[50%] bg-primary/10 transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0" />
                
                <div
                  className={cn(
                    'relative z-10 flex aspect-square w-full items-center justify-center rounded-2xl font-display text-4xl md:text-5xl font-extrabold transition-all duration-300 group-hover:aspect-square group-hover:w-3/4 group-hover:rounded-full group-hover:ring-8 group-hover:ring-background group-focus-visible:aspect-square group-focus-visible:w-3/4 group-focus-visible:rounded-full group-focus-visible:ring-8 group-focus-visible:ring-background shadow-sm',
                    swatches[i % swatches.length]
                  )}
                  aria-hidden="true"
                >
                  <span className="transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">
                    {m.initials || (m.name ? m.name.substring(0, 2).toUpperCase() : 'BM')}
                  </span>
                </div>

                <div className="relative z-10 mt-4 w-full text-center transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">{m.role}</p>
                  <h3 className="text-xl font-bold mt-0.5 leading-snug">{m.name}</h3>
                  {m.major && <p className="text-xs text-muted-foreground mt-1">{m.major}</p>}
                </div>

                <div className="relative z-10 mt-auto max-h-0 w-full overflow-hidden border-t border-transparent text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground opacity-0 transition-all duration-300 group-hover:mt-4 group-hover:max-h-12 group-hover:border-border group-hover:pt-3 group-hover:opacity-100 group-focus-visible:mt-4 group-focus-visible:max-h-12 group-focus-visible:border-border group-focus-visible:pt-3 group-focus-visible:opacity-100">
                  Skyline SSA Board
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Board Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-2xl font-extrabold">Add Board Member</h3>
                <p className="text-xs text-muted-foreground">List a new officer or leader on the club team page.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-2xl bg-destructive/10 text-destructive text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4 mt-4">
              {/* Optional: Pick existing club member */}
              {availableUsers.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Quick Select Club Member (Optional)
                  </label>
                  <CustomSelect
                    value={selectedUserId}
                    onChange={(e) => handleSelectUser(e.target.value)}
                  >
                    <option value="">-- Choose registered member or enter manually --</option>
                    {availableUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role} - {u.email})
                      </option>
                    ))}
                  </CustomSelect>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Role / Position <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. President, Events Lead, Tech Director"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Major & Graduation Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Junior"
                  value={majorInput}
                  onChange={(e) => setMajorInput(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. president@skyline.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="rounded-full font-bold">
                  {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : 'Save Board Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
