/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as bookings from "../bookings.js";
import type * as cars from "../cars.js";
import type * as dashboard from "../dashboard.js";
import type * as enquiries from "../enquiries.js";
import type * as faqs from "../faqs.js";
import type * as inventory from "../inventory.js";
import type * as lib_requireAdmin from "../lib/requireAdmin.js";
import type * as notifications from "../notifications.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as siteContent from "../siteContent.js";
import type * as testimonials from "../testimonials.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  bookings: typeof bookings;
  cars: typeof cars;
  dashboard: typeof dashboard;
  enquiries: typeof enquiries;
  faqs: typeof faqs;
  inventory: typeof inventory;
  "lib/requireAdmin": typeof lib_requireAdmin;
  notifications: typeof notifications;
  reports: typeof reports;
  seed: typeof seed;
  settings: typeof settings;
  siteContent: typeof siteContent;
  testimonials: typeof testimonials;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
