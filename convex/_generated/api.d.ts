/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as admin_stats from "../admin_stats.js";
import type * as analytics from "../analytics.js";
import type * as announcements from "../announcements.js";
import type * as assignments from "../assignments.js";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as auth_actions from "../auth_actions.js";
import type * as blogs from "../blogs.js";
import type * as calendar from "../calendar.js";
import type * as cbc from "../cbc.js";
import type * as cbc_analytics from "../cbc_analytics.js";
import type * as cbc_pathways from "../cbc_pathways.js";
import type * as cbc_queries from "../cbc_queries.js";
import type * as cbc_reports from "../cbc_reports.js";
import type * as certificates from "../certificates.js";
import type * as challenges from "../challenges.js";
import type * as cohorts from "../cohorts.js";
import type * as communications from "../communications.js";
import type * as courses from "../courses.js";
import type * as emails from "../emails.js";
import type * as file_upload from "../file_upload.js";
import type * as finance from "../finance.js";
import type * as forums from "../forums.js";
import type * as goals from "../goals.js";
import type * as grades from "../grades.js";
import type * as http from "../http.js";
import type * as knec from "../knec.js";
import type * as lessons from "../lessons.js";
import type * as library from "../library.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as parent_actions from "../parent_actions.js";
import type * as parent_stats from "../parent_stats.js";
import type * as payments from "../payments.js";
import type * as portfolio_management from "../portfolio_management.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as student_stats from "../student_stats.js";
import type * as teacher_dashboard from "../teacher_dashboard.js";
import type * as teachers from "../teachers.js";
import type * as tickets from "../tickets.js";
import type * as user_sessions from "../user_sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  admin_stats: typeof admin_stats;
  analytics: typeof analytics;
  announcements: typeof announcements;
  assignments: typeof assignments;
  attendance: typeof attendance;
  auth: typeof auth;
  auth_actions: typeof auth_actions;
  blogs: typeof blogs;
  calendar: typeof calendar;
  cbc: typeof cbc;
  cbc_analytics: typeof cbc_analytics;
  cbc_pathways: typeof cbc_pathways;
  cbc_queries: typeof cbc_queries;
  cbc_reports: typeof cbc_reports;
  certificates: typeof certificates;
  challenges: typeof challenges;
  cohorts: typeof cohorts;
  communications: typeof communications;
  courses: typeof courses;
  emails: typeof emails;
  file_upload: typeof file_upload;
  finance: typeof finance;
  forums: typeof forums;
  goals: typeof goals;
  grades: typeof grades;
  http: typeof http;
  knec: typeof knec;
  lessons: typeof lessons;
  library: typeof library;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  parent_actions: typeof parent_actions;
  parent_stats: typeof parent_stats;
  payments: typeof payments;
  portfolio_management: typeof portfolio_management;
  quizzes: typeof quizzes;
  seed: typeof seed;
  settings: typeof settings;
  student_stats: typeof student_stats;
  teacher_dashboard: typeof teacher_dashboard;
  teachers: typeof teachers;
  tickets: typeof tickets;
  user_sessions: typeof user_sessions;
  users: typeof users;
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
