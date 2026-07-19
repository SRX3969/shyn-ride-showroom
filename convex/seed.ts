import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedCars = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("cars").first();
    if (existing) return { message: "Already seeded" };

    const cars = [
      {
        slug: "2022-mercedes-benz-e-class-e200",
        make: "Mercedes-Benz",
        model: "E-Class",
        variant: "E200 Exclusive",
        year: 2022,
        price_inr: 5200000,
        price_negotiable: true,
        km: 18000,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "Sedan",
        color: "Obsidian Black",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "Immaculate 2022 Mercedes-Benz E200 Exclusive with just 18,000 km on the clock. Full service history maintained at Benchmark Cars Bangalore. Features include MBUX infotainment, 64-color ambient lighting, Burmester sound system, and panoramic sunroof.",
        features: [
          "MBUX Infotainment",
          "64-Color Ambient Lighting",
          "Burmester Sound System",
          "Panoramic Sunroof",
          "360° Camera",
          "Wireless Charging",
          "Heated Seats",
          "Digital Cockpit",
        ],
      },
      {
        slug: "2021-bmw-x5-xdrive30d",
        make: "BMW",
        model: "X5",
        variant: "xDrive30d M Sport",
        year: 2021,
        price_inr: 6800000,
        price_negotiable: true,
        km: 32000,
        fuel_type: "Diesel",
        transmission: "Automatic",
        body_type: "SUV",
        color: "Carbon Black",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "BMW X5 xDrive30d M Sport with the commanding road presence you'd expect. This one-owner car has been meticulously maintained with full BMW service history.",
        features: [
          "M Sport Package",
          "Air Suspension",
          "Panoramic Sunroof",
          "Harman Kardon Audio",
          "Heads-Up Display",
          "Gesture Control",
          "Parking Assistant Plus",
          "BMW Live Cockpit Professional",
        ],
      },
      {
        slug: "2023-audi-a6-45tfsi",
        make: "Audi",
        model: "A6",
        variant: "45 TFSI Technology",
        year: 2023,
        price_inr: 5800000,
        price_negotiable: false,
        km: 12000,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "Sedan",
        color: "Glacier White",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "Nearly new 2023 Audi A6 45 TFSI with Technology package. Barely driven 12,000 km. Virtual cockpit, Matrix LED headlights, and Audi's quattro-inspired design language.",
        features: [
          "Virtual Cockpit Plus",
          "Matrix LED Headlights",
          "Bang & Olufsen 3D Sound",
          "Audi Connect",
          "Wireless Apple CarPlay",
          "Adaptive Cruise Control",
          "Park Assist",
          "Four Zone Climate",
        ],
      },
      {
        slug: "2020-land-rover-range-rover-sport",
        make: "Land Rover",
        model: "Range Rover Sport",
        variant: "HSE Dynamic",
        year: 2020,
        price_inr: 8500000,
        price_negotiable: true,
        km: 45000,
        fuel_type: "Diesel",
        transmission: "Automatic",
        body_type: "SUV",
        color: "Santorini Black",
        owners: 2,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "Range Rover Sport HSE Dynamic in commanding Santorini Black. 3.0L diesel with effortless power delivery. Full Land Rover service history, adaptive dynamics, and terrain response system.",
        features: [
          "Adaptive Dynamics",
          "Terrain Response 2",
          "Meridian Sound System",
          "Panoramic Roof",
          "Configurable Ambient Lighting",
          "Interactive Driver Display",
          "Activity Key",
          "Wade Sensing",
        ],
      },
      {
        slug: "2022-porsche-911-carrera",
        make: "Porsche",
        model: "911",
        variant: "Carrera S",
        year: 2022,
        price_inr: 18500000,
        price_negotiable: false,
        km: 8000,
        fuel_type: "Petrol",
        transmission: "Automatic",
        body_type: "Coupe",
        color: "GT Silver",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "The one you've been looking for. 2022 Porsche 911 Carrera S (992) with Sport Chrono, PASM, and the legendary flat-six. Just 8,000 km. Collector condition.",
        features: [
          "Sport Chrono Package",
          "PASM Sport Suspension",
          "Sport Exhaust System",
          "Porsche Communication Management",
          "BOSE Surround Sound",
          "Adaptive Sport Seats Plus",
          "GT Sport Steering Wheel",
          "Rear Axle Steering",
        ],
      },
      {
        slug: "2021-jaguar-f-pace-r-dynamic",
        make: "Jaguar",
        model: "F-Pace",
        variant: "R-Dynamic S",
        year: 2021,
        price_inr: 5600000,
        price_negotiable: true,
        km: 28000,
        fuel_type: "Diesel",
        transmission: "Automatic",
        body_type: "SUV",
        color: "Eiger Grey",
        owners: 1,
        reg_state: "KA",
        status: "available",
        featured: true,
        description:
          "Jaguar F-Pace R-Dynamic S in striking Eiger Grey. This performance SUV combines Jaguar's sports car DNA with everyday usability. Full Jaguar service history.",
        features: [
          "R-Dynamic Styling",
          "Meridian Sound System",
          "Configurable Dynamics",
          "Interactive Driver Display",
          "Gesture Controlled Sunblind",
          "Activity Key",
          "ClearSight Rear View Mirror",
          "Adaptive Cruise with Steering Assist",
        ],
      },
    ];

    for (const car of cars) {
      await ctx.db.insert("cars", {
        ...car,
        deleted_at: undefined,
      });
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

    return { message: "Seeded successfully" };
  },
});

// Seed car images after cars are created
export const seedImages = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("car_images").first();
    if (existing) return { message: "Images already seeded" };

    const cars = await ctx.db.query("cars").collect();
    // Add placeholder image URLs for each car
    const imageBase = "https://images.unsplash.com/photo-";
    const carImages: Record<string, string[]> = {
      "Mercedes-Benz": [
        `${imageBase}1618843479313-40f8afb4b4d8?w=800&auto=format`,
        `${imageBase}1617814076367-b759c7c9ea78?w=800&auto=format`,
      ],
      BMW: [
        `${imageBase}1555215695-3004980ad54e?w=800&auto=format`,
        `${imageBase}1580273916550-e323be2ae537?w=800&auto=format`,
      ],
      Audi: [
        `${imageBase}1606664515424-1af841d3f024?w=800&auto=format`,
        `${imageBase}1603584173870-7f23fdae1b7a?w=800&auto=format`,
      ],
      "Land Rover": [
        `${imageBase}1519641471654-76ce0107ad1b?w=800&auto=format`,
        `${imageBase}1606016159991-dfe4f2746db5?w=800&auto=format`,
      ],
      Porsche: [
        `${imageBase}1503376780353-7e6692767b70?w=800&auto=format`,
        `${imageBase}1544636331-e26879cd4d9b?w=800&auto=format`,
      ],
      Jaguar: [
        `${imageBase}1618843479093-f0f5a6e3c3a7?w=800&auto=format`,
        `${imageBase}1549317661-bd32c8ce0abe?w=800&auto=format`,
      ],
    };

    for (const car of cars) {
      const images = carImages[car.make] ?? [
        `${imageBase}1494976388531-d1058494cdd8?w=800&auto=format`,
      ];
      for (let i = 0; i < images.length; i++) {
        await ctx.db.insert("car_images", {
          car_id: car._id,
          url: images[i],
          alt: `${car.year} ${car.make} ${car.model} — photo ${i + 1}`,
          sort_order: i,
        });
      }
    }

    return { message: "Images seeded successfully" };
  },
});
