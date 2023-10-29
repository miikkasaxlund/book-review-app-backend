/**
 * Represents an error specific to interactions with Azure Cosmos DB.
 * 
 * This class extends the native JavaScript `Error` class to provide a more specific
 * error type for situations where issues related to Cosmos DB arise. It can be used
 * to distinguish Cosmos DB errors from other types of errors in the application.
 */
class CosmosDbError extends Error {
  /**
   * Constructs a new CosmosDbError.
   * 
   * @param message - A human-readable description of the error.
   */
  constructor(message: string) {
    super(message)

    this.name = 'CosmosDbError'

    // Ensure the prototype chain is set up correctly.
    Object.setPrototypeOf(this, CosmosDbError.prototype)
  }
}

export default CosmosDbError