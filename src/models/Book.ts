/**
 * Represents the essential data structure of a book.
 */
export interface BookData {
  /** The unique identifier for the book. */
  id: string
  /** The title of the book. */
  title: string
  /** The author of the book. */
  author: string
  /** The publication date of the book in string format. */
  publicationDate: string
  /** The genre of the book. */
  genre: string
}

/**
 * A class representation of a book.
 */
class Book implements BookData {
  id: string
  title: string
  author: string
  publicationDate: string
  genre: string

  /**
   * Constructs a new Book instance.
   * 
   * @param data - The data used to instantiate the Book.
   */
  constructor(data: BookData) {
    this.id = data.id
    this.title = data.title
    this.author = data.author
    this.publicationDate = data.publicationDate
    this.genre = data.genre
  }

  /**
   * Converts the book's data into a JSON string representation.
   * 
   * @returns The JSON string representation of the book.
   */
  public toJson(): string {
    return JSON.stringify({
      id: this.id,
      title: this.title,
      author: this.author,
      publicationDate: this.publicationDate,
      genre: this.genre
    })
  }
}

export default Book
