const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

dotenv.config();

const sampleStudents = [
  {
    fullName: 'Alice Johnson',
    email: 'alice.johnson@attendflow.edu',
    phone: '+1 (555) 234-5678',
    gender: 'Female',
    course: 'Full-Stack Web Development',
    enrollmentDate: new Date('2024-01-15'),
    status: 'Active'
  },
  {
    fullName: 'Marcus Vance',
    email: 'marcus.vance@attendflow.edu',
    phone: '+1 (555) 345-6789',
    gender: 'Male',
    course: 'Full-Stack Web Development',
    enrollmentDate: new Date('2024-01-15'),
    status: 'Active'
  },
  {
    fullName: 'Sophia Chen',
    email: 'sophia.chen@attendflow.edu',
    phone: '+1 (555) 456-7890',
    gender: 'Female',
    course: 'Data Science & AI',
    enrollmentDate: new Date('2024-02-01'),
    status: 'Active'
  },
  {
    fullName: 'David Okafor',
    email: 'david.okafor@attendflow.edu',
    phone: '+1 (555) 567-8901',
    gender: 'Male',
    course: 'Data Science & AI',
    enrollmentDate: new Date('2024-02-01'),
    status: 'Active'
  },
  {
    fullName: 'Elena Rostova',
    email: 'elena.rostova@attendflow.edu',
    phone: '+1 (555) 678-9012',
    gender: 'Female',
    course: 'UI/UX Product Design',
    enrollmentDate: new Date('2024-02-15'),
    status: 'Active'
  },
  {
    fullName: 'Liam O\'Connor',
    email: 'liam.oconnor@attendflow.edu',
    phone: '+1 (555) 789-0123',
    gender: 'Male',
    course: 'UI/UX Product Design',
    enrollmentDate: new Date('2024-02-15'),
    status: 'Active'
  },
  {
    fullName: 'Zainab Al-Mansoor',
    email: 'zainab.mansoor@attendflow.edu',
    phone: '+1 (555) 890-1234',
    gender: 'Female',
    course: 'Cybersecurity Analyst',
    enrollmentDate: new Date('2024-03-01'),
    status: 'Active'
  },
  {
    fullName: 'Kenji Takahashi',
    email: 'kenji.takahashi@attendflow.edu',
    phone: '+1 (555) 901-2345',
    gender: 'Male',
    course: 'Cybersecurity Analyst',
    enrollmentDate: new Date('2024-03-01'),
    status: 'Active'
  },
  {
    fullName: 'Amara Diop',
    email: 'amara.diop@attendflow.edu',
    phone: '+1 (555) 012-3456',
    gender: 'Female',
    course: 'Cloud & DevOps Engineering',
    enrollmentDate: new Date('2024-03-15'),
    status: 'Active'
  },
  {
    fullName: 'Lucas Morales',
    email: 'lucas.morales@attendflow.edu',
    phone: '+1 (555) 123-4567',
    gender: 'Male',
    course: 'Cloud & DevOps Engineering',
    enrollmentDate: new Date('2024-03-15'),
    status: 'Active'
  },
  {
    fullName: 'Chloe Bennett',
    email: 'chloe.bennett@attendflow.edu',
    phone: '+1 (555) 234-0987',
    gender: 'Female',
    course: 'Mobile App Development',
    enrollmentDate: new Date('2024-04-01'),
    status: 'Active'
  },
  {
    fullName: 'Tariq Hassan',
    email: 'tariq.hassan@attendflow.edu',
    phone: '+1 (555) 345-1098',
    gender: 'Male',
    course: 'Mobile App Development',
    enrollmentDate: new Date('2024-04-01'),
    status: 'Inactive'
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendflow';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear old data
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleaned existing records.');

    // Insert students
    const insertedStudents = await Student.insertMany(sampleStudents);
    console.log(`Inserted ${insertedStudents.length} students.`);

    // Generate realistic attendance history for the past 10 days
    const attendanceRecords = [];
    const statuses = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent'];

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let dayOffset = 9; dayOffset >= 0; dayOffset--) {
      const recordDate = new Date(today);
      recordDate.setUTCDate(recordDate.getUTCDate() - dayOffset);

      // Skip weekend days (Saturday=6, Sunday=0)
      const dayOfWeek = recordDate.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const student of insertedStudents) {
        if (student.status === 'Inactive') continue;

        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        let note = '';
        if (randomStatus === 'Late') note = 'Arrived 15 minutes late due to traffic';
        if (randomStatus === 'Absent') note = 'Medical excused absence';

        attendanceRecords.push({
          student: student._id,
          date: recordDate,
          status: randomStatus,
          note
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Inserted ${attendanceRecords.length} historical attendance records.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
