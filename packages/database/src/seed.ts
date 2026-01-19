import { db } from "./index";
import { nanoid } from "nanoid";
import {
  user,
  organization,
  member,
  business,
  gym,
  gymMember,
  classType,
  classSchedule,
  trainer,
  trainerAvailability,
  ptPackage,
  subscriptionPlan,
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create demo owner user
  const ownerId = nanoid();
  await db.insert(user).values({
    id: ownerId,
    name: "Demo Owner",
    email: "owner@demo.com",
    emailVerified: true,
    role: "owner",
  });

  // Create organization
  const orgId = nanoid();
  await db.insert(organization).values({
    id: orgId,
    name: "Demo Fitness Co",
    slug: "demo-fitness-co",
  });

  // Add owner as org member
  await db.insert(member).values({
    id: nanoid(),
    organizationId: orgId,
    userId: ownerId,
    role: "owner",
  });

  // Create business
  const businessId = nanoid();
  await db.insert(business).values({
    id: businessId,
    organizationId: orgId,
    name: "Demo Fitness Co",
    email: "contact@demofitness.com",
    phone: "+1 555 0100",
  });

  // Create gyms
  const gym1Id = nanoid();
  const gym2Id = nanoid();
  await db.insert(gym).values([
    {
      id: gym1Id,
      businessId,
      name: "Downtown Gym",
      slug: "downtown-gym",
      address: "123 Main St, Downtown",
      phone: "+1 555 0101",
      facilities: JSON.stringify(["weights", "cardio", "pool", "sauna"]),
      openingHours: JSON.stringify({
        monday: { open: "06:00", close: "22:00" },
        tuesday: { open: "06:00", close: "22:00" },
        wednesday: { open: "06:00", close: "22:00" },
        thursday: { open: "06:00", close: "22:00" },
        friday: { open: "06:00", close: "21:00" },
        saturday: { open: "08:00", close: "20:00" },
        sunday: { open: "08:00", close: "18:00" },
      }),
    },
    {
      id: gym2Id,
      businessId,
      name: "Westside Fitness",
      slug: "westside-fitness",
      address: "456 West Ave, Westside",
      phone: "+1 555 0102",
      facilities: JSON.stringify(["weights", "cardio", "studio"]),
    },
  ]);

  // Create subscription plans
  await db.insert(subscriptionPlan).values([
    {
      id: nanoid(),
      businessId,
      name: "Basic Monthly",
      description: "Access to gym equipment and cardio area",
      priceInCents: 2999,
      billingPeriod: "monthly",
      features: JSON.stringify(["Gym access", "Cardio equipment", "Locker"]),
    },
    {
      id: nanoid(),
      businessId,
      name: "Premium Monthly",
      description: "Full access including classes and pool",
      priceInCents: 4999,
      billingPeriod: "monthly",
      features: JSON.stringify(["Full gym access", "All classes", "Pool & sauna", "Guest passes"]),
    },
    {
      id: nanoid(),
      businessId,
      name: "Annual Premium",
      description: "Best value - full access for a year",
      priceInCents: 49900,
      billingPeriod: "yearly",
      features: JSON.stringify(["Full gym access", "All classes", "Pool & sauna", "Guest passes", "2 months free"]),
    },
  ]);

  // Create trainers
  const trainer1Id = nanoid();
  const trainer2Id = nanoid();
  await db.insert(trainer).values([
    {
      id: trainer1Id,
      gymId: gym1Id,
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@demofitness.com",
      phone: "+1 555 0201",
      bio: "Certified personal trainer with 10+ years experience in strength training.",
      specialties: JSON.stringify(["Strength Training", "Weight Loss", "Bodybuilding"]),
      certifications: JSON.stringify(["ACE Certified", "NASM-CPT"]),
      hourlyRate: 7500,
    },
    {
      id: trainer2Id,
      gymId: gym1Id,
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@demofitness.com",
      phone: "+1 555 0202",
      bio: "Yoga instructor and wellness coach specializing in mindfulness.",
      specialties: JSON.stringify(["Yoga", "Pilates", "Meditation"]),
      certifications: JSON.stringify(["RYT-500", "Pilates Certified"]),
      hourlyRate: 6500,
    },
  ]);

  // Create trainer availability
  for (let day = 1; day <= 5; day++) { // Monday to Friday
    await db.insert(trainerAvailability).values([
      { id: nanoid(), trainerId: trainer1Id, dayOfWeek: day, startTime: "08:00", endTime: "16:00" },
      { id: nanoid(), trainerId: trainer2Id, dayOfWeek: day, startTime: "09:00", endTime: "17:00" },
    ]);
  }

  // Create class types
  const yogaClassId = nanoid();
  const spinClassId = nanoid();
  const hiitClassId = nanoid();
  await db.insert(classType).values([
    {
      id: yogaClassId,
      gymId: gym1Id,
      name: "Morning Yoga",
      description: "Start your day with a rejuvenating yoga session",
      durationMinutes: 60,
      maxCapacity: 20,
      color: "#10b981",
    },
    {
      id: spinClassId,
      gymId: gym1Id,
      name: "Spin Class",
      description: "High-intensity cycling workout",
      durationMinutes: 45,
      maxCapacity: 15,
      color: "#f59e0b",
    },
    {
      id: hiitClassId,
      gymId: gym1Id,
      name: "HIIT Training",
      description: "High-Intensity Interval Training for maximum calorie burn",
      durationMinutes: 30,
      maxCapacity: 25,
      color: "#ef4444",
    },
  ]);

  // Create class schedules
  await db.insert(classSchedule).values([
    // Morning Yoga - Mon, Wed, Fri at 7:00 AM
    { id: nanoid(), classTypeId: yogaClassId, gymId: gym1Id, instructorId: trainer2Id, dayOfWeek: 1, startTime: "07:00", endTime: "08:00", room: "Studio A" },
    { id: nanoid(), classTypeId: yogaClassId, gymId: gym1Id, instructorId: trainer2Id, dayOfWeek: 3, startTime: "07:00", endTime: "08:00", room: "Studio A" },
    { id: nanoid(), classTypeId: yogaClassId, gymId: gym1Id, instructorId: trainer2Id, dayOfWeek: 5, startTime: "07:00", endTime: "08:00", room: "Studio A" },
    // Spin Class - Tue, Thu at 6:00 PM
    { id: nanoid(), classTypeId: spinClassId, gymId: gym1Id, instructorId: trainer1Id, dayOfWeek: 2, startTime: "18:00", endTime: "18:45", room: "Spin Room" },
    { id: nanoid(), classTypeId: spinClassId, gymId: gym1Id, instructorId: trainer1Id, dayOfWeek: 4, startTime: "18:00", endTime: "18:45", room: "Spin Room" },
    // HIIT - Sat at 10:00 AM
    { id: nanoid(), classTypeId: hiitClassId, gymId: gym1Id, instructorId: trainer1Id, dayOfWeek: 6, startTime: "10:00", endTime: "10:30", room: "Main Floor" },
  ]);

  // Create PT packages
  await db.insert(ptPackage).values([
    {
      id: nanoid(),
      gymId: gym1Id,
      name: "Starter Pack",
      description: "5 personal training sessions",
      sessionCount: 5,
      priceInCents: 35000,
      validityDays: 60,
    },
    {
      id: nanoid(),
      gymId: gym1Id,
      name: "Transformation Pack",
      description: "12 personal training sessions - best value",
      sessionCount: 12,
      priceInCents: 75000,
      validityDays: 120,
    },
  ]);

  // Create demo gym members
  const memberIds = [nanoid(), nanoid(), nanoid()];
  await db.insert(gymMember).values([
    {
      id: memberIds[0],
      gymId: gym1Id,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1 555 0301",
      memberNumber: "MEM-001",
      qrCode: `GYM-${gym1Id}-MEM-${memberIds[0]}`,
      status: "active",
    },
    {
      id: memberIds[1],
      gymId: gym1Id,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "+1 555 0302",
      memberNumber: "MEM-002",
      qrCode: `GYM-${gym1Id}-MEM-${memberIds[1]}`,
      status: "active",
    },
    {
      id: memberIds[2],
      gymId: gym1Id,
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
      phone: "+1 555 0303",
      memberNumber: "MEM-003",
      qrCode: `GYM-${gym1Id}-MEM-${memberIds[2]}`,
      status: "inactive",
    },
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Demo credentials:");
  console.log("   Owner: owner@demo.com");
  console.log("\n🏋️ Created:");
  console.log("   - 1 organization");
  console.log("   - 1 business");
  console.log("   - 2 gyms");
  console.log("   - 3 subscription plans");
  console.log("   - 2 trainers");
  console.log("   - 3 class types");
  console.log("   - 6 class schedules");
  console.log("   - 2 PT packages");
  console.log("   - 3 gym members");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
