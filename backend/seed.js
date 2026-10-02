const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // 1. Ensure Default Administrator exists (hasanfaarah07@gmail.com)
    let admin = await User.findOne({ email: 'hasanfaarah07@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Smart Academy Admin',
        email: 'hasanfaarah07@gmail.com',
        passwordHash: 'Admin@123456',
        role: 'admin',
        phone: '+1 (555) 100-2000',
        isActive: true
      });
      console.log('✅ Default Admin created: hasanfaarah07@gmail.com / Admin@123456');
    } else {
      console.log('ℹ️ Admin account already exists: hasanfaarah07@gmail.com');
    }

    // 2. Ensure Sample Teachers exist
    let teacherAhmed = await User.findOne({ email: 'ahmed.hassan@smartacademy.edu' });
    if (!teacherAhmed) {
      teacherAhmed = await User.create({
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@smartacademy.edu',
        passwordHash: 'Teacher@123456',
        role: 'teacher',
        phone: '+1 (555) 234-5671',
        isActive: true
      });
      console.log('✅ Sample Teacher created: ahmed.hassan@smartacademy.edu / Teacher@123456');
    }

    let teacherFatima = await User.findOne({ email: 'fatima.ali@smartacademy.edu' });
    if (!teacherFatima) {
      teacherFatima = await User.create({
        name: 'Fatima Ali',
        email: 'fatima.ali@smartacademy.edu',
        passwordHash: 'Teacher@123456',
        role: 'teacher',
        phone: '+1 (555) 345-6782',
        isActive: true
      });
      console.log('✅ Sample Teacher created: fatima.ali@smartacademy.edu / Teacher@123456');
    }

    // 3. Ensure Sample Classes exist & link to teachers
    let class8A = await Class.findOne({ name: 'Grade 8 - Section A' });
    if (!class8A) {
      class8A = await Class.create({
        name: 'Grade 8 - Section A',
        grade: 'Grade 8',
        section: 'A',
        academicTerm: 'Fall 2026 / Spring 2027',
        teacherId: teacherAhmed._id,
        isActive: true
      });
      await User.findByIdAndUpdate(teacherAhmed._id, { $addToSet: { assignedClasses: class8A._id } });
      console.log('✅ Created Class: Grade 8 - Section A (Teacher: Ahmed Hassan)');
    }

    let class9B = await Class.findOne({ name: 'Grade 9 - Section B' });
    if (!class9B) {
      class9B = await Class.create({
        name: 'Grade 9 - Section B',
        grade: 'Grade 9',
        section: 'B',
        academicTerm: 'Fall 2026 / Spring 2027',
        teacherId: teacherFatima._id,
        isActive: true
      });
      await User.findByIdAndUpdate(teacherFatima._id, { $addToSet: { assignedClasses: class9B._id } });
      console.log('✅ Created Class: Grade 9 - Section B (Teacher: Fatima Ali)');
    }

    let classWebDev = await Class.findOne({ name: 'Web Development - Cohort 1' });
    if (!classWebDev) {
      classWebDev = await Class.create({
        name: 'Web Development - Cohort 1',
        grade: 'Bootcamp',
        section: 'Cohort 1',
        academicTerm: 'Fall 2026 / Spring 2027',
        teacherId: teacherAhmed._id,
        isActive: true
      });
      await User.findByIdAndUpdate(teacherAhmed._id, { $addToSet: { assignedClasses: classWebDev._id } });
      console.log('✅ Created Class: Web Development - Cohort 1 (Teacher: Ahmed Hassan)');
    }

    // 4. Safely connect existing students to classes if classId is missing
    const unlinkedStudents = await Student.find({ $or: [{ classId: null }, { classId: { $exists: false } }] });
    if (unlinkedStudents.length > 0) {
      console.log(`Linking ${unlinkedStudents.length} legacy student(s) to classes...`);
      for (let i = 0; i < unlinkedStudents.length; i++) {
        const student = unlinkedStudents[i];
        // Distribute among classes
        const targetClass = i % 2 === 0 ? class8A._id : class9B._id;
        student.classId = targetClass;
        await student.save();
      }
      console.log('✅ Legacy students linked to classes successfully.');
    }

    // 5. Connect legacy attendance records to classes & teachers if missing
    const unlinkedAttendance = await Attendance.find({
      $or: [{ classId: null }, { classId: { $exists: false } }]
    }).populate('student');

    if (unlinkedAttendance.length > 0) {
      console.log(`Updating ${unlinkedAttendance.length} historical attendance entries with class & teacher references...`);
      for (const rec of unlinkedAttendance) {
        if (rec.student && rec.student.classId) {
          rec.classId = rec.student.classId;
          rec.teacherId = teacherAhmed._id;
          await rec.save();
        }
      }
      console.log('✅ Historical attendance records linked successfully.');
    }

    console.log('\n🎉 Multi-Teacher System Seed & Migration Completed Successfully!');
    console.log('===============================================================');
    console.log('ADMIN LOGIN:    hasanfaarah07@gmail.com    Password: Admin@123456');
    console.log('TEACHER 1 LOGIN: ahmed.hassan@smartacademy.edu Password: Teacher@123456');
    console.log('TEACHER 2 LOGIN: fatima.ali@smartacademy.edu   Password: Teacher@123456');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
