import { useEffect } from "react";
import { COMPANY_EMAIL, COMPANY_PHONE_INTL } from "../lib/whatsapp";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  jsonLd?: Record<string, any>;
}

export function SEO({
  title = "SHYN RIDE — Pre-Owned Luxury Car Showroom in Bangalore",
  description = "Curated luxury pre-owned cars in Bangalore. Porsche, BMW, Mercedes-Benz, Audi & Jaguar. Certified 150-point inspection, warranty & seamless finance.",
  image = "/og-image.jpg",
  url = "https://shynride.in",
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update OpenGraph tags
    const ogTags = [
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ];

    ogTags.forEach(({ property, name, content }) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        if (property) tag.setAttribute("property", property);
        if (name) tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // Handle JSON-LD Schema
    const scriptId = "json-ld-schema";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    }

    return () => {
      if (scriptTag) scriptTag.remove();
    };
  }, [title, description, image, url, jsonLd]);

  return null;
}

/**
 * Returns default LocalBusiness / AutoDealer schema
 */
export function getAutoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "SHYN RIDE",
    description: "Curated luxury pre-owned cars in Bangalore.",
    telephone: COMPANY_PHONE_INTL,
    email: COMPANY_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Luxury Corridor",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    openingHours: "Mo-Su 10:00-19:00",
    url: "https://shynride.in",
  };
}

/**
 * Returns Vehicle JSON-LD schema for car detail page
 */
export function getCarVehicleSchema(car: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.year} ${car.make} ${car.model} ${car.variant || ""}`.trim(),
    brand: {
      "@type": "Brand",
      name: car.make,
    },
    model: car.model,
    vehicleModelDate: car.year.toString(),
    fuelType: car.fuel_type,
    vehicleTransmission: car.transmission,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: car.km,
      unitCode: "KMT",
    },
    offers: {
      "@type": "Offer",
      price: car.price_inr,
      priceCurrency: "INR",
      itemCondition: "https://schema.org/UsedCondition",
      availability: car.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "AutoDealer",
        name: "SHYN RIDE",
        telephone: COMPANY_PHONE_INTL,
        email: COMPANY_EMAIL,
      },
    },
  };
}
