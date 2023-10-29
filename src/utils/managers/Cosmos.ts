import { Container, CosmosClient } from '@azure/cosmos'
import CosmosDbError from '../../errors/CosmosDbError'
import { DATABASE_ID } from '../../constants'

/**
 * WARN! For development purposes, TLS certificate rejection is disabled.
 */
if (process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

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
    try {
      this.client = new CosmosClient({
        endpoint: process.env.COSMOS_ENDPOINT,
        key: process.env.COSMOS_KEY
      })
    } catch (error) {
      throw new CosmosDbError('Failed to initialize Cosmos client.')
    }
  }

  /**
   * Gets the singleton instance of the Cosmos class.
   * 
   * @returns The singleton instance of the Cosmos class.
   */
  private static getInstance(): Cosmos {
    try {
      if (!Cosmos.instance) {
        Cosmos.instance = new Cosmos()
      }
    
      return Cosmos.instance
    } catch (error) {
      throw new CosmosDbError('Error getting the Cosmos instance.')
    }
  }

  /**
   * Gets the CosmosClient instance.
   * 
   * @returns The CosmosClient instance.
   */
  private static getClient(): CosmosClient {
    try {
      return this.getInstance().client
    } catch (error) {
      throw new CosmosDbError('Error getting the CosmosClient instance.')
    }
  }

  /**
   * Gets the specified container, creating the database and container if they do not exist.
   *
   * @param containerId - The ID of the container.
   *
   * @returns A promise that resolves to the specified container.
   */
  private static async getContainer(containerId: string): Promise<Container> {
    try {
      const client = Cosmos.getClient()
  
      const { database } = await client.databases.createIfNotExists({ id: DATABASE_ID })
      const { container } = await database.containers.createIfNotExists({ id: containerId })
  
      return container
    } catch (error) {
      throw new CosmosDbError(`Error getting container "${containerId}" on database "${DATABASE_ID}".`)
    }
  }

  /**
   * Strips out system-generated fields from the resource.
   * 
   * @param resource - The resource object from Cosmos DB.
   * 
   * @returns The resource without system-generated fields.
   */
  private static stripSystemFields(resource: any): any {
    try {
      if (!resource) return undefined

      const { _rid, _self, _etag, _attachments, _ts, ...rest } = resource

      return rest
    } catch (error) {
      throw new CosmosDbError('Error stripping the system-generated fields from the resource.')
    }
  }

  /**
   * Creates a new item in the specified container.
   * 
   * @param containerId - The ID of the container.
   * @param item - The item to create.
   * 
   * @returns The created resource.
   */
  public static async create(containerId: string, item: any): Promise<any> {
    try {      
      const container = await Cosmos.getContainer(containerId)
  
      const { resource } = await container.items.create(item)
  
      return this.stripSystemFields(resource)
    } catch (error) {
      throw new CosmosDbError(`Error creating item in container "${containerId}" on database "${DATABASE_ID}".`)
    }
  }

  /**
   * Fetches a specific item from the designated container.
   * 
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to read.
   * 
   * @returns The read resource.
   */
  public static async read(containerId: string, itemId: string): Promise<any> {
    try {
      const container = await Cosmos.getContainer(containerId)
  
      const { resource } = await container.item(itemId).read()
  
      return this.stripSystemFields(resource)
    } catch (error) {
      throw error
      throw new CosmosDbError(`Error reading item "${itemId}" from container "${containerId}" on database "${DATABASE_ID}".`)
    }
  }

  /**
   * Fetches all items from a given container.
   * 
   * @param containerId - Identifier for the container.
   * 
   * @returns A promise that resolves to an array of resources.
   */
  public static async readAll(containerId: string): Promise<any[]> {
    try {
      const container = await Cosmos.getContainer(containerId)
  
      const querySpec = {
          query: 'SELECT * FROM c'
      }
  
      const { resources } = await container.items.query(querySpec).fetchAll()
  
      return resources.map(resource => this.stripSystemFields(resource))
    } catch (error) {
      throw new CosmosDbError(`Error reading all items from container "${containerId}" on database "${DATABASE_ID}".`)
    }
}

  /**
   * Updates an item in the specified container.
   * 
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to update.
   * @param item - The updated item.
   * 
   * @returns The updated resource.
   */
  public static async update(containerId: string, itemId: string, item: any): Promise<any> {
    try {      
      const container = await Cosmos.getContainer(containerId)
  
      const { resource } = await container.item(itemId).replace(item)
  
      return this.stripSystemFields(resource)
    } catch (error) {
      throw new CosmosDbError(`Error updating item "${itemId}" in container "${containerId}" on database "${DATABASE_ID}".`)
    }
  }

  /**
   * Deletes an item from the specified container.
   * 
   * @param containerId - The ID of the container.
   * @param itemId - The ID of the item to delete.
   * 
   * @returns The response of the delete operation.
   */
  public static async delete(containerId: string, itemId: string): Promise<any> {
    try {
      const container = await Cosmos.getContainer(containerId)
  
      const { resource } = await container.item(itemId).delete()
      
      return this.stripSystemFields(resource)
    } catch (error) {
      throw new CosmosDbError(`Error deleting item "${itemId}" from container "${containerId}" on database "${DATABASE_ID}".`)
    }
  }
}

export default Cosmos
