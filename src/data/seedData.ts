export type SeedVendor = {
  externalId: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  minOrder: number;
  categories: string[];
};

export type SeedProduct = {
  externalId: string;
  vendorExternalId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
};

export type SeedReview = {
  externalId: string;
  vendorExternalId: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  date: string;
};

export type SeedOrder = {
  legacyId: string;
  vendorExternalId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    productExternalId: string;
    quantity: number;
  }>;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  paymentMethod: "cash" | "mpesa-auto" | "mpesa-manual";
  paymentStatus: "pending" | "paid" | "failed";
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress?: string;
  mpesaCode?: string;
  createdAt: string;
  updatedAt: string;
};

export const seedVendors: SeedVendor[] = [
  {
    externalId: "v1",
    name: "Mama Amina's Store",
    description:
      "Quality staples at the best prices. Trusted by the community for over 10 years.",
    rating: 4.8,
    reviewCount: 234,
    location: "Eastleigh, Nairobi",
    deliveryAvailable: true,
    deliveryFee: 200,
    minOrder: 500,
    categories: ["rice", "flour", "sugar", "salt", "oil"],
  },
  {
    externalId: "v2",
    name: "Fresh Mart Wholesale",
    description:
      "Bulk supplies for restaurants and families. Competitive wholesale pricing.",
    rating: 4.5,
    reviewCount: 187,
    location: "Gikomba, Nairobi",
    deliveryAvailable: true,
    deliveryFee: 300,
    minOrder: 1000,
    categories: ["rice", "flour", "sugar", "oil"],
  },
  {
    externalId: "v3",
    name: "Baba Juma Supplies",
    description:
      "Premium imported and local food staples. Serving the community since 2005.",
    rating: 4.6,
    reviewCount: 156,
    location: "Westlands, Nairobi",
    deliveryAvailable: true,
    deliveryFee: 250,
    minOrder: 800,
    categories: ["rice", "flour", "salt", "oil"],
  },
  {
    externalId: "v4",
    name: "Duka la Neema",
    description:
      "Your neighborhood grocery store with daily fresh stock and friendly service.",
    rating: 4.3,
    reviewCount: 98,
    location: "Kawangware, Nairobi",
    deliveryAvailable: false,
    deliveryFee: 0,
    minOrder: 300,
    categories: ["rice", "flour", "sugar", "salt"],
  },
  {
    externalId: "v5",
    name: "Superstar Foods",
    description:
      "Modern supermarket experience with competitive prices and wide selection.",
    rating: 4.7,
    reviewCount: 312,
    location: "Kilimani, Nairobi",
    deliveryAvailable: true,
    deliveryFee: 150,
    minOrder: 500,
    categories: ["rice", "flour", "sugar", "salt", "oil"],
  },
  {
    externalId: "v6",
    name: "Kilimani Stores",
    description:
      "Authentic local produce and staples from Kenya's finest suppliers.",
    rating: 4.4,
    reviewCount: 145,
    location: "Langata, Nairobi",
    deliveryAvailable: true,
    deliveryFee: 200,
    minOrder: 600,
    categories: ["rice", "sugar", "salt", "oil"],
  },
];

export const seedProducts: SeedProduct[] = [
  {
    externalId: "p1",
    vendorExternalId: "v1",
    name: "Pishori Rice",
    description: "Premium Mwea Pishori rice, locally grown",
    price: 250,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 200,
  },
  {
    externalId: "p2",
    vendorExternalId: "v1",
    name: "Basmati Rice",
    description: "Fragrant Indian basmati rice",
    price: 350,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 150,
  },
  {
    externalId: "p3",
    vendorExternalId: "v1",
    name: "Wheat Flour (Ngano)",
    description: "All-purpose wheat flour",
    price: 180,
    unit: "kg",
    category: "flour",
    inStock: true,
    stockQuantity: 300,
  },
  {
    externalId: "p4",
    vendorExternalId: "v1",
    name: "White Sugar",
    description: "Refined white sugar",
    price: 200,
    unit: "kg",
    category: "sugar",
    inStock: true,
    stockQuantity: 250,
  },
  {
    externalId: "p5",
    vendorExternalId: "v1",
    name: "Iodized Salt",
    description: "Kensalt iodized table salt",
    price: 50,
    unit: "kg",
    category: "salt",
    inStock: true,
    stockQuantity: 400,
  },
  {
    externalId: "p6",
    vendorExternalId: "v1",
    name: "Sunflower Oil",
    description: "Elianto sunflower cooking oil",
    price: 450,
    unit: "litre",
    category: "oil",
    inStock: true,
    stockQuantity: 100,
  },
  {
    externalId: "p7",
    vendorExternalId: "v1",
    name: "Palm Oil",
    description: "Traditional palm cooking oil",
    price: 380,
    unit: "litre",
    category: "oil",
    inStock: false,
    stockQuantity: 0,
  },
  {
    externalId: "p8",
    vendorExternalId: "v2",
    name: "Bulk Pishori Rice (25kg)",
    description: "25kg sack of premium Pishori rice",
    price: 5500,
    unit: "sack",
    category: "rice",
    inStock: true,
    stockQuantity: 50,
  },
  {
    externalId: "p9",
    vendorExternalId: "v2",
    name: "Bulk Wheat Flour (25kg)",
    description: "25kg sack of Jogoo wheat flour",
    price: 4000,
    unit: "sack",
    category: "flour",
    inStock: true,
    stockQuantity: 80,
  },
  {
    externalId: "p10",
    vendorExternalId: "v2",
    name: "Bulk Sugar (50kg)",
    description: "50kg sack of Mumias sugar",
    price: 9000,
    unit: "sack",
    category: "sugar",
    inStock: true,
    stockQuantity: 30,
  },
  {
    externalId: "p11",
    vendorExternalId: "v2",
    name: "Cooking Oil (20L)",
    description: "20 litre jerrycan of Rina cooking oil",
    price: 5500,
    unit: "jerrycan",
    category: "oil",
    inStock: true,
    stockQuantity: 25,
  },
  {
    externalId: "p12",
    vendorExternalId: "v3",
    name: "Brown Rice",
    description: "Nutritious brown rice",
    price: 300,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 100,
  },
  {
    externalId: "p13",
    vendorExternalId: "v3",
    name: "Cassava Flour",
    description: "Traditional cassava flour",
    price: 200,
    unit: "kg",
    category: "flour",
    inStock: true,
    stockQuantity: 120,
  },
  {
    externalId: "p14",
    vendorExternalId: "v3",
    name: "Sea Salt",
    description: "Natural sea salt crystals",
    price: 120,
    unit: "kg",
    category: "salt",
    inStock: true,
    stockQuantity: 200,
  },
  {
    externalId: "p15",
    vendorExternalId: "v3",
    name: "Coconut Oil",
    description: "Cold-pressed coconut oil",
    price: 800,
    unit: "litre",
    category: "oil",
    inStock: true,
    stockQuantity: 60,
  },
  {
    externalId: "p16",
    vendorExternalId: "v4",
    name: "Sindano Rice",
    description: "Locally grown Sindano rice",
    price: 200,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 180,
  },
  {
    externalId: "p17",
    vendorExternalId: "v4",
    name: "Maize Flour (Unga)",
    description: "Jogoo maize flour for ugali",
    price: 150,
    unit: "kg",
    category: "flour",
    inStock: true,
    stockQuantity: 250,
  },
  {
    externalId: "p18",
    vendorExternalId: "v4",
    name: "Brown Sugar",
    description: "Unrefined brown sugar",
    price: 220,
    unit: "kg",
    category: "sugar",
    inStock: true,
    stockQuantity: 150,
  },
  {
    externalId: "p19",
    vendorExternalId: "v4",
    name: "Rock Salt",
    description: "Coarse rock salt for cooking",
    price: 80,
    unit: "kg",
    category: "salt",
    inStock: true,
    stockQuantity: 300,
  },
  {
    externalId: "p20",
    vendorExternalId: "v5",
    name: "Jasmine Rice",
    description: "Premium Thai jasmine rice",
    price: 400,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 90,
  },
  {
    externalId: "p21",
    vendorExternalId: "v5",
    name: "Self-Rising Flour",
    description: "Exe self-rising wheat flour",
    price: 200,
    unit: "kg",
    category: "flour",
    inStock: true,
    stockQuantity: 200,
  },
  {
    externalId: "p22",
    vendorExternalId: "v5",
    name: "Icing Sugar",
    description: "Fine powdered sugar for baking",
    price: 280,
    unit: "kg",
    category: "sugar",
    inStock: true,
    stockQuantity: 100,
  },
  {
    externalId: "p23",
    vendorExternalId: "v5",
    name: "Himalayan Pink Salt",
    description: "Premium Himalayan salt",
    price: 350,
    unit: "kg",
    category: "salt",
    inStock: true,
    stockQuantity: 80,
  },
  {
    externalId: "p24",
    vendorExternalId: "v5",
    name: "Olive Oil",
    description: "Extra virgin olive oil",
    price: 1200,
    unit: "litre",
    category: "oil",
    inStock: true,
    stockQuantity: 40,
  },
  {
    externalId: "p25",
    vendorExternalId: "v6",
    name: "Mwea Rice",
    description: "Famous Mwea region rice from Central Kenya",
    price: 280,
    unit: "kg",
    category: "rice",
    inStock: true,
    stockQuantity: 130,
  },
  {
    externalId: "p26",
    vendorExternalId: "v6",
    name: "Jaggery Sugar",
    description: "Traditional unrefined jaggery",
    price: 300,
    unit: "kg",
    category: "sugar",
    inStock: true,
    stockQuantity: 70,
  },
  {
    externalId: "p27",
    vendorExternalId: "v6",
    name: "Black Salt (Kala Namak)",
    description: "Indian black salt",
    price: 200,
    unit: "kg",
    category: "salt",
    inStock: true,
    stockQuantity: 90,
  },
  {
    externalId: "p28",
    vendorExternalId: "v6",
    name: "Sesame Oil",
    description: "Pure sesame seed oil",
    price: 900,
    unit: "litre",
    category: "oil",
    inStock: true,
    stockQuantity: 45,
  },
];

export const seedReviews: SeedReview[] = [
  {
    externalId: "r1",
    vendorExternalId: "v1",
    userName: "John Kamau",
    userInitials: "JK",
    rating: 5,
    comment:
      "Best Pishori rice in Eastleigh! Always fresh and well-packaged. Mama Amina never disappoints.",
    date: "2026-03-01",
  },
  {
    externalId: "r2",
    vendorExternalId: "v1",
    userName: "Fatima Hassan",
    userInitials: "FH",
    rating: 5,
    comment:
      "I've been buying from here for 3 years. The prices are fair and the quality is consistently great.",
    date: "2026-02-25",
  },
  {
    externalId: "r3",
    vendorExternalId: "v1",
    userName: "Peter Odhiambo",
    userInitials: "PO",
    rating: 4,
    comment:
      "Good selection of staples. Delivery was a bit slow last time but the products were perfect.",
    date: "2026-02-18",
  },
  {
    externalId: "r4",
    vendorExternalId: "v1",
    userName: "Grace Wanjiku",
    userInitials: "GW",
    rating: 5,
    comment:
      "The sunflower oil here is the freshest I've found. Highly recommend!",
    date: "2026-02-10",
  },
  {
    externalId: "r5",
    vendorExternalId: "v2",
    userName: "James Mwangi",
    userInitials: "JM",
    rating: 5,
    comment:
      "Perfect for my restaurant. Bulk prices are unbeatable and the 25kg rice sacks are always full weight.",
    date: "2026-03-05",
  },
  {
    externalId: "r6",
    vendorExternalId: "v2",
    userName: "Amina Yusuf",
    userInitials: "AY",
    rating: 4,
    comment:
      "Great wholesale prices. The sugar quality is excellent. Would love more variety though.",
    date: "2026-02-28",
  },
  {
    externalId: "r7",
    vendorExternalId: "v2",
    userName: "David Njoroge",
    userInitials: "DN",
    rating: 4,
    comment:
      "Reliable supplier for our catering business. Consistent quality month after month.",
    date: "2026-02-15",
  },
  {
    externalId: "r8",
    vendorExternalId: "v3",
    userName: "Sarah Achieng",
    userInitials: "SA",
    rating: 5,
    comment:
      "The coconut oil is absolutely premium! Cold-pressed and smells amazing. Worth every shilling.",
    date: "2026-03-08",
  },
  {
    externalId: "r9",
    vendorExternalId: "v3",
    userName: "Hussein Ali",
    userInitials: "HA",
    rating: 4,
    comment:
      "Great imported products you can't find elsewhere. The brown rice is top quality.",
    date: "2026-02-20",
  },
  {
    externalId: "r10",
    vendorExternalId: "v3",
    userName: "Lucy Muthoni",
    userInitials: "LM",
    rating: 5,
    comment:
      "Baba Juma's cassava flour makes the best chapati! My family loves it.",
    date: "2026-02-12",
  },
  {
    externalId: "r11",
    vendorExternalId: "v4",
    userName: "Moses Kiprop",
    userInitials: "MK",
    rating: 4,
    comment:
      "Friendly neighborhood shop. Always has what I need. Wish they offered delivery though.",
    date: "2026-03-02",
  },
  {
    externalId: "r12",
    vendorExternalId: "v4",
    userName: "Esther Wairimu",
    userInitials: "EW",
    rating: 5,
    comment:
      "The maize flour here is always fresh. Perfect for ugali every time!",
    date: "2026-02-22",
  },
  {
    externalId: "r13",
    vendorExternalId: "v4",
    userName: "Tom Otieno",
    userInitials: "TO",
    rating: 4,
    comment:
      "Good prices for the neighborhood. The brown sugar is my favorite.",
    date: "2026-02-08",
  },
  {
    externalId: "r14",
    vendorExternalId: "v5",
    userName: "Angela Njeri",
    userInitials: "AN",
    rating: 5,
    comment:
      "Love the premium selection! The Himalayan pink salt and olive oil are superb quality.",
    date: "2026-03-09",
  },
  {
    externalId: "r15",
    vendorExternalId: "v5",
    userName: "Brian Wekesa",
    userInitials: "BW",
    rating: 5,
    comment:
      "Modern shopping experience with great variety. The jasmine rice is restaurant-quality.",
    date: "2026-03-01",
  },
  {
    externalId: "r16",
    vendorExternalId: "v5",
    userName: "Catherine Mwende",
    userInitials: "CM",
    rating: 4,
    comment:
      "Slightly pricier but the quality justifies it. Fast delivery too!",
    date: "2026-02-19",
  },
  {
    externalId: "r17",
    vendorExternalId: "v5",
    userName: "Daniel Karanja",
    userInitials: "DK",
    rating: 5,
    comment:
      "Best icing sugar for my baking business. Always perfectly fine and dry.",
    date: "2026-02-05",
  },
  {
    externalId: "r18",
    vendorExternalId: "v6",
    userName: "Rehema Bakari",
    userInitials: "RB",
    rating: 5,
    comment:
      "The sesame oil is incredible! Authentic taste for my Asian recipes.",
    date: "2026-03-07",
  },
  {
    externalId: "r19",
    vendorExternalId: "v6",
    userName: "Vincent Ouma",
    userInitials: "VO",
    rating: 4,
    comment:
      "Great selection of specialty salts. The Kala Namak is perfect for chaat.",
    date: "2026-02-24",
  },
  {
    externalId: "r20",
    vendorExternalId: "v6",
    userName: "Winnie Chebet",
    userInitials: "WC",
    rating: 4,
    comment: "Love the Mwea rice from here. Authentic taste and good pricing.",
    date: "2026-02-14",
  },
];

export const seedOrders: SeedOrder[] = [
  {
    legacyId: "ORD-001",
    vendorExternalId: "v1",
    customerName: "Jane Wanjiku",
    customerPhone: "0712345678",
    items: [
      { productExternalId: "p1", quantity: 5 },
      { productExternalId: "p3", quantity: 2 },
    ],
    status: "pending",
    paymentMethod: "mpesa-auto",
    paymentStatus: "paid",
    deliveryMethod: "delivery",
    deliveryAddress: "45 Moi Avenue, Nairobi",
    createdAt: "2026-03-18T10:00:00.000Z",
    updatedAt: "2026-03-18T10:00:00.000Z",
  },
  {
    legacyId: "ORD-002",
    vendorExternalId: "v1",
    customerName: "Peter Ochieng",
    customerPhone: "0723456789",
    items: [
      { productExternalId: "p2", quantity: 3 },
      { productExternalId: "p4", quantity: 1 },
      { productExternalId: "p6", quantity: 2 },
    ],
    status: "confirmed",
    paymentMethod: "mpesa-manual",
    paymentStatus: "paid",
    deliveryMethod: "pickup",
    mpesaCode: "QJK8L9M2PX",
    createdAt: "2026-03-18T09:30:00.000Z",
    updatedAt: "2026-03-18T09:45:00.000Z",
  },
  {
    legacyId: "ORD-003",
    vendorExternalId: "v1",
    customerName: "Mary Akinyi",
    customerPhone: "0734567890",
    items: [{ productExternalId: "p5", quantity: 10 }],
    status: "preparing",
    paymentMethod: "cash",
    paymentStatus: "pending",
    deliveryMethod: "delivery",
    deliveryAddress: "12 Kenyatta Road, Eastleigh",
    createdAt: "2026-03-18T08:30:00.000Z",
    updatedAt: "2026-03-18T09:00:00.000Z",
  },
  {
    legacyId: "ORD-004",
    vendorExternalId: "v1",
    customerName: "David Kamau",
    customerPhone: "0745678901",
    items: [
      { productExternalId: "p1", quantity: 10 },
      { productExternalId: "p4", quantity: 5 },
      { productExternalId: "p6", quantity: 3 },
    ],
    status: "ready",
    paymentMethod: "mpesa-auto",
    paymentStatus: "paid",
    deliveryMethod: "pickup",
    createdAt: "2026-03-18T08:00:00.000Z",
    updatedAt: "2026-03-18T09:40:00.000Z",
  },
  {
    legacyId: "ORD-005",
    vendorExternalId: "v1",
    customerName: "Sarah Njeri",
    customerPhone: "0756789012",
    items: [
      { productExternalId: "p3", quantity: 3 },
      { productExternalId: "p5", quantity: 5 },
    ],
    status: "delivered",
    paymentMethod: "mpesa-auto",
    paymentStatus: "paid",
    deliveryMethod: "delivery",
    deliveryAddress: "78 Uhuru Highway, Nairobi",
    createdAt: "2026-03-18T05:00:00.000Z",
    updatedAt: "2026-03-18T07:00:00.000Z",
  },
  {
    legacyId: "ORD-006",
    vendorExternalId: "v1",
    customerName: "John Mwangi",
    customerPhone: "0767890123",
    items: [{ productExternalId: "p2", quantity: 2 }],
    status: "cancelled",
    paymentMethod: "cash",
    paymentStatus: "pending",
    deliveryMethod: "pickup",
    createdAt: "2026-03-18T02:00:00.000Z",
    updatedAt: "2026-03-18T03:00:00.000Z",
  },
];
