import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

interface UserMatch {
    id: string,
    userId: Id<"users">,
    username: string | undefined,
    elementId: Id<"elements">,
    element: string | undefined,
    emoji: string | undefined,
}

//QUERIES

/**
 * Retrieves user matches based on the provided session ID and user ID.
 * @param {Object} query - The query object containing the session ID and user ID.
 * @param {string} query.sessionId - The session ID.
 * @param {string} query.userId - The user ID.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of user matches.
 */
export const getUserMatches = query({
    args: {
        sessionId: v.id('sessions'),
        userId: v.id('users'),
    },
    handler: async (ctx, { sessionId, userId }) => {
        const userMatches = await ctx.db.query("userMatches")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .filter(q => q.eq(q.field("userId"), userId))
            .collect()
        var out: {
            id: string,
            userId: Id<"users">,
            username: string | undefined,
            elementId: Id<"elements">,
            element: string | undefined,
            emoji: string | undefined,
            isNothing: boolean | undefined
        }[] = []
        for (var match of userMatches) {
            const user = await ctx.db.query("users")
                .filter(q => q.eq(q.field("_id"), match.userId))
                .first()
            const element = await ctx.db.query("elements")
                .filter(q => q.eq(q.field("_id"), match.elementId))
                .first()
            out.push({id:match._id, userId: match.userId, username: user?.username, elementId: match.elementId, element: element?.result, emoji: element?.emoji, isNothing: element?.isNothing})
        }
        out = out.filter((v,i,a)=>a.findIndex(t=>(t.element === v.element))===i)
        out = out.filter((element) => !element.isNothing)
        return out
    }
})

/**
 * Retrieves session matches based on the provided session ID.
 * @param {string} sessionId - The ID of the session.
 * @returns {Promise<Array<{
 *   userId: Id<"users">,
 *   username: string | undefined,
 *   elementId: Id<"elements">,
 *   element: string | undefined,
 *   emoji: string | undefined,
 * }>>} - An array of session matches.
 */
export const getSessionMatches = query({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, { sessionId }) => {
        const sessionMatches = await ctx.db.query("sessionMatches")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .collect()
        var out: {
            userId: Id<"users">,
            username: string | undefined,
            elementId: Id<"elements">,
            element: string | undefined,
            emoji: string | undefined,
        }[] = []

        for (var match of sessionMatches) {
            const user = await ctx.db.query("users")
                .filter(q => q.eq(q.field("_id"), match.userId))
                .first()
            const element = await ctx.db.query("elements")
                .filter(q => q.eq(q.field("_id"), match.elementId))
                .first()
            out.push({ userId: match.userId, username: user?.username, elementId: match.elementId, element: element?.result, emoji: element?.emoji })
        }
        return out

    }
})

/**
 * Retrieves the leaderboard for a given session.
 * @param sessionId - The ID of the session.
 * @returns An array of leaderboard entries, each containing the username, score, userId, and isHost status.
 */
export const getLeaderboard = query({
    args: {
        sessionId: v.id('sessions'),
    },
    handler: async (ctx, { sessionId }) => {
        const leaderboard = await ctx.db.query("leaderboard")
            .filter(q => q.eq(q.field("sessionId"), sessionId))
            .collect()
        var out: {
            username: string | undefined,
            score: number,
            userId: Id<"users">,
            isHost: boolean | undefined
        }[] = []
        for (const user of leaderboard) {
            var leaderboardUser = await ctx.db.query("users")
                .filter(q => q.eq(q.field("_id"), user.userId))
                .first()
            out.push({ username: leaderboardUser?.username, score: user.score, userId: user.userId, isHost: leaderboardUser?.isHost })
        }
        out = out.sort((a, b) => b.score - a.score)
        return out
    }
})

/**
 * Retrieves the game session with the specified sessionId.
 * @param sessionId The ID of the game session.
 * @returns A promise that resolves to the game session object.
 */
export const getGame = query({
    args: {
        sessionId: v.optional(v.string()),
    },
    handler: async (ctx, { sessionId }) => {
        try {
            if(sessionId && sessionId.length > 0) {
                const game = await ctx.db.query("sessions")
                .filter(q => q.eq(q.field("_id"), sessionId))
                .first()
                const host = await ctx.db.query("users")
                            .filter(q => q.eq(q.field("sessionId"), sessionId))
                            .filter(q => q.eq(q.field("isHost"), true))
                            .first()
                const returnObj = {
                    ...game,
                    host: host?._id
                }
                return returnObj
            }else {
                return null
            }
        }catch(e){
            return null
        }
    }
})

//MUTATIONS
/**
 * Creates a new game session.
 * 
 * @param {string} username - The username of the host.
 * @param {number} totalRound - The total number of rounds in the game.
 * @param {number} timePerRound - The time limit per round in seconds.
 * @returns {Promise<{ sessionId: string, userId: string }>} - A promise that resolves to an object containing the session ID and the user ID of the host.
 */
export const createGame = mutation({
    args: {
        username: v.string(),
    },
    handler: async (ctx, { username }) => {
        const response = await ctx.db.insert("sessions", { currentRound: 0,totalTime:0,timeRemaining:0,isStarted: false,isFinished:false,playerCount:1 })
        const addHost: Id<"users"> = await ctx.db.insert("users", { sessionId: response, username, isHost: true })
        await ctx.scheduler.runAfter(0, internal.gameInternal.updateLeaderboard, { sessionId: response, userId: addHost })
        await ctx.scheduler.runAfter(0,internal.gameInternal.addPrimaryElements,{sessionId:response,userId:addHost})
        return {
            sessionId: response,
            userId: addHost,
            username
        }
    }
})

export const startGame = action({
    args: {
        sessionId: v.id('sessions'),
        totalTime: v.number()
    },
    handler: async (ctx, { sessionId,totalTime }) => {
        await ctx.runMutation(api.game.updateGame, { sessionId, isStarted: true,totalTime,timeRemaining:totalTime })
        await ctx.runMutation(internal.gameInternal.updateSession, {sessionId})
    }
})

/**
 * Updates the game session with the specified parameters.
 * @param sessionId - The ID of the game session.
 * @param totalTime - The total time of the game session (optional).
 * @param isStarted - Indicates whether the game session has started (optional).
 * @param isFinished - Indicates whether the game session has finished (optional).
 * @param playerCount - The number of players in the game session (optional).
 */
export const updateGame = mutation({
    args: {
        sessionId: v.id('sessions'),
        totalTime: v.optional(v.number()),
        isStarted: v.optional(v.boolean()),
        isFinished: v.optional(v.boolean()),
        playerCount: v.optional(v.number()),
        timeRemaining: v.optional(v.number())
    },
    handler: async (ctx, { sessionId, totalTime, isStarted,isFinished, playerCount, timeRemaining }) => {
        if(totalTime){
            await ctx.db.patch(sessionId, { totalTime })
        }
        if(isStarted){
            await ctx.db.patch(sessionId, { isStarted })
        }
        if(isFinished){
            await ctx.db.patch(sessionId, { isFinished })
        }
        if(playerCount){
            await ctx.db.patch(sessionId, { playerCount })
        }
        if(timeRemaining){
            await ctx.db.patch(sessionId, { timeRemaining })
        }
    }
})

/**
 * Joins a game session.
 * 
 * @param sessionId - The ID of the game session.
 * @param username - The username of the player joining the game.
 * @returns An object containing the session ID and the user ID.
 */
export const joinGame = mutation({
    args: {
        sessionId: v.id('sessions'),
        username: v.string(),
    },
    handler: async (ctx, { sessionId, username }) => {
        const response = await ctx.db.insert("users", { sessionId, username, isHost: false })
        await ctx.scheduler.runAfter(0, internal.gameInternal.updateLeaderboard, { sessionId: sessionId, userId: response })
        await ctx.scheduler.runAfter(0,internal.gameInternal.addPrimaryElements,{sessionId,userId:response})
        return {
            sessionId,
            userId: response
        }
    }
})

//ACTIONS
/**
 * Represents a user match element action.
 * @param sessionId - The ID of the session.
 * @param userId - The ID of the user.
 * @param element1 - The first element.
 * @param element2 - The second element.
 * @returns An object containing information about the user match.
 */
export const userMatchElement = action({
    args: {
        sessionId: v.id('sessions'),
        userId: v.id('users'),
        element1: v.string(),
        element2: v.string(),
    },
    handler: async (ctx, { sessionId, userId, element1, element2 }) => {
        const element: any = await ctx.runAction(internal.alchemy.getElement, { element1, element2 })
        const isNewInSession: boolean = await ctx.runQuery(internal.gameInternal.isElementCreatedNew, { elementId: element._id, sessionId })

        if (isNewInSession) {
            await ctx.runMutation(internal.gameInternal.insertSessionMatch, { elementId: element._id, sessionId, userId })
            await ctx.runMutation(internal.gameInternal.updateLeaderboard, { sessionId, userId })
        }

        const response: Id<"userMatches"> | null = await ctx.runMutation(internal.gameInternal.insertUserMatch, { elementId: element._id, sessionId, userId })
        return element
    }
})