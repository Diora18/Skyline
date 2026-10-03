const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Project = require('../models/Project');

dotenv.config();

async function linkEventProjects() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skyline_ssa');

  const events = await Event.find({}).sort({ startDate: 1 });
  let created = 0;

  for (const event of events) {
    if (event.linkedProject) {
      const existingProject = await Project.exists({ _id: event.linkedProject });
      if (existingProject) continue;
      event.linkedProject = null;
    }

    const project = await Project.create({
      title: `${event.title} - Operations & Logistics`,
      description: `Planning and task board for ${event.title}`,
      deadline: event.startDate,
      linkedEvent: event._id,
      status: 'active',
      createdBy: event.createdBy,
    });

    event.linkedProject = project._id;
    await event.save();
    created += 1;
    console.log(`Linked project to "${event.title}"`);
  }

  console.log(`Created ${created} event project board(s).`);
  await mongoose.disconnect();
}

linkEventProjects().catch(async (error) => {
  console.error(`[Event project migration failed] ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
