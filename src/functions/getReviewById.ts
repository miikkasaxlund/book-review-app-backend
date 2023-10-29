import { app } from "@azure/functions"
import RequestHandler from "../utils/RequestHandler"
import HttpError from "../errors/HttpError"
import ReviewManager from "../utils/managers/ReviewManager"

/**
 * Endpoint to retrieve a review by its unique identifier.
 */
const getReviewById = new RequestHandler('getReviewById')
  .use(async (request, _context) => {  
    const review = await ReviewManager.getReviewById(request.params.reviewId)
  
    if (review) {
      return {
        jsonBody: review
      }
    }
    
    throw new HttpError(404, 'Not found')
  })

app.http('getReviewById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'reviews/{reviewId}',
    handler: getReviewById.httpTrigger
});
