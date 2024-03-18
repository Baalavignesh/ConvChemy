// NOTE: You can remove this file. Declaring the shape
// of the database is entirely optional in Convex.
// See https://docs.convex.dev/database/schemas.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    elements: defineTable({
      element1: v.string(),
      element2: v.string(),
      result: v.string(),
      emoji: v.string(),
      isNothing: v.boolean(),
    }),
    leaderboard: defineTable({
      sessionId: v.id('sessions'),
      userId: v.id('users'),
      score: v.number(),
    }),
    sessionMatches: defineTable({
      sessionId: v.id('sessions'),
      elementId: v.id('elements'),
      userId: v.id('users'),
    }).index("sessionId",["sessionId"])
    .index("elementId",["elementId"])
    .index("userId",["userId"]),
    userMatches: defineTable({
      sessionId: v.id('sessions'),
      elementId: v.id('elements'),
      userId: v.id('users'),
    }).index("sessionId",["sessionId"])
      .index("elementId",["elementId"])
      .index("userId",["userId"]),
    sessions: defineTable({
      currentRound: v.number(),
      timeRemaining: v.number(),
      totalTime: v.number(),
      isStarted: v.boolean(),
      isFinished: v.boolean(),
      playerCount: v.number(),
    }),
    users: defineTable({
      sessionId: v.id('sessions'),
      username: v.string(),
      isHost: v.boolean(),
    }).index("sessionId",["sessionId"]),
  },
  { schemaValidation: true }
);
