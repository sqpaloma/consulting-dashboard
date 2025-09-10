/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as cotacoes from "../cotacoes.js";
import type * as dashboard from "../dashboard.js";
import type * as diagnose_login from "../diagnose_login.js";
import type * as events from "../events.js";
import type * as indicadores from "../indicadores.js";
import type * as notes from "../notes.js";
import type * as returnsMovements from "../returnsMovements.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  chat: typeof chat;
  cotacoes: typeof cotacoes;
  dashboard: typeof dashboard;
  diagnose_login: typeof diagnose_login;
  events: typeof events;
  indicadores: typeof indicadores;
  notes: typeof notes;
  returnsMovements: typeof returnsMovements;
  todos: typeof todos;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
