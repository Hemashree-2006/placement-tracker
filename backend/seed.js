require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Student, Company, Application, Session } = require('./models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // ── Clear existing data & sync schema ────────────────────────────
    await sequelize.sync({ force: true });
    console.log('🗑️  Cleared all existing tables and re-synced schema');

    // ── 1. Seed Users ────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);

    const users = await User.bulkCreate([
      { email: 'admin@placement.com',        password: await bcrypt.hash('Admin@123',   salt), role: 'Admin'   },
      { email: 'rahul.sharma@student.com',   password: await bcrypt.hash('Student@123', salt), role: 'Student' },
      { email: 'priya.nair@student.com',     password: await bcrypt.hash('Student@123', salt), role: 'Student' },
      { email: 'arjun.mehta@student.com',    password: await bcrypt.hash('Student@123', salt), role: 'Student' },
      { email: 'sneha.reddy@student.com',    password: await bcrypt.hash('Student@123', salt), role: 'Student' },
    ], { returning: true });
    console.log(`✅ Seeded ${users.length} users`);

    // ── 2. Seed Students (linked to user accounts) ───────────────────
    const students = await Student.bulkCreate([
      { userId: users[1].id, name: 'Rahul Sharma', dept: 'CSE', cgpa: 8.7, backlogs: 0, skills: ['Java', 'Spring Boot', 'MySQL', 'Git'],           resumePath: '/resumes/rahul_sharma.pdf' },
      { userId: users[2].id, name: 'Priya Nair',   dept: 'ECE', cgpa: 7.2, backlogs: 1, skills: ['Python', 'Machine Learning', 'TensorFlow'],       resumePath: '/resumes/priya_nair.pdf'   },
      { userId: users[3].id, name: 'Arjun Mehta',  dept: 'CSE', cgpa: 9.1, backlogs: 0, skills: ['React', 'Node.js', 'MongoDB', 'Docker'],          resumePath: '/resumes/arjun_mehta.pdf'  },
      { userId: users[4].id, name: 'Sneha Reddy',  dept: 'IT',  cgpa: 6.8, backlogs: 2, skills: ['C++', 'Data Structures', 'Algorithms'],           resumePath: '/resumes/sneha_reddy.pdf'  },
    ], { returning: true });
    console.log(`✅ Seeded ${students.length} students`);

    // ── 3. Seed Companies ────────────────────────────────────────────
    const companies = await Company.bulkCreate([
      { companyName: 'TCS',     jobRole: 'System Engineer',        salaryPackage: 3.5,  minCgpaRequired: 6.0, maxBacklogsAllowed: 2 },
      { companyName: 'Infosys', jobRole: 'Software Engineer',      salaryPackage: 4.5,  minCgpaRequired: 7.0, maxBacklogsAllowed: 1 },
      { companyName: 'Amazon',  jobRole: 'SDE-1',                  salaryPackage: 18.0, minCgpaRequired: 8.0, maxBacklogsAllowed: 0 },
      { companyName: 'Wipro',   jobRole: 'Project Engineer',       salaryPackage: 3.8,  minCgpaRequired: 6.5, maxBacklogsAllowed: 2 },
      { companyName: 'Google',  jobRole: 'Software Engineer L3',   salaryPackage: 45.0, minCgpaRequired: 8.5, maxBacklogsAllowed: 0 },
    ], { returning: true });
    console.log(`✅ Seeded ${companies.length} companies`);

    // ── 4. Seed Applications ─────────────────────────────────────────
    const applications = await Application.bulkCreate([
      { StudentId: students[0].id, CompanyId: companies[0].id, status: 'Shortlisted' },
      { StudentId: students[0].id, CompanyId: companies[2].id, status: 'Applied'     },
      { StudentId: students[2].id, CompanyId: companies[4].id, status: 'Selected'    },
      { StudentId: students[2].id, CompanyId: companies[2].id, status: 'HR'          },
      { StudentId: students[1].id, CompanyId: companies[1].id, status: 'Applied'     },
      { StudentId: students[3].id, CompanyId: companies[0].id, status: 'Rejected'    },
    ]);
    console.log(`✅ Seeded ${applications.length} applications`);

    // ── 5. Seed Training Sessions ────────────────────────────────────
    const sessions = await Session.bulkCreate([
      { category: 'Aptitude',            sessionDate: new Date('2026-05-20'), trainerName: 'Mr. Venkatesh Kumar'   },
      { category: 'Coding',              sessionDate: new Date('2026-05-22'), trainerName: 'Ms. Ananya Iyer'       },
      { category: 'HR Interview',        sessionDate: new Date('2026-05-25'), trainerName: 'Dr. Rajeev Pillai'     },
      { category: 'Group Discussion',    sessionDate: new Date('2026-05-28'), trainerName: 'Ms. Meena Srinivasan'  },
      { category: 'Technical Interview', sessionDate: new Date('2026-06-01'), trainerName: 'Mr. Suresh Babu'       },
      { category: 'Coding',              sessionDate: new Date('2026-06-05'), trainerName: 'Mr. Karthik Raj'       },
      { category: 'Aptitude',            sessionDate: new Date('2026-06-08'), trainerName: 'Ms. Priya Desai'       },
      { category: 'HR Interview',        sessionDate: new Date('2026-06-10'), trainerName: 'Mr. Arun Prakash'      },
      { category: 'Technical Interview', sessionDate: new Date('2026-06-15'), trainerName: 'Dr. Neha Sharma'       },
      { category: 'Group Discussion',    sessionDate: new Date('2026-06-18'), trainerName: 'Mr. Manish Gupta'      },
    ]);
    console.log(`✅ Seeded ${sessions.length} training sessions`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log('Admin Login  → admin@placement.com   / Admin@123');
    console.log('Student Login→ rahul.sharma@student.com / Student@123');
    console.log('─────────────────────────────────');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
