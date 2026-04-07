require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../config/prismaClient");

const DEMO_PASSWORD = "DemoPass1234";

const userPhoto = {
  admin: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=640&q=80",
  yacine: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
  amina: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&q=80",
  nadir: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=640&q=80",
  sara: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80",
  omar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80",
  suspended: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=640&q=80",
};

const shipmentPhoto = {
  electronics: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  furniture: "https://images.unsplash.com/photo-1611428811456-bf18189fd3e3?auto=format&fit=crop&w=1200&q=80",
  pharmaceuticals: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80",
  food: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80",
  machinery: "https://images.unsplash.com/photo-1581092160612-7e1f2426f0d3?auto=format&fit=crop&w=1200&q=80",
};

const routePhoto = {
  north: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  desert: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1200&q=80",
  coast: "https://images.unsplash.com/photo-1470123808288-1e59739b12d2?auto=format&fit=crop&w=1200&q=80",
  highway: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
};

const vehiclePhoto = {
  volvo: "https://images.unsplash.com/photo-1556122071-e404cb6f31bf?auto=format&fit=crop&w=1000&q=80",
  mercedes: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80",
  renault: "https://images.unsplash.com/photo-1609899003078-9f04d4f0e969?auto=format&fit=crop&w=1000&q=80",
  iveco: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
  fordVan: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80",
};

async function resetDatabase() {
  await prisma.notificationSettings.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.route.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.individual.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();
}

async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = {};

  users.admin = await prisma.user.create({
    data: {
      email: "admin.live@wesselli.demo",
      password: passwordHash,
      phone: "0550000001",
      type: "BUSINESS",
      role: "ADMIN",
      isVerified: true,
      profile_Photo: userPhoto.admin,
      working_Time: "08:00-18:00",
      status: "Active",
    },
  });

  users.yacine = await prisma.user.create({
    data: {
      email: "yacine.ferhat@wesselli.demo",
      password: passwordHash,
      phone: "0550000002",
      type: "INDIVIDUAL",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.yacine,
      working_Time: "07:30-17:30",
      status: "Active",
    },
  });

  users.amina = await prisma.user.create({
    data: {
      email: "amina.logistics@wesselli.demo",
      password: passwordHash,
      phone: "0550000003",
      type: "BUSINESS",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.amina,
      working_Time: "08:00-20:00",
      status: "Active",
    },
  });

  users.nadir = await prisma.user.create({
    data: {
      email: "nadir.driver@wesselli.demo",
      password: passwordHash,
      phone: "0550000004",
      type: "INDIVIDUAL",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.nadir,
      working_Time: "06:00-16:00",
      status: "Active",
    },
  });

  users.sara = await prisma.user.create({
    data: {
      email: "sara.dispatch@wesselli.demo",
      password: passwordHash,
      phone: "0550000005",
      type: "INDIVIDUAL",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.sara,
      working_Time: "09:00-18:00",
      status: "Active",
    },
  });

  users.omar = await prisma.user.create({
    data: {
      email: "omar.wholesale@wesselli.demo",
      password: passwordHash,
      phone: "0550000006",
      type: "BUSINESS",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.omar,
      working_Time: "08:00-19:00",
      status: "Active",
    },
  });

  users.suspended = await prisma.user.create({
    data: {
      email: "samir.suspended@wesselli.demo",
      password: passwordHash,
      phone: "0550000007",
      type: "INDIVIDUAL",
      role: "USER",
      isVerified: true,
      profile_Photo: userPhoto.suspended,
      working_Time: "08:30-17:00",
      status: "Suspended",
    },
  });

  await prisma.business.create({
    data: {
      user_ID: users.admin.id,
      business_Name: "Wesselli HQ",
      rc_Number: "RC-AL-ADMIN-001",
      form: "SARL",
      nif: 310001001,
      nis: 450001001,
      locations: ["Algiers"],
    },
  });

  await prisma.individual.create({
    data: {
      user_ID: users.yacine.id,
      full_Name: "Yacine Ferhat",
      nin: "NIN-IND-0001",
      location: "Algiers",
    },
  });

  await prisma.business.create({
    data: {
      user_ID: users.amina.id,
      business_Name: "Amina Logistics SARL",
      rc_Number: "RC-AL-BIZ-002",
      form: "SARL",
      nif: 310001002,
      nis: 450001002,
      locations: ["Algiers", "Blida"],
    },
  });

  await prisma.individual.create({
    data: {
      user_ID: users.nadir.id,
      full_Name: "Nadir Khelifi",
      nin: "NIN-IND-0003",
      location: "Oran",
    },
  });

  await prisma.individual.create({
    data: {
      user_ID: users.sara.id,
      full_Name: "Sara Benali",
      nin: "NIN-IND-0004",
      location: "Constantine",
    },
  });

  await prisma.business.create({
    data: {
      user_ID: users.omar.id,
      business_Name: "Omar Wholesale",
      rc_Number: "RC-OR-BIZ-005",
      form: "SPA",
      nif: 310001003,
      nis: 450001003,
      locations: ["Oran", "Sidi Bel Abbes", "Tlemcen"],
    },
  });

  await prisma.individual.create({
    data: {
      user_ID: users.suspended.id,
      full_Name: "Samir Temporary",
      nin: "NIN-IND-0005",
      location: "Setif",
    },
  });

  const vehicles = {};

  vehicles.yacine = await prisma.vehicle.create({
    data: {
      plate_Number: 100101,
      vehicle_Name: "Volvo FH16",
      type: "Truck",
      color: "White",
      year: 2022,
      capacity: 22,
      photo: vehiclePhoto.volvo,
      user_ID: users.yacine.id,
    },
  });

  vehicles.aminaHeavy = await prisma.vehicle.create({
    data: {
      plate_Number: 100102,
      vehicle_Name: "Mercedes Actros",
      type: "Truck",
      color: "Blue",
      year: 2021,
      capacity: 28,
      photo: vehiclePhoto.mercedes,
      user_ID: users.amina.id,
    },
  });

  vehicles.aminaVan = await prisma.vehicle.create({
    data: {
      plate_Number: 100103,
      vehicle_Name: "Ford Transit",
      type: "Van",
      color: "Silver",
      year: 2023,
      capacity: 6,
      photo: vehiclePhoto.fordVan,
      user_ID: users.amina.id,
    },
  });

  vehicles.nadir = await prisma.vehicle.create({
    data: {
      plate_Number: 100104,
      vehicle_Name: "Renault T High",
      type: "Truck",
      color: "Red",
      year: 2020,
      capacity: 24,
      photo: vehiclePhoto.renault,
      user_ID: users.nadir.id,
    },
  });

  vehicles.sara = await prisma.vehicle.create({
    data: {
      plate_Number: 100105,
      vehicle_Name: "Iveco S-Way",
      type: "Truck",
      color: "Gray",
      year: 2019,
      capacity: 20,
      photo: vehiclePhoto.iveco,
      user_ID: users.sara.id,
    },
  });

  await prisma.route.createMany({
    data: [
      {
        name: "Algiers -> Oran Daily",
        photo: routePhoto.highway,
        origin: "Algiers",
        destination: "Oran",
        waypoints: ["Blida", "Chlef", "Mostaganem"],
        region: null,
        date: "2026-04-08",
        post_type: "ORIGIN_DESTINATION",
        date_type: "DAY",
        interval_start: null,
        interval_end: null,
        more_Information: "Daily refrigerated lane for mixed cargo.",
        status: "Active",
        user_ID: users.yacine.id,
        vehicle_plate: vehicles.yacine.plate_Number,
      },
      {
        name: "West Distribution Window",
        photo: routePhoto.desert,
        origin: "Oran",
        destination: "Tlemcen",
        waypoints: ["Ain Temouchent"],
        region: null,
        date: null,
        post_type: "ORIGIN_DESTINATION",
        date_type: "INTERVAL",
        interval_start: "2026-04-10",
        interval_end: "2026-04-14",
        more_Information: "Priority slots for high-value cargo.",
        status: "Active",
        user_ID: users.amina.id,
        vehicle_plate: vehicles.aminaHeavy.plate_Number,
      },
      {
        name: "Kabylie Regional Coverage",
        photo: routePhoto.coast,
        origin: null,
        destination: null,
        waypoints: [],
        region: "Tizi Ouzou - Bejaia Corridor",
        date: "2026-04-09",
        post_type: "REGION",
        date_type: "DAY",
        interval_start: null,
        interval_end: null,
        more_Information: "Regional distribution with same-day transfer.",
        status: "Active",
        user_ID: users.sara.id,
        vehicle_plate: vehicles.sara.plate_Number,
      },
      {
        name: "Eastern Regional Sweep",
        photo: routePhoto.north,
        origin: null,
        destination: null,
        waypoints: [],
        region: "Constantine - Annaba - Skikda",
        date: null,
        post_type: "REGION",
        date_type: "INTERVAL",
        interval_start: "2026-04-11",
        interval_end: "2026-04-18",
        more_Information: "Bulk loads and reverse logistics available.",
        status: "Active",
        user_ID: users.nadir.id,
        vehicle_plate: vehicles.nadir.plate_Number,
      },
      {
        name: "Completed Metro Delivery",
        photo: routePhoto.highway,
        origin: "Algiers",
        destination: "Blida",
        waypoints: ["Birtouta"],
        region: null,
        date: "2026-03-25",
        post_type: "ORIGIN_DESTINATION",
        date_type: "DAY",
        interval_start: null,
        interval_end: null,
        more_Information: "Used for history and profile timeline coverage.",
        status: "Completed",
        user_ID: users.yacine.id,
        vehicle_plate: vehicles.yacine.plate_Number,
      },
    ],
  });

  await prisma.shipment.createMany({
    data: [
      {
        title: "Consumer Electronics Batch A",
        category: "Electronics",
        photo: shipmentPhoto.electronics,
        origin: "Algiers",
        destination: "Oran",
        volume: 12.5,
        weight: 1800,
        date: "2026-04-08",
        time: "09:30",
        priority: "Urgent",
        special_Information: "Handle with anti-shock pallets.",
        status: "In-Delivery",
        user_ID: users.amina.id,
      },
      {
        title: "Office Furniture Set",
        category: "Furniture",
        photo: shipmentPhoto.furniture,
        origin: "Oran",
        destination: "Constantine",
        volume: 22,
        weight: 3200,
        date: "2026-04-09",
        time: "11:15",
        priority: "Normal",
        special_Information: "Fragile edges, no stacking over 1.5m.",
        status: "In-Stock",
        user_ID: users.yacine.id,
      },
      {
        title: "Pharmaceutical Cold Chain",
        category: "Pharmaceuticals",
        photo: shipmentPhoto.pharmaceuticals,
        origin: "Constantine",
        destination: "Annaba",
        volume: 6.8,
        weight: 950,
        date: "2026-04-10",
        time: "07:45",
        priority: "High",
        special_Information: "Keep between 2C and 8C.",
        status: "In-Delivery",
        user_ID: users.omar.id,
      },
      {
        title: "Fresh Produce Pallets",
        category: "Food",
        photo: shipmentPhoto.food,
        origin: "Blida",
        destination: "Algiers",
        volume: 10,
        weight: 1400,
        date: "2026-04-07",
        time: "06:30",
        priority: "Normal",
        special_Information: "Deliver before 10:00 AM market slot.",
        status: "In-Stock",
        user_ID: users.sara.id,
      },
      {
        title: "Industrial Spare Parts",
        category: "Machinery",
        photo: shipmentPhoto.machinery,
        origin: "Setif",
        destination: "Ghardaia",
        volume: 18,
        weight: 2600,
        date: "2026-03-30",
        time: "14:00",
        priority: "High",
        special_Information: "Requires loading dock on arrival.",
        status: "Delivered",
        user_ID: users.nadir.id,
      },
    ],
  });

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  await prisma.subscription.createMany({
    data: [
      {
        tier: "Business",
        startDate: now,
        endDate: in90Days,
        isActive: true,
        user_ID: users.admin.id,
      },
      {
        tier: "Individual",
        startDate: now,
        endDate: in30Days,
        isActive: true,
        user_ID: users.yacine.id,
      },
      {
        tier: "Business",
        startDate: now,
        endDate: in90Days,
        isActive: true,
        user_ID: users.amina.id,
      },
      {
        tier: "Free",
        startDate: now,
        endDate: in30Days,
        isActive: true,
        user_ID: users.nadir.id,
      },
      {
        tier: "Individual",
        startDate: now,
        endDate: in30Days,
        isActive: true,
        user_ID: users.omar.id,
      },
      {
        tier: "Free",
        startDate: now,
        endDate: in30Days,
        isActive: false,
        user_ID: users.suspended.id,
      },
    ],
  });

  await prisma.notificationSettings.createMany({
    data: Object.values(users).map((user) => ({
      user_ID: user.id,
      emailEnabled: true,
      pushEnabled: true,
      shipmentUpdates: true,
      routeUpdates: true,
      Reminders: true,
    })),
  });

  await prisma.notification.createMany({
    data: [
      {
        user_ID: users.yacine.id,
        title: "Shipment Updated",
        message: "Shipment #2 moved to In-Stock.",
        type: "shipments",
        isRead: false,
        entityType: "shipment",
        entityID: 2,
      },
      {
        user_ID: users.yacine.id,
        title: "Route Published",
        message: "Your Algiers -> Oran route is now visible.",
        type: "routes",
        isRead: false,
        entityType: "route",
        entityID: 1,
      },
      {
        user_ID: users.amina.id,
        title: "Subscription Active",
        message: "Business plan activated successfully.",
        type: "account",
        isRead: true,
        entityType: "subscription",
        entityID: 3,
      },
      {
        user_ID: users.admin.id,
        title: "System Snapshot",
        message: "Daily admin summary generated.",
        type: "alerts",
        isRead: false,
        entityType: "admin",
        entityID: users.admin.id,
      },
      {
        user_ID: users.omar.id,
        title: "Cold Chain Reminder",
        message: "Verify cold box temperature before dispatch.",
        type: "alerts",
        isRead: false,
        entityType: "shipment",
        entityID: 3,
      },
    ],
  });

  const accounts = Object.entries(users).map(([key, value]) => ({
    key,
    id: value.id,
    email: value.email,
    role: value.role,
    type: value.type,
    status: value.status,
    password: DEMO_PASSWORD,
  }));

  console.log("\nLive demo seed complete.\n");
  console.table(accounts);
}

async function run() {
  try {
    await resetDatabase();
    await seed();
  } catch (error) {
    console.error("Failed to seed live demo data:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
