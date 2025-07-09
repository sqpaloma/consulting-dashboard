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
import type * as auth from "../auth.js";
import type * as auto_conversations from "../auto_conversations.js";
import type * as chat from "../chat.js";
import type * as cleanup from "../cleanup.js";
import type * as diagnose_login from "../diagnose_login.js";
import type * as events from "../events.js";
import type * as seed from "../seed.js";
import type * as seed_chat from "../seed_chat.js";
import type * as setup_real_users from "../setup_real_users.js";
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
  auth: typeof auth;
  auto_conversations: typeof auto_conversations;
  chat: typeof chat;
  cleanup: typeof cleanup;
  diagnose_login: typeof diagnose_login;
  events: typeof events;
  seed: typeof seed;
  seed_chat: typeof seed_chat;
  setup_real_users: typeof setup_real_users;
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
