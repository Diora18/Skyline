/**
 * server/seed.js
 * ──────────────────────────────────────────────────
 * Realistic demo-data seeder for Skyline SSA.
 * Drops all collections, then creates interconnected records
 * ready for the hackathon judging demo.
 *
 * Usage:  npm run seed   (or)   node seed.js
 * ──────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ──────────────────────────────────────
const User         = require('./models/User');
const Event        = require('./models/Event');
const Ticket       = require('./models/Ticket');
const Product      = require('./models/Product');
const Order        = require('./models/Order');
const Project      = require('./models/Project');
const Task         = require('./models/Task');
const Transaction  = require('./models/Transaction');
const Expense      = require('./models/Expense');
const Announcement = require('./models/Announcement');
const EventVolunteerApplication = require('./models/EventVolunteerApplication');

// ── Helpers ─────────────────────────────────────
const now      = new Date();
const ago      = (days)  => new Date(now.getTime() - days * 86400000);
const ahead    = (days)  => new Date(now.getTime() + days * 86400000);
const hashPwd  = (plain) => bcrypt.hashSync(plain, 10);
const pwd      = hashPwd('Password123!');

// ── SEED ────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/skyline_ssa';
  await mongoose.connect(uri);
  console.log('[Seed] Connected to', uri);

  // Drop everything
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    await mongoose.connection.db.dropCollection(col.name);
  }
  console.log('[Seed] Dropped all collections');

  // ═══════════════════════════════════════════════
  //  1. USERS  (12 accounts)
  // ═══════════════════════════════════════════════
  const usersRaw = [
    // Officers (3)
    { name: 'Admin Skyline',    email: 'admin@skyline.edu',     studentId: 'SKY-2024-001', role: 'officer',   membershipStatus: 'active', major: 'Computer Science',   graduationYear: 2026, phone: '555-0001', membershipPaidAt: ago(180), membershipExpiresAt: ahead(185) },
    { name: 'Priya Mehta',      email: 'president@skyline.edu', studentId: 'SKY-2024-002', role: 'officer',   membershipStatus: 'active', major: 'Business Admin',     graduationYear: 2026, phone: '555-0002', membershipPaidAt: ago(160), membershipExpiresAt: ahead(205) },
    { name: 'Jordan Lee',       email: 'vp@skyline.edu',        studentId: 'SKY-2024-003', role: 'officer',   membershipStatus: 'active', major: 'Marketing',          graduationYear: 2027, phone: '555-0003', membershipPaidAt: ago(150), membershipExpiresAt: ahead(215) },
    // Treasurer (1)
    { name: 'Aisha Khan',       email: 'treasurer@skyline.edu', studentId: 'SKY-2024-004', role: 'treasurer', membershipStatus: 'active', major: 'Finance',            graduationYear: 2026, phone: '555-0004', membershipPaidAt: ago(170), membershipExpiresAt: ahead(195) },
    // Volunteers (2)
    { name: 'Carlos Rivera',    email: 'carlos@skyline.edu',    studentId: 'SKY-2024-005', role: 'volunteer', membershipStatus: 'active', major: 'Engineering',        graduationYear: 2027, phone: '555-0005', membershipPaidAt: ago(120), membershipExpiresAt: ahead(245) },
    { name: 'Mei Chen',         email: 'mei@skyline.edu',       studentId: 'SKY-2024-006', role: 'volunteer', membershipStatus: 'active', major: 'Computer Science',   graduationYear: 2027, phone: '555-0006', membershipPaidAt: ago(100), membershipExpiresAt: ahead(265) },
    // Active members (2)
    { name: 'David Okafor',     email: 'david@skyline.edu',     studentId: 'SKY-2024-007', role: 'student',   membershipStatus: 'active', major: 'Biology',            graduationYear: 2028, phone: '555-0007', membershipPaidAt: ago(90),  membershipExpiresAt: ahead(275) },
    { name: 'Sofia Martinez',   email: 'sofia@skyline.edu',     studentId: 'SKY-2024-008', role: 'student',   membershipStatus: 'active', major: 'Psychology',         graduationYear: 2028, phone: '555-0008', membershipPaidAt: ago(60),  membershipExpiresAt: ahead(305) },
    // Expired members (2)
    { name: 'Jake Thompson',    email: 'jake@skyline.edu',      studentId: 'SKY-2024-009', role: 'student',   membershipStatus: 'expired', major: 'Arts',              graduationYear: 2027, phone: '555-0009', membershipPaidAt: ago(400), membershipExpiresAt: ago(35) },
    { name: 'Emily Wang',       email: 'emily@skyline.edu',     studentId: 'SKY-2024-010', role: 'student',   membershipStatus: 'expired', major: 'Economics',         graduationYear: 2027, phone: '555-0010', membershipPaidAt: ago(380), membershipExpiresAt: ago(15) },
    // Non-members (2)
    { name: 'Alex Novak',       email: 'alex@skyline.edu',      studentId: 'SKY-2024-011', role: 'student',   membershipStatus: 'none', major: 'Physics',              graduationYear: 2029, phone: '555-0011', membershipPaidAt: null, membershipExpiresAt: null },
    { name: 'Fatima Al-Rashid', email: 'fatima@skyline.edu',     studentId: 'SKY-2024-012', role: 'student',   membershipStatus: 'none', major: 'Literature',           graduationYear: 2029, phone: '555-0012', membershipPaidAt: null, membershipExpiresAt: null },
  ];

  // Manually set hashed password to bypass pre-save hook duplicating hashing
  const users = await User.insertMany(
    usersRaw.map(u => ({ ...u, password: pwd }))
  );
  console.log(`[Seed] Created ${users.length} users`);

  // Quick lookup by email prefix
  const u = {};
  users.forEach(user => { u[user.email.split('@')[0]] = user; });

  // ═══════════════════════════════════════════════
  //  2. EVENTS  (4 records)
  // ═══════════════════════════════════════════════
  const eventsRaw = [
    {
      title: 'Skyline Annual Tech Gala',
      description: 'Our flagship black-tie tech showcase featuring keynote speakers from leading tech companies, project demos by members, and a networking dinner. Dress code: formal.',
      category: 'gala',
      venue: 'Grand Ballroom, Student Center',
      address: '200 University Ave, Building C',
      startDate: ahead(30),
      endDate: ahead(30.25),
      memberPrice: 15,
      nonMemberPrice: 30,
      capacity: 200,
      ticketsSold: 0, // will update after tickets
      status: 'published',
      createdBy: u.admin._id,
      managers: [u.president._id, u.carlos._id],
    },
    {
      title: 'HackSkyline 2026 Hackathon',
      description: '24-hour hackathon open to all students. Build something amazing with a team of up to 4 people. Prizes include tech gadgets, internship referrals, and bragging rights.',
      category: 'workshop',
      venue: 'Innovation Lab, Engineering Building',
      address: '500 Campus Dr, Floor 3',
      startDate: ahead(45),
      endDate: ahead(46),
      memberPrice: 0,
      nonMemberPrice: 0,
      capacity: 150,
      ticketsSold: 0,
      status: 'published',
      createdBy: u.president._id,
      managers: [u.mei._id],
    },
    {
      title: 'Alumni Career Panel & Mixer',
      description: 'Connect with 10+ Skyline alumni working at Google, McKinsey, and local startups. Includes a moderated Q&A panel followed by casual networking with refreshments.',
      category: 'social',
      venue: 'Lecture Hall 201',
      address: '150 University Ave',
      startDate: ahead(14),
      endDate: ahead(14.125),
      memberPrice: 5,
      nonMemberPrice: 15,
      capacity: 80,
      ticketsSold: 0,
      status: 'published',
      createdBy: u.vp._id,
      managers: [],
    },
    {
      title: 'Fall Orientation Social',
      description: 'Welcome freshers! Free food, music, lawn games, and campus tours. Meet the SSA executive team and learn how to get involved.',
      category: 'social',
      venue: 'Main Campus Lawn',
      address: '1 University Ave',
      startDate: ago(60),
      endDate: ago(59.75),
      memberPrice: 0,
      nonMemberPrice: 0,
      capacity: 120,
      ticketsSold: 0, // will update
      status: 'completed',
      createdBy: u.admin._id,
      managers: [u.carlos._id],
    },
  ];

  const events = await Event.insertMany(eventsRaw);
  console.log(`[Seed] Created ${events.length} events`);

  const ev = {};
  ev.gala        = events[0];
  ev.hackathon   = events[1];
  ev.alumni      = events[2];
  ev.orientation = events[3];

  // ═══════════════════════════════════════════════
  //  2b. EVENT VOLUNTEER ASSIGNMENTS
  // ═══════════════════════════════════════════════
  const volunteerApplications = await EventVolunteerApplication.insertMany([
    {
      event: ev.gala._id,
      user: u.carlos._id,
      status: 'approved',
      responsibility: 'Registration desk and guest check-in',
      reviewedBy: u.president._id,
      reviewedAt: ago(3),
    },
    {
      event: ev.gala._id,
      user: u.mei._id,
      status: 'approved',
      responsibility: 'Photography and social media',
      reviewedBy: u.president._id,
      reviewedAt: ago(3),
    },
    {
      event: ev.hackathon._id,
      user: u.carlos._id,
      status: 'approved',
      responsibility: 'Catering and supplies',
      reviewedBy: u.mei._id,
      reviewedAt: ago(5),
    },
    {
      event: ev.hackathon._id,
      user: u.mei._id,
      status: 'approved',
      responsibility: 'Registration and participant support',
      reviewedBy: u.mei._id,
      reviewedAt: ago(5),
    },
    {
      event: ev.alumni._id,
      user: u.carlos._id,
      status: 'approved',
      responsibility: 'Venue setup and guest seating',
      reviewedBy: u.vp._id,
      reviewedAt: ago(2),
    },
    {
      event: ev.alumni._id,
      user: u.david._id,
      status: 'pending',
      responsibility: 'Photography',
    },
  ]);
  console.log(`[Seed] Created ${volunteerApplications.length} event volunteer assignments`);

  // ═══════════════════════════════════════════════
  //  3. TICKETS  (24 records)
  // ═══════════════════════════════════════════════
  let ticketNum = 101;
  const ticketsRaw = [];

  // Helper to push a ticket
  const addTicket = (event, user, type, price, status, checkedInAt = null) => {
    ticketsRaw.push({
      ticketCode: `TKT-2026-A${ticketNum++}`,
      event: event._id,
      user: user._id,
      ticketType: type,
      price,
      status,
      checkedInAt,
    });
  };

  // Gala tickets (8 valid)
  addTicket(ev.gala, u.president, 'member', 15, 'valid');
  addTicket(ev.gala, u.vp,        'member', 15, 'valid');
  addTicket(ev.gala, u.treasurer, 'member', 15, 'valid');
  addTicket(ev.gala, u.carlos,   'member', 15, 'valid');
  addTicket(ev.gala, u.mei,      'member', 15, 'valid');
  addTicket(ev.gala, u.david,    'member', 15, 'valid');
  addTicket(ev.gala, u.sofia,    'member', 15, 'valid');
  addTicket(ev.gala, u.alex,     'non-member', 30, 'valid');

  // Hackathon tickets (6 valid)
  addTicket(ev.hackathon, u.carlos,  'member',     0, 'valid');
  addTicket(ev.hackathon, u.mei,     'member',     0, 'valid');
  addTicket(ev.hackathon, u.david,   'member',     0, 'valid');
  addTicket(ev.hackathon, u.sofia,   'member',     0, 'valid');
  addTicket(ev.hackathon, u.alex,    'non-member', 0, 'valid');
  addTicket(ev.hackathon, u.fatima,  'non-member', 0, 'valid');

  // Alumni panel tickets (4 valid)
  addTicket(ev.alumni, u.president, 'member',     5,  'valid');
  addTicket(ev.alumni, u.treasurer, 'member',     5,  'valid');
  addTicket(ev.alumni, u.david,     'member',     5,  'valid');
  addTicket(ev.alumni, u.jake,      'non-member', 15, 'valid');

  // Past orientation — used & cancelled tickets (6)
  addTicket(ev.orientation, u.carlos,   'member', 0, 'used', ago(60));
  addTicket(ev.orientation, u.mei,      'member', 0, 'used', ago(60));
  addTicket(ev.orientation, u.david,    'member', 0, 'used', ago(60));
  addTicket(ev.orientation, u.sofia,    'member', 0, 'used', ago(60));
  addTicket(ev.orientation, u.jake,     'non-member', 0, 'cancelled');
  addTicket(ev.orientation, u.emily,    'non-member', 0, 'cancelled');

  const tickets = await Ticket.insertMany(ticketsRaw);
  console.log(`[Seed] Created ${tickets.length} tickets`);

  // Update ticketsSold counts on events
  await Event.updateOne({ _id: ev.gala._id },        { ticketsSold: 8 });
  await Event.updateOne({ _id: ev.hackathon._id },   { ticketsSold: 6 });
  await Event.updateOne({ _id: ev.alumni._id },       { ticketsSold: 4 });
  await Event.updateOne({ _id: ev.orientation._id },  { ticketsSold: 6 });

  // ═══════════════════════════════════════════════
  //  4. PRODUCTS  (5 items)
  // ═══════════════════════════════════════════════
  const productsRaw = [
    {
      name: 'SSA Signature Navy Hoodie',
      description: 'Premium cotton-blend hoodie with embroidered Skyline SSA crest. Unisex fit.',
      basePrice: 35,
      category: 'hoodie',
      isActive: true,
      variants: [
        { size: 'S',  color: 'Navy', stock: 10, sold: 2 },
        { size: 'M',  color: 'Navy', stock: 12, sold: 3 },
        { size: 'L',  color: 'Navy', stock: 15, sold: 1 },
        { size: 'XL', color: 'Navy', stock: 8,  sold: 0 },
      ],
    },
    {
      name: 'Skyline Stainless Steel Thermal Bottle',
      description: 'Double-walled insulated 500ml bottle with laser-engraved SSA logo. Keeps drinks hot for 12h, cold for 24h.',
      basePrice: 18,
      category: 'other',
      isActive: true,
      variants: [
        { size: 'ONE_SIZE', color: 'Matte Black', stock: 30, sold: 5 },
        { size: 'ONE_SIZE', color: 'Navy',        stock: 30, sold: 3 },
      ],
    },
    {
      name: 'SSA Embroidered Dad Cap',
      description: 'Relaxed-fit cotton cap with SSA wordmark. Adjustable strap.',
      basePrice: 15,
      category: 'cap',
      isActive: true,
      variants: [
        { size: 'ONE_SIZE', color: 'Navy',  stock: 15, sold: 2 },
        { size: 'ONE_SIZE', color: 'Khaki', stock: 15, sold: 1 },
      ],
    },
    {
      name: 'HackSkyline 2026 Commemorative T-Shirt',
      description: 'Limited-edition tee designed by the SSA creative team. Pre-order before the event!',
      basePrice: 12,
      category: 'tshirt',
      isActive: true,
      variants: [
        { size: 'S',  color: 'Black', stock: 20, sold: 4 },
        { size: 'M',  color: 'Black', stock: 25, sold: 6 },
        { size: 'L',  color: 'Black', stock: 20, sold: 2 },
        { size: 'XL', color: 'Black', stock: 15, sold: 0 },
      ],
    },
    {
      name: 'SSA Laptop Sticker Pack (5-Pack)',
      description: 'Set of 5 die-cut vinyl stickers featuring SSA logo, mascot, and campus landmarks.',
      basePrice: 4,
      category: 'sticker',
      isActive: true,
      variants: [
        { size: 'ONE_SIZE', color: 'Default', stock: 150, sold: 18 },
      ],
    },
  ];

  const products = await Product.insertMany(productsRaw);
  console.log(`[Seed] Created ${products.length} products`);

  const pr = {};
  pr.hoodie  = products[0];
  pr.bottle  = products[1];
  pr.cap     = products[2];
  pr.tshirt  = products[3];
  pr.sticker = products[4];

  // ═══════════════════════════════════════════════
  //  5. ORDERS  (10 records)
  // ═══════════════════════════════════════════════
  let orderNum = 1;
  const ordersRaw = [
    // 4 collected (fulfilled)
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.president._id, product: pr.hoodie._id,  variant: { size: 'M',  color: 'Navy' },        quantity: 1, totalPrice: 35, status: 'collected' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.carlos._id,    product: pr.bottle._id,  variant: { size: 'ONE_SIZE', color: 'Matte Black' }, quantity: 1, totalPrice: 18, status: 'collected' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.mei._id,       product: pr.cap._id,     variant: { size: 'ONE_SIZE', color: 'Navy' },   quantity: 1, totalPrice: 15, status: 'collected' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.david._id,     product: pr.sticker._id, variant: { size: 'ONE_SIZE', color: 'Default' }, quantity: 2, totalPrice: 8,  status: 'collected' },
    // 4 confirmed / ready (for demo)
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.sofia._id,     product: pr.hoodie._id,  variant: { size: 'S',  color: 'Navy' },        quantity: 1, totalPrice: 35, status: 'confirmed' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.treasurer._id, product: pr.tshirt._id,  variant: { size: 'L',  color: 'Black' },       quantity: 2, totalPrice: 24, status: 'confirmed' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.vp._id,        product: pr.bottle._id,  variant: { size: 'ONE_SIZE', color: 'Navy' },   quantity: 1, totalPrice: 18, status: 'ready' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.carlos._id,    product: pr.tshirt._id,  variant: { size: 'M',  color: 'Black' },       quantity: 1, totalPrice: 12, status: 'ready' },
    // 2 placed (pending)
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.david._id,     product: pr.hoodie._id,  variant: { size: 'L',  color: 'Navy' },        quantity: 1, totalPrice: 35, status: 'placed' },
    { orderNumber: `ORD-2026-${String(orderNum++).padStart(4,'0')}`, user: u.mei._id,       product: pr.cap._id,     variant: { size: 'ONE_SIZE', color: 'Khaki' },  quantity: 1, totalPrice: 15, status: 'placed' },
  ];

  const orders = await Order.insertMany(ordersRaw);
  console.log(`[Seed] Created ${orders.length} orders`);

  // ═══════════════════════════════════════════════
  //  6. PROJECTS  (2 records)
  // ═══════════════════════════════════════════════
  const projectsRaw = [
    {
      title: 'Annual HackSkyline 2026 Execution',
      description: 'End-to-end planning and execution of the flagship 24-hour hackathon. Covers venue, sponsors, swag, judging, and logistics.',
      deadline: ahead(40),
      linkedEvent: ev.hackathon._id,
      status: 'active',
      createdBy: u.president._id,
    },
    {
      title: 'Tech Gala Event Operations',
      description: 'Coordinate registration, guest experience, photography, and venue logistics for the annual gala.',
      deadline: ahead(25),
      linkedEvent: ev.gala._id,
      status: 'active',
      createdBy: u.president._id,
    },
    {
      title: 'Alumni Panel Event Operations',
      description: 'Prepare the alumni panel venue, seating plan, signage, and guest welcome experience.',
      deadline: ahead(10),
      linkedEvent: ev.alumni._id,
      status: 'active',
      createdBy: u.vp._id,
    },
    {
      title: 'Spring Merchandise Rebrand',
      description: 'Redesign all SSA merchandise with updated branding, new product lines, and supplier negotiations.',
      deadline: ahead(60),
      linkedEvent: null,
      status: 'active',
      createdBy: u.vp._id,
    },
  ];

  const projects = await Project.insertMany(projectsRaw);
  console.log(`[Seed] Created ${projects.length} projects`);

  const pj = {};
  pj.hack  = projects[0];
  pj.gala  = projects[1];
  pj.alumni = projects[2];
  pj.merch = projects[3];

  await Event.updateOne({ _id: ev.gala._id }, { linkedProject: pj.gala._id });
  await Event.updateOne({ _id: ev.alumni._id }, { linkedProject: pj.alumni._id });

  // ═══════════════════════════════════════════════
  //  7. TASKS  (18 records)
  // ═══════════════════════════════════════════════
  const tasksRaw = [
    // ── HackSkyline project (10 tasks) ──
    { title: 'Book Innovation Lab venue',           project: pj.hack._id, assignee: u.president._id, status: 'done',        priority: 'high',   dueDate: ahead(5),  supplies: [] },
    { title: 'Confirm 3 sponsor partnerships',      project: pj.hack._id, assignee: u.vp._id,        status: 'done',        priority: 'high',   dueDate: ahead(10), supplies: [] },
    { title: 'Design event poster & social media',  project: pj.hack._id, assignee: u.mei._id,       status: 'in_progress', priority: 'medium', dueDate: ahead(15), supplies: ['Canva Pro account', 'Brand guidelines PDF'] },
    { title: 'Order swag bags (200 units)',          project: pj.hack._id, assignee: u.carlos._id,    status: 'in_progress', priority: 'high',   dueDate: ahead(20), supplies: ['Stickers x200', 'Pens x200', 'Lanyards x200', 'Tote bags x200'] },
    { title: 'Setup registration page',             project: pj.hack._id, assignee: u.mei._id,       status: 'in_progress', priority: 'medium', dueDate: ahead(25), supplies: [] },
    { title: 'Recruit 8 judges from faculty',       project: pj.hack._id, assignee: u.president._id, status: 'todo',        priority: 'high',   dueDate: ahead(30), supplies: [] },
    { title: 'Arrange catering for 150 people',     project: pj.hack._id, assignee: u.carlos._id,    status: 'todo',        priority: 'medium', dueDate: ahead(35), supplies: ['Pizza x40', 'Drinks x200', 'Snack boxes x150'] },
    { title: 'Setup WiFi and power strips',         project: pj.hack._id, assignee: null,             status: 'todo',        priority: 'low',    dueDate: ahead(40), supplies: ['Extension cords x20', 'Power strips x30'] },
    { title: 'Create judging rubric',               project: pj.hack._id, assignee: u.vp._id,        status: 'done',        priority: 'medium', dueDate: ahead(8),  supplies: [] },
    { title: 'Test live-streaming setup',            project: pj.hack._id, assignee: u.david._id,     status: 'todo',        priority: 'low',    dueDate: ahead(38), supplies: ['Webcam', 'Tripod', 'Streaming laptop'] },

    // ── Tech Gala project (4 tasks) ──
    { title: 'Prepare gala registration desk',      project: pj.gala._id, assignee: u.carlos._id, status: 'in_progress', priority: 'high', dueDate: ahead(20), supplies: ['Check-in tablet', 'Name badges', 'Attendance list'] },
    { title: 'Create gala photo shot list',         project: pj.gala._id, assignee: u.mei._id,    status: 'todo',        priority: 'medium', dueDate: ahead(22), supplies: ['Camera', 'Memory cards'] },
    { title: 'Confirm keynote guest arrival plan',  project: pj.gala._id, assignee: u.president._id, status: 'done', priority: 'high', dueDate: ahead(4), supplies: [] },
    { title: 'Test ticket scanner at entrance',     project: pj.gala._id, assignee: u.carlos._id, status: 'todo', priority: 'medium', dueDate: ahead(27), supplies: ['Charged phone'] },

    // ── Alumni panel project (3 tasks) ──
    { title: 'Arrange panel seating and microphones', project: pj.alumni._id, assignee: u.carlos._id, status: 'todo', priority: 'high', dueDate: ahead(8), supplies: ['Reserved signs', 'Microphones'] },
    { title: 'Prepare alumni welcome table',          project: pj.alumni._id, assignee: u.carlos._id, status: 'done', priority: 'medium', dueDate: ahead(5), supplies: ['Name tags', 'Welcome packets'] },
    { title: 'Review panel run-of-show',              project: pj.alumni._id, assignee: u.vp._id,     status: 'in_progress', priority: 'high', dueDate: ahead(6), supplies: [] },

    // ── Merch Rebrand project (8 tasks) ──
    { title: 'Research new merchandise vendors',    project: pj.merch._id, assignee: u.vp._id,        status: 'done',        priority: 'high',   dueDate: ahead(5),  supplies: [] },
    { title: 'Create new logo variations',          project: pj.merch._id, assignee: u.mei._id,       status: 'done',        priority: 'high',   dueDate: ahead(10), supplies: ['Adobe Illustrator', 'Brand color palette'] },
    { title: 'Get sample hoodies from 3 vendors',   project: pj.merch._id, assignee: u.carlos._id,    status: 'in_progress', priority: 'medium', dueDate: ahead(20), supplies: [] },
    { title: 'Design new sticker pack artwork',     project: pj.merch._id, assignee: u.mei._id,       status: 'in_progress', priority: 'low',    dueDate: ahead(30), supplies: [] },
    { title: 'Price comparison spreadsheet',         project: pj.merch._id, assignee: u.treasurer._id, status: 'in_progress', priority: 'medium', dueDate: ahead(15), supplies: [] },
    { title: 'Place bulk order with chosen vendor',  project: pj.merch._id, assignee: u.vp._id,        status: 'todo',        priority: 'high',   dueDate: ahead(40), supplies: [] },
    { title: 'Setup new product listings on site',   project: pj.merch._id, assignee: u.carlos._id,    status: 'todo',        priority: 'medium', dueDate: ahead(45), supplies: [] },
    { title: 'Plan merch launch promo campaign',     project: pj.merch._id, assignee: u.sofia._id,     status: 'todo',        priority: 'low',    dueDate: ahead(50), supplies: [] },
  ];

  const tasks = await Task.insertMany(tasksRaw);
  console.log(`[Seed] Created ${tasks.length} tasks`);

  // ═══════════════════════════════════════════════
  //  8. EXPENSES  (6 records)
  // ═══════════════════════════════════════════════
  const expensesRaw = [
    // 2 reimbursed
    { submittedBy: u.carlos._id,    amount: 85.50,  category: 'supplies',    description: 'Swag bag sample order from PrintCo',       linkedProject: pj.hack._id,  receiptUrl: '/receipts/swag-sample.pdf',  status: 'reimbursed', reviewedBy: u.treasurer._id, reviewedAt: ago(10), rejectionReason: '' },
    { submittedBy: u.mei._id,       amount: 24.99,  category: 'supplies',    description: 'Canva Pro monthly subscription for designs', linkedProject: pj.merch._id, receiptUrl: '/receipts/canva-pro.pdf',    status: 'reimbursed', reviewedBy: u.treasurer._id, reviewedAt: ago(5),  rejectionReason: '' },
    // 2 approved (ready for payout demo)
    { submittedBy: u.carlos._id,    amount: 120.00, category: 'food',        description: 'Catering deposit for hackathon pizza',       linkedProject: pj.hack._id,  receiptUrl: '/receipts/pizza-deposit.pdf', status: 'approved',  reviewedBy: u.treasurer._id, reviewedAt: ago(2),  rejectionReason: '' },
    { submittedBy: u.vp._id,        amount: 45.00,  category: 'decorations', description: 'Table banners and signage for career panel',  linkedProject: null,         receiptUrl: '/receipts/banners.pdf',      status: 'approved',  reviewedBy: u.treasurer._id, reviewedAt: ago(1),  rejectionReason: '' },
    // 2 submitted (waiting in review queue)
    { submittedBy: u.david._id,     amount: 67.25,  category: 'transport',   description: 'Uber rides for equipment transport',         linkedProject: pj.hack._id,  receiptUrl: '/receipts/uber-rides.pdf',   status: 'submitted', reviewedBy: null,            reviewedAt: null,    rejectionReason: '' },
    { submittedBy: u.sofia._id,     amount: 32.00,  category: 'supplies',    description: 'Markers, poster boards for promo',            linkedProject: pj.merch._id, receiptUrl: '/receipts/art-supplies.pdf', status: 'submitted', reviewedBy: null,            reviewedAt: null,    rejectionReason: '' },
  ];

  const expenses = await Expense.insertMany(expensesRaw);
  console.log(`[Seed] Created ${expenses.length} expenses`);

  // ═══════════════════════════════════════════════
  //  9. TRANSACTIONS  (18 ledger rows)
  // ═══════════════════════════════════════════════
  const txns = [];

  // Membership dues (7 active members × ₹25)
  const activeMembers = [u.admin, u.president, u.vp, u.treasurer, u.carlos, u.mei, u.david];
  activeMembers.forEach((member, i) => {
    txns.push({
      type: 'income',
      category: 'dues',
      amount: 25,
      description: `Membership dues paid by ${member.name} (${member.studentId})`,
      referenceModel: 'User',
      referenceId: member._id,
      createdBy: member._id,
      createdAt: ago(180 - i * 15),
    });
  });

  // Ticket sales income (only paid tickets — gala: 7×₹15 + 1×₹30, alumni: 3×₹5 + 1×₹15)
  txns.push({
    type: 'income', category: 'ticket_sale', amount: 135,
    description: 'Ticket sales for Skyline Annual Tech Gala (7 member + 1 non-member)',
    referenceModel: null, referenceId: null,
    createdBy: u.admin._id, createdAt: ago(3),
  });
  txns.push({
    type: 'income', category: 'ticket_sale', amount: 30,
    description: 'Ticket sales for Alumni Career Panel & Mixer (3 member + 1 non-member)',
    referenceModel: null, referenceId: null,
    createdBy: u.admin._id, createdAt: ago(2),
  });

  // Merch sales income (from fulfilled + confirmed orders)
  txns.push({
    type: 'income', category: 'merch_sale', amount: 215,
    description: 'Merchandise sales — hoodies, bottles, caps, stickers, t-shirts (10 orders)',
    referenceModel: null, referenceId: null,
    createdBy: u.admin._id, createdAt: ago(1),
  });

  // University grant
  txns.push({
    type: 'income', category: 'other', amount: 5000,
    description: 'Student Government Association annual operating grant',
    referenceModel: null, referenceId: null,
    createdBy: u.president._id, createdAt: ago(150),
  });

  // Sofia's dues
  txns.push({
    type: 'income', category: 'dues', amount: 25,
    description: `Membership dues paid by Sofia Martinez (SKY-2024-008)`,
    referenceModel: 'User', referenceId: u.sofia._id,
    createdBy: u.sofia._id, createdAt: ago(60),
  });

  // Expense reimbursements (2 reimbursed expenses)
  txns.push({
    type: 'expense', category: 'reimbursement', amount: 85.50,
    description: 'Reimbursement: Swag bag sample order — Carlos Rivera',
    referenceModel: 'Expense', referenceId: expenses[0]._id,
    createdBy: u.treasurer._id, createdAt: ago(10),
  });
  txns.push({
    type: 'expense', category: 'reimbursement', amount: 24.99,
    description: 'Reimbursement: Canva Pro subscription — Mei Chen',
    referenceModel: 'Expense', referenceId: expenses[1]._id,
    createdBy: u.treasurer._id, createdAt: ago(5),
  });

  // Venue deposit
  txns.push({
    type: 'expense', category: 'other', amount: 1200,
    description: 'Venue booking deposit — Grand Ballroom for Tech Gala',
    referenceModel: null, referenceId: null,
    createdBy: u.president._id, createdAt: ago(45),
  });

  // Additional miscellaneous expenses
  txns.push({
    type: 'expense', category: 'other', amount: 150,
    description: 'Printing costs — flyers, posters, and event signage',
    referenceModel: null, referenceId: null,
    createdBy: u.vp._id, createdAt: ago(30),
  });
  txns.push({
    type: 'expense', category: 'other', amount: 75,
    description: 'Domain renewal and web hosting — skyline-ssa.com',
    referenceModel: null, referenceId: null,
    createdBy: u.admin._id, createdAt: ago(120),
  });

  const transactions = await Transaction.insertMany(txns);
  console.log(`[Seed] Created ${transactions.length} transactions`);

  // ═══════════════════════════════════════════════
  //  10. ANNOUNCEMENTS  (5 notices)
  // ═══════════════════════════════════════════════
  const announcementsRaw = [
    {
      title: 'Welcome to Skyline Student Association 2026-2027!',
      body: 'We are thrilled to kick off another amazing year at SSA! Whether you\'re a returning member or joining for the first time, there\'s a place for you here. Check out our upcoming events, grab some merch, and get involved. Let\'s make this the best year yet!',
      category: 'update',
      postedBy: u.president._id,
      emailSent: false,
    },
    {
      title: 'HackSkyline 2026 Registration Now Live!',
      body: 'Registration for our flagship 24-hour hackathon is officially open! Form a team of up to 4, pick a track, and build something incredible. Prizes include tech gadgets, internship referrals, and campus recognition. Free entry for all students — sign up before spots fill up!',
      category: 'urgent',
      postedBy: u.president._id,
      emailSent: false,
    },
    {
      title: 'SSA Office Hours — Every Tuesday 2-4 PM',
      body: 'Need help with membership, event questions, or expense reimbursements? Drop by the SSA office (Student Center Room 204) every Tuesday from 2-4 PM. No appointment needed.',
      category: 'update',
      postedBy: u.vp._id,
      emailSent: false,
    },
    {
      title: 'Members-Only Merch Discount — This Week Only!',
      body: 'Active SSA members get 20% off all merchandise this week. Use your member dashboard to place orders. Stock is limited, especially for the signature hoodies!',
      category: 'update',
      postedBy: u.vp._id,
      emailSent: false,
    },
    {
      title: 'Executive Board Elections — Nominations Open Nov 1',
      body: 'Interested in leading SSA next year? Nominations for President, Vice President, Treasurer, and Secretary open on November 1st. All active members in good standing are eligible. Election details and candidate requirements will be posted soon.',
      category: 'deadline',
      postedBy: u.admin._id,
      emailSent: false,
    },
  ];

  const announcements = await Announcement.insertMany(announcementsRaw);
  console.log(`[Seed] Created ${announcements.length} announcements`);

  // ═══════════════════════════════════════════════
  //  SUMMARY
  // ═══════════════════════════════════════════════
  // Compute treasury balance from seeded transactions
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  console.log('\n══════════════════════════════════════════');
  console.log('  🌟 SEED COMPLETE — Skyline SSA');
  console.log('══════════════════════════════════════════');
  console.log(`  Users:          ${users.length}`);
  console.log(`  Events:         ${events.length}`);
  console.log(`  Tickets:        ${tickets.length}`);
  console.log(`  Products:       ${products.length}`);
  console.log(`  Orders:         ${orders.length}`);
  console.log(`  Projects:       ${projects.length}`);
  console.log(`  Tasks:          ${tasks.length}`);
  console.log(`  Expenses:       ${expenses.length}`);
  console.log(`  Transactions:   ${transactions.length}`);
  console.log(`  Announcements:  ${announcements.length}`);
  console.log('──────────────────────────────────────────');
  console.log(`  💰 Treasury: ₹${income.toFixed(2)} in  /  ₹${expense.toFixed(2)} out  =  ₹${(income - expense).toFixed(2)} net`);
  console.log('──────────────────────────────────────────');
  console.log('  🔑 Login credentials (all same password):');
  console.log('     Password: Password123!');
  console.log('     admin@skyline.edu      (officer)');
  console.log('     president@skyline.edu  (officer)');
  console.log('     treasurer@skyline.edu  (treasurer)');
  console.log('     carlos@skyline.edu     (volunteer)');
  console.log('     mei@skyline.edu        (volunteer)');
  console.log('     david@skyline.edu      (student/active)');
  console.log('     alex@skyline.edu       (student/none)');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
