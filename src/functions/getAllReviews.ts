import { app } from "@azure/functions"

import RequestHandler from "../utils/RequestHandler"
import ReviewManager from "../utils/managers/ReviewManager"

/**
 * Endpoint to retrieve all reviews.
 */
const getAllReviews = new RequestHandler('getAllReviews')
  .use(async (_request, _context) => {
    const reviews = await ReviewManager.getAllReviews()!
  
    return { jsonBody: reviews }
  })

app.http('getAllReviews', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'reviews',
    handler: getAllReviews.httpTrigger
})
