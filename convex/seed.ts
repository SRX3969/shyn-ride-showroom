import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const ensureSeeded = mutation({
  handler: async (ctx) => {
    const existingCars = await ctx.db.query("cars").collect();
    if (existingCars.length > 0) {
      return { message: "Database already contains car data. Preserving existing data." };
    }
    // Call internal seeding logic without deleting existing records
    return await seedCarsInternal(ctx);
  },
});

async function seedCarsInternal(ctx: any) {
  const existingCars = await ctx.db.query("cars").collect();
  if (existingCars.length === 0) {
    const cars = [
      {
        slug: "2023-mercedes-benz-s-class-s350d",
        make: "Mercedes-Benz",
        model: "S-Class",
        variant: "S 350d",
        year: 2023,
        price_inr: 17500000,
        price_negotiable: true,
        km: 9500,
        fuel_type: "Diesel",
        transmission: "Automatic",
        body_type: "Sedan",
        color: "Onyx Black",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description: `This 2023 Mercedes-Benz S-Class S 350d represents the pinnacle of modern luxury motoring. Finished in stunning Onyx Black over a Macchiato Beige Nappa leather interior, it has been driven a mere 9,500 km and remains in showroom condition.

The S 350d is powered by a silky-smooth 3.0-litre inline-six diesel engine producing 282 bhp and a massive 600 Nm of torque, mated to a 9-speed automatic transmission. This provides effortless, whisper-quiet acceleration and excellent long-distance touring capabilities.

Inside, the cabin is a technological tour-de-force featuring the second-generation MBUX system with a 12.8-inch OLED central display, active ambient lighting, and rear-seat comfort packages that include massage functionality. This car has been meticulously maintained by its single corporate owner, with full service history recorded at authorised Mercedes-Benz dealerships.

Whether you intend to drive or be driven, this S-Class offers an unmatched blend of ride quality, acoustic isolation, and prestige.`,
        features: [
          "MBUX 2.0 with 12.8-inch OLED Display",
          "Active Ambient Lighting",
          "Burmester 3D Surround Sound",
          "Rear Seat Comfort Package with Massage",
          "Airmatic Air Suspension",
          "Panoramic Sliding Sunroof",
          "Digital Light LED Headlamps",
          "Soft Close Doors",
          "Chauffeur Package",
          "360-Degree Camera with Parktronic"
        ],
      },
      {
        slug: "2022-porsche-911-gt3",
        make: "Porsche",
        model: "911",
        variant: "GT3 (992)",
        year: 2022,
        price_inr: 32500000,
        price_negotiable: false,
        km: 4200,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "Coupe",
        color: "Guards Red",
        owners: 1,
        reg_state: "MH",
        status: "available",
        featured: true,
        description: `A rare opportunity to acquire a pristine 992-generation Porsche 911 GT3. Finished in the iconic Guards Red with a Race-Tex (Alcantara) interior featuring contrast stitching, this track-focused weapon has barely been run in with just 4,200 km on the odometer.

At the heart of this GT3 is Porsche's legendary naturally aspirated 4.0-litre flat-six engine that revs to an ear-splitting 9,000 RPM, producing 510 PS. Power is sent to the rear wheels via a lightning-fast 7-speed PDK dual-clutch transmission. With aerodynamics derived directly from Porsche's motorsport division, including the distinctive swan-neck rear wing and massive rear diffuser, it produces unparalleled downforce for road-legal cars.

This specific example is heavily optioned, featuring the highly desirable Clubsport Package, Carbon Ceramic Brakes (PCCB), and full carbon fibre bucket seats. It has never been tracked, always garaged, and comes with a full front-end Paint Protection Film (PPF) applied from day one.

A true collector's piece and arguably the greatest driver's car of its generation.`,
        features: [
          "4.0L Naturally Aspirated Flat-6 (9,000 RPM)",
          "Porsche Ceramic Composite Brakes (PCCB)",
          "Clubsport Package (Roll Cage)",
          "Full Carbon Fibre Bucket Seats",
          "Front Axle Lift System",
          "Sport Chrono Package",
          "Swan Neck Rear Wing",
          "Race-Tex Interior with Carbon Trim",
          "BOSE Surround Sound System",
          "LED Matrix Main Headlights (PDLS Plus)"
        ],
      },
      {
        slug: "2024-land-rover-range-rover",
        make: "Land Rover",
        model: "Range Rover",
        variant: "Autobiography LWB 3.0",
        year: 2024,
        price_inr: 34500000,
        price_negotiable: true,
        km: 1500,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "SUV",
        color: "Batumi Gold",
        owners: 1,
        reg_state: "DL",
        status: "available",
        featured: true,
        description: `The undisputed king of luxury SUVs. This virtually brand-new 2024 Range Rover Autobiography Long Wheelbase (LWB) is finished in the exquisite Batumi Gold premium metallic paint over a Perlino Semi-Aniline leather interior.

Having covered only 1,500 km, it is entirely indistinguishable from a new vehicle. The LWB variant provides palatial legroom for rear passengers, complemented by the Executive Class Comfort rear seating which includes heated, cooled, and massage functions alongside deployable calf rests. 

Powered by the 3.0-litre mild-hybrid inline-six petrol engine, it delivers 394 bhp with ultimate refinement. The ride is astonishingly smooth thanks to the Electronic Air Suspension with Dynamic Response Pro, reading the road ahead to pre-emptively adjust the dampers. 

A masterpiece of minimalist modern design, this Range Rover represents the pinnacle of sophisticated travel.`,
        features: [
          "Executive Class Comfort Rear Seats",
          "Meridian Signature Sound System (35 Speakers)",
          "Electronic Air Suspension with Dynamic Response Pro",
          "All-Wheel Steering",
          "24-Way Heated/Cooled/Massage Front Seats",
          "ClearSight Interior Rear View Mirror",
          "Pivi Pro 13.1-inch Touchscreen",
          "Deployable Side Steps",
          "SV Bespoke Wood and Leather Steering Wheel",
          "Pixel LED Headlights with Signature DRL"
        ],
      },
      {
        slug: "2021-bmw-m340i-xdrive",
        make: "BMW",
        model: "3 Series",
        variant: "M340i xDrive",
        year: 2021,
        price_inr: 5800000,
        price_negotiable: true,
        km: 32000,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "Sedan",
        color: "Tanzanite Blue",
        owners: 2,
        reg_state: "KA",
        status: "available",
        featured: true,
        description: `The perfect balance of everyday usability and exhilarating performance. This 2021 BMW M340i xDrive in BMW Individual Tanzanite Blue over Cognac Vernasca leather offers a blistering 0-100 km/h time of just 4.4 seconds.

Under the hood lies the legendary B58 3.0-litre turbocharged inline-six engine, producing 382 bhp and 500 Nm of torque. The rear-biased xDrive all-wheel-drive system and M Sport differential ensure massive grip and dynamic handling in all conditions. 

This vehicle features the M Performance exhaust which provides a deep, aggressive soundtrack. Maintained meticulously by an enthusiast owner, it comes with a complete BMW service record and extended warranty valid until late 2025. 

It is the ultimate sleeper sedan—comfortable and quiet for the daily commute, but ferociously fast when the road opens up.`,
        features: [
          "B58 3.0L TwinPower Turbo Inline-6",
          "xDrive All-Wheel Drive System",
          "M Sport Differential & Suspension",
          "M Performance Exhaust",
          "Harman Kardon Surround Sound System",
          "BMW Laserlight",
          "Head-Up Display",
          "19-inch M Light Alloy Wheels",
          "Comfort Access System",
          "Parking Assistant with Reversing Assistant"
        ],
      },
    ];

    // Seed cars and keep track of mapping
    const carIds: Record<string, Id<"cars">> = {};
    for (const car of cars) {
      const id = await ctx.db.insert("cars", {
        ...car,
        deleted_at: undefined,
      });
      carIds[car.slug] = id;
    }

    // High quality Unsplash/Pexels car images covering various angles
    const carImagesData = [
      {
        slug: "2023-mercedes-benz-s-class-s350d",
        images: [
          // Front angle
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600&auto=format&fit=crop",
          // Side profile
          "https://images.unsplash.com/photo-1617814076367-b759c7c9ea78?q=80&w=1600&auto=format&fit=crop",
          // Interior dash
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1600&auto=format&fit=crop",
          // Interior detail
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1600&auto=format&fit=crop",
          // Back angle
          "https://images.unsplash.com/photo-1618843479619-f3efabebfb26?q=80&w=1600&auto=format&fit=crop",
        ]
      },
      {
        slug: "2022-porsche-911-gt3",
        images: [
          // Front aggressive
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop",
          // Side panning/standing
          "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop",
          // Interior
          "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1600&auto=format&fit=crop",
          // Rear wing detail
          "https://images.unsplash.com/photo-1611859328053-3cbc9bf716c6?q=80&w=1600&auto=format&fit=crop",
          // Wheel detail
          "https://images.unsplash.com/photo-1596766442650-6a978fdece09?q=80&w=1600&auto=format&fit=crop",
        ]
      },
      {
        slug: "2024-land-rover-range-rover",
        images: [
          // Front quarter
          "https://images.unsplash.com/photo-1606016159991-dfe4f2746db5?q=80&w=1600&auto=format&fit=crop",
          // Side profile
          "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1600&auto=format&fit=crop",
          // Interior front
          "https://images.unsplash.com/photo-1606016159981-b4f0b2f153a7?q=80&w=1600&auto=format&fit=crop",
          // Interior rear seats
          "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=1600&auto=format&fit=crop",
          // Front grille detail
          "https://images.unsplash.com/photo-1594186591040-3b60f1c6df89?q=80&w=1600&auto=format&fit=crop",
        ]
      },
      {
        slug: "2021-bmw-m340i-xdrive",
        images: [
          // Front low angle
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop",
          // Side dynamic
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1600&auto=format&fit=crop",
          // Interior dash
          "https://images.unsplash.com/photo-1616788484643-d021c33aab37?q=80&w=1600&auto=format&fit=crop",
          // Steering detail
          "https://images.unsplash.com/photo-1610940562814-c48c903fb852?q=80&w=1600&auto=format&fit=crop",
          // Headlight detail
          "https://images.unsplash.com/photo-1593460354583-4224ab273467?q=80&w=1600&auto=format&fit=crop",
        ]
      }
    ];

    for (const item of carImagesData) {
      const carId = carIds[item.slug];
      if (!carId) continue;
      
      for (let i = 0; i < item.images.length; i++) {
        await ctx.db.insert("car_images", {
          car_id: carId,
          url: item.images[i],
          alt: `${item.slug.replace(/-/g, ' ')} view ${i + 1}`,
          sort_order: i,
        });
      }
    }

    // Seed site content
    await ctx.db.insert("site_content", {
      key: "hero",
      value: {
        headline: "Own the Extraordinary.",
        subhead:
          "A curated pre-owned luxury showroom in Bangalore. Certified. Transparent. Unhurried.",
        cta: "View Inventory",
      },
    });

    await ctx.db.insert("site_content", {
      key: "trust_stats",
      value: [
        { value: "300+", label: "Cars Sold" },
        { value: "98%", label: "Client Satisfaction" },
        { value: "180pt", label: "Inspection Standard" },
        { value: "0.4%", label: "Return Rate" },
      ],
    });

    await ctx.db.insert("site_content", {
      key: "testimonials",
      value: [
        {
          quote:
            "The most civilised car-buying experience I've ever had. No pressure, just a beautiful car at a fair price.",
          name: "Rajesh K.",
          car: "2021 Mercedes-Benz GLC",
        },
        {
          quote:
            "They found me exactly the spec I wanted. Doorstep delivery was the cherry on top.",
          name: "Priya M.",
          car: "2022 BMW 3 Series",
        },
        {
          quote:
            "Sold my Audi through SHYN RIDE. Fair quote, same-day payment. No drama.",
          name: "Arjun S.",
          car: "Sold 2019 Audi Q5",
        },
      ],
    });

    await ctx.db.insert("site_content", {
      key: "faqs",
      value: [
        {
          q: "Are all your cars inspected?",
          a: "Yes. Every car undergoes a comprehensive 180-point inspection covering mechanical, cosmetic, and documentation aspects before it makes it to our floor.",
        },
        {
          q: "Can I get financing?",
          a: "We work with several premium finance partners and can help arrange competitive loan terms. Our team will walk you through the options.",
        },
        {
          q: "Do you handle RTO paperwork?",
          a: "Completely. From RC transfer to insurance, we handle every piece of paperwork end to end. You don't need to visit the RTO.",
        },
        {
          q: "Can I test drive at home?",
          a: "Absolutely. We offer doorstep test drives across Bangalore. Just schedule a time and we'll bring the car to you.",
        },
        {
          q: "What if I find an issue after purchase?",
          a: "We stand behind our cars. Every vehicle comes with a warranty period and our team is always available to address any concerns.",
        },
      ],
    });

    const existingTestimonials = await ctx.db.query("testimonials").collect();
    for (const t of existingTestimonials) {
      await ctx.db.delete(t._id);
    }

    const initialDeliveries = [
      {
        client_name: "Vikram & Ananya R.",
        location: "Indiranagar, Bangalore",
        car_title: "Porsche 911 Carrera S (992)",
        review: "SHYN RIDE made purchasing my dream 911 smooth and unhurried. The 150-point inspection report gave us total peace of mind!",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop",
        delivery_date: "July 2026",
        order: 1,
      },
      {
        client_name: "Rohan & Sneha Kapoor",
        location: "UB City, Bangalore",
        car_title: "BMW M4 Competition Coupe",
        review: "Outstanding white-glove service. From home test drive to instant RTO transfer, the experience was truly VIP grade.",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop",
        delivery_date: "June 2026",
        order: 2,
      },
      {
        client_name: "Dr. Siddharth Nair",
        location: "Koramangala, Bangalore",
        car_title: "Mercedes-AMG G63 V8 Biturbo",
        review: "Mint condition vehicle, transparent history, and seamless delivery directly to my doorstep. Highly recommended!",
        rating: 5,
        image_url: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?q=80&w=1200&auto=format&fit=crop",
        delivery_date: "May 2026",
        order: 3,
      },
    ];

    for (const del of initialDeliveries) {
      await ctx.db.insert("testimonials", del);
    }
  }

  return { message: "Seeded successfully with delivery testimonials" };
}

export const forceSeedCars = mutation({
  handler: async (ctx) => {
    // Clear only if force seed is explicitly invoked
    const existingCars = await ctx.db.query("cars").collect();
    for (const car of existingCars) {
      await ctx.db.delete(car._id);
    }
    const existingImages = await ctx.db.query("car_images").collect();
    for (const img of existingImages) {
      await ctx.db.delete(img._id);
    }
    return await seedCarsInternal(ctx);
  },
});

export const seedImages = mutation({
  handler: async (ctx) => {
    return { message: "Images are now seeded directly in seedCars" };
  },
});

