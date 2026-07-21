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
import type * as cars from "../cars.js";
import type * as dashboard from "../dashboard.js";
import type * as enquiries from "../enquiries.js";
import type * as faqs from "../faqs.js";
import type * as inventory from "../inventory.js";
import type * as lib_requireAdmin from "../lib/requireAdmin.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as siteContent from "../siteContent.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  cars: typeof cars;
  dashboard: typeof dashboard;
  enquiries: typeof enquiries;
  faqs: typeof faqs;
  inventory: typeof inventory;
  "lib/requireAdmin": typeof lib_requireAdmin;
  reports: typeof reports;
  seed: typeof seed;
  settings: typeof settings;
  siteContent: typeof siteContent;
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
