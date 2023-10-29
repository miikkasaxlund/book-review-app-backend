import { app } from "@azure/functions"

import RequestHandler from "../utils/RequestHandler"
import HttpError from "../errors/HttpError"
import { ReviewData } from "../models/Review"
import ReviewManager from "../utils/managers/ReviewManager"

/**
 * Endpoint to create a new review.
 */
const createReview = new RequestHandler('createReview')
  .use(async (request, _context) => {
    const bookId = request.params.bookId
    const data = await request.json() as ReviewData

    const reviewData: ReviewData = {
      ...data,
      bookId
    }

    const review = await ReviewManager.createReview(reviewData)
  
    if (review) {
      return { jsonBody: review }
    }

    throw new HttpError(500, 'Error creating a review')
  })

app.http('createReview', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'books/{bookId}/reviews',
    handler: createReview.httpTrigger
});
