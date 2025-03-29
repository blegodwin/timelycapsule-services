import type { Request, Response } from "express"
import Confession from "../model/confession"
import { v4 as uuidv4 } from "uuid"

export const createConfession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body

    if (!text) {
      res.status(400).json({ success: false, message: "Confession text is required" })
      return
    }

    const confession = new Confession({
      text,
      uuid: uuidv4(),
      timestamp: new Date(),
      // Sentiment analysis could be added here or through a middleware
    })

    const savedConfession = await confession.save()

    res.status(201).json({
      success: true,
      data: {
        uuid: savedConfession.uuid,
        timestamp: savedConfession.timestamp,
      },
    })
  } catch (error) {
    console.error("Error creating confession:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create confession",
    })
  }
}

export const getConfessions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pagination parameters
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination metadata
    const total = await Confession.countDocuments()

    // Fetch confessions sorted by timestamp (newest first)
    const confessions = await Confession.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select("text timestamp sentiment uuid") // Exclude _id and __v

    res.status(200).json({
      success: true,
      count: confessions.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: confessions,
    })
  } catch (error) {
    console.error("Error fetching confessions:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch confessions",
    })
  }
}

