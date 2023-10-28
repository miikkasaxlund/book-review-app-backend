import { Container, CosmosClient } from '@azure/cosmos'

/**
 * Singleton class for interacting with Azure Cosmos DB.
 */
class Cosmos {
  /** Singleton instance of Cosmos class. */
  private static instance: Cosmos
  /** Instance of CosmosClient. */
  private client: CosmosClient

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {
    this.client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })
  }

  /**
   * Gets the singleton instance of the Cosmos class.
   * 
   * @returns The singleton instance of the Cosmos class.
   */
  private static getInstance(): Cosmos {
    if (!Cosmos.instance) {
      Cosmos.instance = new Cosmos()
    }
  
    return Cosmos.instance
  }

  /**
   * Gets the CosmosClient instance.
   * 
   * @returns The CosmosClient instance.
   */
  private static getClient(): CosmosClient {
    const instance = this.getInstance()

    return instance.client
  }

  /**
   * Gets the specified container, creating the database and container if they do not exist.
   *
   * @param databaseId - The ID of the database.
   * @param containerId - The ID of the container.
   *
   * @returns A promise that resolves to the specified container.
   */
  private static async getContainer(databaseId: string, containerId: string): Promise<Container> {
    const client = Cosmos.getClient()

    const { database } = await client.databases.createIfNotExists({ id: databaseId })
    const { container } = await database.containers.createIfNotExists({ id: containerId })

    return container
  }

  /**
   * Creates a new item in the specified database and container.
   * 
   * @param databaseId - The ID of the database.
   * @param containerId - The ID of the container.
   * @param item - The item to create.
   * 
   * @returns The created resource.
   */
  public static async create(databaseId: string, containerId: string, item: any): Promise<any> {
    const container = await Cosmos.getContainer(databaseId, containerId)

    const { resource } = await container.items.create(item)

    return resource
  }

  /**
   * Reads an item from the specified database and container.
   * 
   * @param databaseId - The ID of the database.
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to read.
   * 
   * @returns The read resource.
   */
  public static async read(databaseId: string, containerId: string, itemId: string): Promise<any> {
    const container = await Cosmos.getContainer(databaseId, containerId)

    const { resource } = await container.item(itemId).read()

    return resource
  }

  /**
   * Updates an item in the specified database and container.
   * 
   * @param databaseId - The ID of the database.
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to update.
   * @param item - The updated item.
   * 
   * @returns The updated resource.
   */
  public static async update(databaseId: string, containerId: string, itemId: string, item: any): Promise<any> {
    const container = await Cosmos.getContainer(databaseId, containerId)

    const { resource } = await container.item(itemId).replace(item)

    return resource
  }

  /**
   * Deletes an item from the specified database and container.
   * 
   * @param databaseId - The ID of the database.
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to delete.
   * 
   * @returns The response of the delete operation.
   */
  public static async delete(databaseId: string, containerId: string, itemId: string): Promise<any> {
    const container = await Cosmos.getContainer(databaseId, containerId)

    const { resource } = await container.item(itemId).delete()
    
    return resource
  }
}

export default Cosmos
