import type {
  AuditEvent,
  Booking,
  DamageIncident,
  KycRecord,
  NotificationJob,
  PaymentEvent,
  PaymentOrder,
  User,
  Vehicle,
  VehicleLiveLocation,
  VehicleDocument,
  VehicleBlockWindow
} from "@/lib/types/domain";

const now = new Date().toISOString();

export const store: {
  users: User[];
  vehicles: Vehicle[];
  bookings: Booking[];
  kycRecords: KycRecord[];
  vehicleBlocks: VehicleBlockWindow[];
  vehicleLiveLocations: VehicleLiveLocation[];
  damageIncidents: DamageIncident[];
  auditEvents: AuditEvent[];
  paymentOrders: PaymentOrder[];
  paymentEvents: PaymentEvent[];
  vehicleDocuments: VehicleDocument[];
  notificationJobs: NotificationJob[];
} = {
  users: [
    {
      id: "cust_001",
      name: "Rahul Customer",
      role: "customer",
      city: "bengaluru",
      kyc_status: "not_started",
      email: "rahul@example.com",
      phone: "+919876543210"
    },
    {
      id: "cust_002",
      name: "Asha Customer",
      role: "customer",
      city: "bengaluru",
      kyc_status: "not_started",
      email: "asha@example.com",
      phone: "+919876543211"
    },
    {
      id: "partner_001",
      name: "Nikhil Fleet Partner",
      role: "partner_investor",
      city: "bengaluru",
      kyc_status: "verified"
    },
    {
      id: "admin_001",
      name: "RBA Admin",
      role: "admin",
      city: "bengaluru",
      kyc_status: "verified"
    }
  ],
  vehicles: [
    {
      id: "veh_001",
      owner_id: "partner_001",
      city: "bengaluru",
      category: "scooter",
      brand: "Honda",
      model: "Activa 110",
      image_urls: [
        "https://edge.sitecorecloud.io/hondamotorc388f-hmsi8ece-prodb777-e813/media/Project/HONDA2WI/honda2wheelersindia/scooter/Activa-110/Accessories/activa110-accessories.png?h=810&iar=0&w=1920"
      ],
      is_active: true,
      deposit_amount: 2000,
      rate_per_hour: 0,
      rate_per_day: 3200,
      rate_per_week: 1600,
      rate_per_month: 6000
    },
    {
      id: "veh_002",
      owner_id: "partner_001",
      city: "bengaluru",
      category: "scooter",
      brand: "Honda",
      model: "Dio 110",
      image_urls: [
        "https://edge.sitecorecloud.io/hondamotorc388f-hmsi8ece-prodb777-e813/media/Project/HONDA2WI/honda2wheelersindia/scooter/dio-110/dio110-accessories.png?h=810&iar=0&w=1920"
      ],
      is_active: true,
      deposit_amount: 2000,
      rate_per_hour: 0,
      rate_per_day: 3200,
      rate_per_week: 1600,
      rate_per_month: 6000
    },
    {
      id: "veh_003",
      owner_id: "partner_001",
      city: "bengaluru",
      category: "scooter",
      brand: "TVS",
      model: "Jupiter 125",
      image_urls: [
        "https://www.tvsmotor.com/tvs-jupiter-125/-/media/TVS-Jupiter-125/Disc-SE/Price-Fold/dual-tone-website-copy-%281%29.webp"
      ],
      is_active: true,
      deposit_amount: 2000,
      rate_per_hour: 0,
      rate_per_day: 3250,
      rate_per_week: 1625,
      rate_per_month: 6500
    }
  ],
  bookings: [],
  kycRecords: [
    {
      user_id: "cust_001",
      status: "verified",
      provider: "setu_digilocker",
      aadhaar_verified: true,
      dl_verified: true,
      cibil_score: 782,
      cibil_risk_band: "low",
      cibil_checked_at: now,
      pan_last4: "1234",
      needs_manual_review: false,
      updated_at: now
    },
    {
      user_id: "cust_002",
      status: "not_started",
      provider: "setu_digilocker",
      aadhaar_verified: false,
      dl_verified: false,
      needs_manual_review: false,
      updated_at: now
    }
  ],
  vehicleBlocks: [],
  vehicleLiveLocations: [
    {
      vehicle_id: "veh_001",
      latitude: 12.9716,
      longitude: 77.5946,
      speed_kmph: 28,
      heading_deg: 74,
      source: "seed_simulator",
      updated_at: now
    },
    {
      vehicle_id: "veh_002",
      latitude: 12.9352,
      longitude: 77.6245,
      speed_kmph: 42,
      heading_deg: 112,
      source: "seed_simulator",
      updated_at: now
    },
    {
      vehicle_id: "veh_003",
      latitude: 12.9989,
      longitude: 77.5926,
      speed_kmph: 0,
      heading_deg: 0,
      source: "seed_simulator",
      updated_at: now
    }
  ],
  damageIncidents: [],
  auditEvents: [],
  paymentOrders: [],
  paymentEvents: [],
  vehicleDocuments: [],
  notificationJobs: []
};
