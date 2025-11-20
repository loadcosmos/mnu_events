import {
  PrismaClient,
  Role,
  Category,
  EventStatus,
  ClubCategory,
  ServiceType,
  ServiceCategory,
  PriceType,
  AdPosition,
  TicketStatus,
  CheckInMode,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean database
  await prisma.checkIn.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.advertisement.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.clubMembership.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Database cleaned');

  // Create users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kazguu.kz',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      emailVerified: true,
      faculty: 'Administration',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@kazguu.kz',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Organizer',
      role: Role.ORGANIZER,
      emailVerified: true,
      faculty: 'Computer Science',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@kazguu.kz',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Moderator',
      role: Role.MODERATOR,
      emailVerified: true,
      faculty: 'Administration',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@kazguu.kz',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Student',
      role: Role.STUDENT,
      emailVerified: true,
      faculty: 'Business',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@kazguu.kz',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Johnson',
      role: Role.STUDENT,
      emailVerified: true,
      faculty: 'Engineering',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@kazguu.kz',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Brown',
      role: Role.STUDENT,
      emailVerified: true,
      faculty: 'Law',
    },
  });

  console.log('✅ Users created');

  // Create events
  const events = [];

  // Используем текущий год для событий в декабре
  // Если сейчас ноябрь 2025, события будут в декабре 2025
  const currentYear = new Date().getFullYear();
  const eventYear = currentYear; // Используем текущий год для событий в декабре

  const event1 = await prisma.event.create({
    data: {
      title: 'Hackathon 2025',
      description:
        'Annual coding competition for students. Build innovative solutions in 24 hours! Prizes for top 3 teams.',
      category: Category.TECH,
      location: 'Main Hall, Building A',
      startDate: new Date(`${eventYear}-12-15T10:00:00`),
      endDate: new Date(`${eventYear}-12-15T18:00:00`),
      capacity: 100,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
      creatorId: organizer.id,
    },
  });
  events.push(event1);

  const event2 = await prisma.event.create({
    data: {
      title: 'Career Fair 2025',
      description:
        'Meet top employers and explore career opportunities. Bring your resume and dress professionally.',
      category: Category.CAREER,
      location: 'Sports Complex',
      startDate: new Date(`${eventYear}-12-20T09:00:00`),
      endDate: new Date(`${eventYear}-12-20T17:00:00`),
      capacity: 200,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1560439514-4e9645039924',
      creatorId: admin.id,
    },
  });
  events.push(event2);

  const event3 = await prisma.event.create({
    data: {
      title: 'Football Tournament',
      description:
        'Inter-faculty football championship. Register your team now! 7 players per team.',
      category: Category.SPORTS,
      location: 'Stadium',
      startDate: new Date(`${eventYear}-12-10T14:00:00`),
      endDate: new Date(`${eventYear}-12-10T18:00:00`),
      capacity: 50,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
      creatorId: organizer.id,
    },
  });
  events.push(event3);

  const event4 = await prisma.event.create({
    data: {
      title: 'Cultural Night: Kazakhstan',
      description:
        'Celebrate Kazakh culture with traditional music, dance, and food. Free entry for all students.',
      category: Category.CULTURAL,
      location: 'Concert Hall',
      startDate: new Date(`${eventYear}-12-18T18:00:00`),
      endDate: new Date(`${eventYear}-12-18T21:00:00`),
      capacity: 150,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      creatorId: admin.id,
    },
  });
  events.push(event4);

  const event5 = await prisma.event.create({
    data: {
      title: 'AI & Machine Learning Workshop',
      description:
        'Learn the basics of AI and ML from industry experts. Hands-on coding session included.',
      category: Category.ACADEMIC,
      location: 'Room 301, Building B',
      startDate: new Date(`${eventYear}-12-12T10:00:00`),
      endDate: new Date(`${eventYear}-12-12T13:00:00`),
      capacity: 40,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      creatorId: organizer.id,
    },
  });
  events.push(event5);

  const event6 = await prisma.event.create({
    data: {
      title: 'Student Mixer',
      description:
        'Meet new friends and network with fellow students. Refreshments will be provided.',
      category: Category.SOCIAL,
      location: 'Student Lounge',
      startDate: new Date(`${eventYear}-12-08T17:00:00`),
      endDate: new Date(`${eventYear}-12-08T20:00:00`),
      capacity: 80,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      creatorId: admin.id,
    },
  });
  events.push(event6);

  const event7 = await prisma.event.create({
    data: {
      title: 'Startup Pitch Competition',
      description:
        'Present your startup idea to investors. Top 3 winners receive seed funding!',
      category: Category.CAREER,
      location: 'Innovation Lab',
      startDate: new Date(`${eventYear}-12-22T13:00:00`),
      endDate: new Date(`${eventYear}-12-22T17:00:00`),
      capacity: 60,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd',
      creatorId: organizer.id,
    },
  });
  events.push(event7);

  const event8 = await prisma.event.create({
    data: {
      title: 'Chess Championship',
      description: 'University chess tournament. All skill levels welcome. Prizes for top 3 players.',
      category: Category.SPORTS,
      location: 'Library Conference Room',
      startDate: new Date(`${eventYear}-12-14T10:00:00`),
      endDate: new Date(`${eventYear}-12-14T16:00:00`),
      capacity: 30,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b',
      creatorId: admin.id,
    },
  });
  events.push(event8);

  const event9 = await prisma.event.create({
    data: {
      title: 'Photography Exhibition',
      description:
        'Student photography showcase. Submit your best work and vote for your favorites!',
      category: Category.CULTURAL,
      location: 'Art Gallery',
      startDate: new Date(`${eventYear}-12-16T12:00:00`),
      endDate: new Date(`${eventYear}-12-16T18:00:00`),
      capacity: 100,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
      creatorId: organizer.id,
    },
  });
  events.push(event9);

  const event10 = await prisma.event.create({
    data: {
      title: 'Volunteer Day',
      description:
        'Join us in giving back to the community. Various volunteer activities available.',
      category: Category.SOCIAL,
      location: 'City Community Center',
      startDate: new Date(`${eventYear}-12-09T09:00:00`),
      endDate: new Date(`${eventYear}-12-09T15:00:00`),
      capacity: 50,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a',
      creatorId: admin.id,
    },
  });
  events.push(event10);

  // Create paid events
  const paidEvent1 = await prisma.event.create({
    data: {
      title: 'Premium Networking Gala',
      description:
        'Exclusive networking event with industry leaders and successful entrepreneurs. Ticket includes dinner and drinks.',
      category: Category.CAREER,
      location: 'Grand Ballroom, Rixos Hotel',
      startDate: new Date(`${eventYear}-12-25T19:00:00`),
      endDate: new Date(`${eventYear}-12-25T23:00:00`),
      capacity: 50,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      creatorId: organizer.id,
      isPaid: true,
      price: 5000,
      platformFee: 500,
      checkInMode: CheckInMode.ORGANIZER_SCANS,
    },
  });
  events.push(paidEvent1);

  const paidEvent2 = await prisma.event.create({
    data: {
      title: 'Advanced Python Bootcamp',
      description:
        '3-hour intensive Python programming course with certification. Materials and laptop provided.',
      category: Category.TECH,
      location: 'IT Lab, Building C',
      startDate: new Date(`${eventYear}-12-19T10:00:00`),
      endDate: new Date(`${eventYear}-12-19T13:00:00`),
      capacity: 30,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      creatorId: organizer.id,
      isPaid: true,
      price: 3000,
      platformFee: 300,
      checkInMode: CheckInMode.ORGANIZER_SCANS,
    },
  });
  events.push(paidEvent2);

  const freeLecture = await prisma.event.create({
    data: {
      title: 'Introduction to AI - Open Lecture',
      description:
        'Free educational lecture on Artificial Intelligence basics. Open to all students.',
      category: Category.ACADEMIC,
      location: 'Lecture Hall 1, Building B',
      startDate: new Date(`${eventYear}-12-11T14:00:00`),
      endDate: new Date(`${eventYear}-12-11T16:00:00`),
      capacity: 200,
      status: EventStatus.UPCOMING,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
      creatorId: admin.id,
      isPaid: false,
      checkInMode: CheckInMode.STUDENTS_SCAN,
      eventQRCode: 'EVENT_QR_' + Date.now(),
      qrCodeExpiry: new Date(`${eventYear}-12-11T17:00:00`),
    },
  });
  events.push(freeLecture);

  console.log('✅ Events created (including paid and free lecture events)');

  // Create registrations
  await prisma.registration.create({
    data: {
      userId: student1.id,
      eventId: event1.id,
      status: 'REGISTERED',
    },
  });

  await prisma.registration.create({
    data: {
      userId: student1.id,
      eventId: event2.id,
      status: 'REGISTERED',
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });

  await prisma.registration.create({
    data: {
      userId: student2.id,
      eventId: event1.id,
      status: 'REGISTERED',
    },
  });

  await prisma.registration.create({
    data: {
      userId: student2.id,
      eventId: event3.id,
      status: 'REGISTERED',
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });

  await prisma.registration.create({
    data: {
      userId: student3.id,
      eventId: event1.id,
      status: 'REGISTERED',
    },
  });

  await prisma.registration.create({
    data: {
      userId: student3.id,
      eventId: event4.id,
      status: 'REGISTERED',
    },
  });

  await prisma.registration.create({
    data: {
      userId: student3.id,
      eventId: event5.id,
      status: 'REGISTERED',
    },
  });

  console.log('✅ Registrations created');

  // Create paid tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      eventId: paidEvent1.id,
      userId: student1.id,
      price: 5000,
      platformFee: 500,
      status: TicketStatus.PAID,
      paymentMethod: 'mock',
      transactionId: 'MOCK_TXN_' + Date.now() + '_1',
      qrCode: 'data:image/png;base64,MOCK_QR_CODE_1',
      purchasedAt: new Date(),
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      eventId: paidEvent1.id,
      userId: student2.id,
      price: 5000,
      platformFee: 500,
      status: TicketStatus.PAID,
      paymentMethod: 'mock',
      transactionId: 'MOCK_TXN_' + Date.now() + '_2',
      qrCode: 'data:image/png;base64,MOCK_QR_CODE_2',
      purchasedAt: new Date(),
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      eventId: paidEvent2.id,
      userId: student3.id,
      price: 3000,
      platformFee: 300,
      status: TicketStatus.PAID,
      paymentMethod: 'mock',
      transactionId: 'MOCK_TXN_' + Date.now() + '_3',
      qrCode: 'data:image/png;base64,MOCK_QR_CODE_3',
      purchasedAt: new Date(),
    },
  });

  console.log('✅ Tickets created');

  // Create check-ins
  await prisma.checkIn.create({
    data: {
      eventId: freeLecture.id,
      userId: student1.id,
      scanMode: CheckInMode.STUDENTS_SCAN,
      checkedInAt: new Date(),
    },
  });

  await prisma.checkIn.create({
    data: {
      eventId: freeLecture.id,
      userId: student2.id,
      scanMode: CheckInMode.STUDENTS_SCAN,
      checkedInAt: new Date(),
    },
  });

  console.log('✅ Check-ins created');

  // Create services
  const service1 = await prisma.service.create({
    data: {
      providerId: student1.id,
      type: ServiceType.GENERAL,
      title: 'Professional Logo Design',
      description:
        'Custom logo design for your business or personal brand. Includes 3 concepts and unlimited revisions.',
      category: ServiceCategory.DESIGN,
      price: 15000,
      priceType: PriceType.FIXED,
      imageUrl: 'https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67',
      rating: 4.8,
      reviewCount: 12,
      isActive: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      providerId: student2.id,
      type: ServiceType.GENERAL,
      title: 'Event Photography & Videography',
      description:
        'Professional photography and video services for events, parties, and special occasions.',
      category: ServiceCategory.PHOTO_VIDEO,
      price: 25000,
      priceType: PriceType.PER_SESSION,
      imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
      rating: 4.9,
      reviewCount: 18,
      isActive: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      providerId: student3.id,
      type: ServiceType.GENERAL,
      title: 'Web Development & IT Consulting',
      description:
        'Full-stack web development, app development, and IT consulting services.',
      category: ServiceCategory.IT,
      price: 8000,
      priceType: PriceType.HOURLY,
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      rating: 4.7,
      reviewCount: 9,
      isActive: true,
    },
  });

  const tutoring1 = await prisma.service.create({
    data: {
      providerId: organizer.id,
      type: ServiceType.TUTORING,
      title: 'Math Tutoring - Calculus & Algebra',
      description:
        'Expert math tutoring for university students. Specializing in Calculus I, II, Linear Algebra.',
      category: ServiceCategory.MATH,
      price: 5000,
      priceType: PriceType.HOURLY,
      imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      rating: 5.0,
      reviewCount: 24,
      isActive: true,
    },
  });

  const tutoring2 = await prisma.service.create({
    data: {
      providerId: student1.id,
      type: ServiceType.TUTORING,
      title: 'English Language Tutoring - IELTS Prep',
      description:
        'IELTS preparation and general English language tutoring. Native-level fluency.',
      category: ServiceCategory.ENGLISH,
      price: 4000,
      priceType: PriceType.HOURLY,
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
      rating: 4.9,
      reviewCount: 15,
      isActive: true,
    },
  });

  const tutoring3 = await prisma.service.create({
    data: {
      providerId: student2.id,
      type: ServiceType.TUTORING,
      title: 'Programming Tutoring - Python, JavaScript',
      description:
        'Learn programming from scratch or advance your skills. Python, JavaScript, React, Node.js.',
      category: ServiceCategory.PROGRAMMING,
      price: 6000,
      priceType: PriceType.HOURLY,
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      rating: 4.8,
      reviewCount: 20,
      isActive: true,
    },
  });

  console.log('✅ Services created');

  // Create advertisements
  const ad1 = await prisma.advertisement.create({
    data: {
      title: 'Kaspi Bank Student Card',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
      linkUrl: 'https://kaspi.kz',
      position: AdPosition.TOP_BANNER,
      isActive: true,
      startDate: new Date(`${eventYear}-12-01T00:00:00`),
      endDate: new Date(`${eventYear}-12-31T23:59:59`),
      impressions: 1250,
      clicks: 85,
    },
  });

  const ad2 = await prisma.advertisement.create({
    data: {
      title: 'Tech Internship Program',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
      linkUrl: null,
      position: AdPosition.HERO_SLIDE,
      isActive: true,
      startDate: new Date(`${eventYear}-12-01T00:00:00`),
      endDate: new Date(`${eventYear}-12-31T23:59:59`),
      impressions: 3200,
      clicks: 240,
    },
  });

  const ad3 = await prisma.advertisement.create({
    data: {
      title: 'Coffee Shop - Student Discount',
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
      linkUrl: null,
      position: AdPosition.NATIVE_FEED,
      isActive: true,
      startDate: new Date(`${eventYear}-12-01T00:00:00`),
      endDate: new Date(`${eventYear}-12-31T23:59:59`),
      impressions: 950,
      clicks: 67,
    },
  });

  const ad4 = await prisma.advertisement.create({
    data: {
      title: 'Language Center - 20% Off',
      imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
      linkUrl: null,
      position: AdPosition.BOTTOM_BANNER,
      isActive: true,
      startDate: new Date(`${eventYear}-12-01T00:00:00`),
      endDate: new Date(`${eventYear}-12-31T23:59:59`),
      impressions: 820,
      clicks: 45,
    },
  });

  console.log('✅ Advertisements created');

  // Create clubs
  const club1 = await prisma.club.create({
    data: {
      name: 'Tech Innovation Club',
      description: 'A community for tech enthusiasts to share ideas, work on projects, and learn about the latest technologies. We organize hackathons, coding workshops, and tech talks.',
      category: ClubCategory.TECH,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      organizerId: organizer.id,
    },
  });

  const club2 = await prisma.club.create({
    data: {
      name: 'Debate Society',
      description: 'Develop your public speaking and critical thinking skills. We participate in regional and national debate competitions.',
      category: ClubCategory.ACADEMIC,
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      organizerId: admin.id,
    },
  });

  const club3 = await prisma.club.create({
    data: {
      name: 'Photography Club',
      description: 'Capture moments and tell stories through photography. We organize photo walks, exhibitions, and workshops.',
      category: ClubCategory.ARTS,
      imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
      organizerId: organizer.id,
    },
  });

  const club4 = await prisma.club.create({
    data: {
      name: 'Football Team',
      description: 'Join our university football team! We practice regularly and compete in inter-university tournaments.',
      category: ClubCategory.SPORTS,
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
      organizerId: admin.id,
    },
  });

  const club5 = await prisma.club.create({
    data: {
      name: 'Volunteer Network',
      description: 'Make a difference in your community. We organize volunteer activities, charity events, and community service projects.',
      category: ClubCategory.SERVICE,
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a',
      organizerId: organizer.id,
    },
  });

  const club6 = await prisma.club.create({
    data: {
      name: 'Cultural Exchange',
      description: 'Celebrate diversity and learn about different cultures. We organize cultural nights, language exchange sessions, and international food festivals.',
      category: ClubCategory.CULTURAL,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      organizerId: admin.id,
    },
  });

  // Add members to clubs
  await prisma.clubMembership.create({
    data: {
      userId: student1.id,
      clubId: club1.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student2.id,
      clubId: club1.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student1.id,
      clubId: club2.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student3.id,
      clubId: club3.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student2.id,
      clubId: club4.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student1.id,
      clubId: club5.id,
      role: 'MEMBER',
    },
  });

  await prisma.clubMembership.create({
    data: {
      userId: student3.id,
      clubId: club6.id,
      role: 'MEMBER',
    },
  });

  console.log('✅ Clubs created');

  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   🌱 Database seeded successfully!                           ║
  ║                                                              ║
  ║   Test Accounts:                                             ║
  ║   ────────────────────────────────────────────────────────   ║
  ║   Admin:      admin@kazguu.kz                                ║
  ║   Organizer:  organizer@kazguu.kz                            ║
  ║   Moderator:  moderator@kazguu.kz                            ║
  ║   Student 1:  student1@kazguu.kz                             ║
  ║   Student 2:  student2@kazguu.kz                             ║
  ║   Student 3:  student3@kazguu.kz                             ║
  ║                                                              ║
  ║   Password for all: Password123!                             ║
  ║                                                              ║
  ║   Created:                                                   ║
  ║   - 6 Users (1 Admin, 1 Organizer, 1 Moderator, 3 Students) ║
  ║   - 13 Events (10 free + 2 paid + 1 lecture)                 ║
  ║   - 7 Free Registrations                                     ║
  ║   - 3 Paid Tickets (with QR codes)                           ║
  ║   - 2 Check-ins (student scan mode)                          ║
  ║   - 6 Services (3 general + 3 tutoring)                      ║
  ║   - 4 Advertisements (various positions)                     ║
  ║   - 6 Clubs (various categories)                             ║
  ║   - 7 Club Memberships                                       ║
  ║                                                              ║
  ║   💰 Monetization Features Ready:                            ║
  ║   - Paid events with tickets                                 ║
  ║   - QR check-in (2 modes)                                    ║
  ║   - Services marketplace                                     ║
  ║   - Advertisement system                                     ║
  ║                                                              ║
  ║   🛡️ Moderation System Ready:                                ║
  ║   - Content moderation queue                                 ║
  ║   - Moderator role with access to /moderator dashboard       ║
  ║   - Validation filters for spam prevention                   ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
