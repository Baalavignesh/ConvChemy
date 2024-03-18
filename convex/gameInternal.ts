import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";


//QUERY
export const isElementCreatedNew = internalQuery({
    args: {
        elementId: v.id('elements'),
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, { elementId, sessionId }) => {
        const response = await ctx.db.query("sessionMatches")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .filter(q => q.eq(q.field("elementId"), elementId))
            .collect()
        return response.length === 0 ? true : false
    }
})

export const getUser = internalQuery({
    args: {
        sessionId: v.id('sessions'),
        userId: v.id('users'),
    },
    handler: async (ctx, { sessionId, userId }) => {
        return await ctx.db.query("users")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .filter(q => q.eq(q.field("_id"), userId))
            .first()

    }
})

//MUTATIONS
export const insertSessionMatch = internalMutation({
    args: {
        elementId: v.id('elements'),
        sessionId: v.id('sessions'),
        userId: v.id('users'),
    },
    handler: async (ctx, { elementId, sessionId, userId }) => {
        return await ctx.db.insert("sessionMatches", { elementId, sessionId, userId })
    }
})

export const insertUserMatch = internalMutation({
    args: {
        elementId: v.id('elements'),
        sessionId: v.id('sessions'),
        userId: v.id('users'),
    },
    handler: async (ctx, { elementId, sessionId, userId }) => {

        const response = await ctx.db.query("userMatches")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .filter(q => q.eq(q.field("elementId"), elementId))
            .filter(q => q.eq(q.field("userId"), userId))
            .collect()
        if (response.length > 0) {
            return
        }

        return await ctx.db.insert("userMatches", { elementId, sessionId, userId })
    }
})

export const updateLeaderboard = internalMutation({
    args: {
        sessionId: v.id('sessions'),
        userId: v.id('users'),
    },
    handler: async (ctx, { sessionId, userId }) => {
        const userLeaderboard = await ctx.db.query("leaderboard")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .filter(q => q.eq(q.field("userId"), userId))
            .unique()
        if (!userLeaderboard) {
            await ctx.db.insert("leaderboard", { sessionId: sessionId, userId: userId, score: 0 })
            return {
                sessionId,
                userId,
                score: 0
            }
        } else {
            const score = (await ctx.db.query("userMatches")
                .filter(q => q.eq(q.field("sessionId"), sessionId))
                .filter(q => q.eq(q.field("userId"), userId))
                .collect()).length
            await ctx.db.patch(userLeaderboard._id, { score })
            return {
                sessionId,
                userId,
                score
            }
        }
    }
})

export const updateSessions = internalMutation({
    args: {},
    handler: async (ctx, { }) => {
        const sessions = await ctx.db.query("sessions").collect()
        for (const session of sessions) {
            if (!session.isFinished && session.timeRemaining > 0) {
                await ctx.db.patch(session._id, { timeRemaining: session.timeRemaining - 1 })
            }
            if (session.timeRemaining === 0 && session.isStarted) {
                await ctx.db.patch(session._id, { isFinished: true })
            }
        }
    }
})

export const updateSession = internalMutation({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, { sessionId }) => {
        const session = await ctx.db.query("sessions")
            .filter(q => q.eq(q.field("_id"), sessionId))
            .first()
        if(session){
            if (!session.isFinished && session.timeRemaining > 0) {
                await ctx.db.patch(session._id, { timeRemaining: session.timeRemaining - 1 })
                await ctx.scheduler.runAfter(1000, internal.gameInternal.updateSession, { sessionId })
            }
            if (session.timeRemaining === 0 && session.isStarted) {
                await ctx.db.patch(session._id, { isFinished: true })
            }
        }
    }
})

export const addPrimaryElements = internalMutation({
    args: {
        userId: v.id('users'),
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, { userId, sessionId }) => {
        const fire = await ctx.db.query("elements")
                                .filter(q => q.eq(q.field("result"), "fire"))
                                .first()
        const water = await ctx.db.query("elements")
                                .filter(q => q.eq(q.field("result"), "water"))
                                .first()
        const earth = await ctx.db.query("elements")
                                .filter(q => q.eq(q.field("result"), "earth"))
                                .first()
        const wind = await ctx.db.query("elements")
                                .filter(q => q.eq(q.field("result"), "wind"))
                                .first()
        if(!fire) await ctx.db.insert("elements", {element1: "", element2: "", result: "fire", emoji: "🔥", isNothing: false})
            .then(async (response) => {
                await ctx.db.insert("userMatches", {elementId: response, sessionId, userId})
            })
        if(!water) await ctx.db.insert("elements", {element1: "", element2: "", result: "water", emoji: "💧", isNothing: false}).then(async (response) => {
            await ctx.db.insert("userMatches", {elementId: response, sessionId, userId})
        })
        if(!earth) await ctx.db.insert("elements", {element1: "", element2: "", result: "earth", emoji: "🌱", isNothing: false}).then(async (response) => {
            await ctx.db.insert("userMatches", {elementId: response, sessionId, userId})
        })
        if(!wind) await ctx.db.insert("elements", {element1: "", element2: "", result: "wind", emoji: "💨", isNothing: false}).then(async (response) => {
            await ctx.db.insert("userMatches", {elementId: response, sessionId, userId})
        })

        if(fire && water && earth && wind) {
            await ctx.db.insert("userMatches", {elementId: fire._id, sessionId, userId})
            await ctx.db.insert("userMatches", {elementId: water._id, sessionId, userId})
            await ctx.db.insert("userMatches", {elementId: earth._id, sessionId, userId})
            await ctx.db.insert("userMatches", {elementId: wind._id, sessionId, userId})
        }
        
            
    }
})