export interface ReviewData {
  /** Unique identifier for the review. */
  id: string
  /** Unique identifier for the reviewed book. */
  bookId: string
  /** Unique identifier for the reviewer. */
  userId: string
  /** Numerical rating assigned to the book in the review. */
  rating: number
  /** Textual content of the review. */
  text: string
  /** Date when the review was created. */
  reviewDate: string
}

/**
 * A class representation of a book review.
 */
class Review implements ReviewData {
  id: string
  bookId: string
  userId: string
  rating: number
  text: string
  reviewDate: string

  /**
   * Constructs a new Review.
   * 
   * @param data - The data used to instantiate the Review.
   */
  constructor(data: ReviewData) {
    this.id = data.id
    this.bookId = data.bookId
    this.userId = data.userId
    this.rating = data.rating
    this.text = data.text
    this.reviewDate = data.reviewDate
  }

  /**
   * Converts the review's data into a JSON string representation.
   * 
   * @returns The JSON string representation of the review.
   */
    public toJson(): string {
      return JSON.stringify({
        id: this.id,
        bookId: this.bookId,
        userId: this.userId,
        rating: this.rating,
        text: this.text,
        reviewDate: this.reviewDate
      })
    }
}

export default Review
