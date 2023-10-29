import { InvocationContext } from '@azure/functions';
import winston from 'winston'

import AzureFunctionContextTransport from './AzureFunctionContextTransport';

/**
 * Singleton class that provides logging functionalities using winston.
 */
class Logger {
  /** Singleton instance of the Logger class. */
  private static instance: Logger
  /** Primary logger instance used for logging. */
  private logger: winston.Logger
  /** Map containing child loggers for specific invocation contexts. */
  private static loggers: Map<string, winston.Logger> = new Map()

  /**
   * Singleton class that provides logging functionalities using winston.
   */
  private constructor() {
    const transports = [new winston.transports.Console()];

    this.logger = winston.createLogger({
      level: 'info',
      format: Logger.getDefaultFormat(),
      transports,
    })
  }

  /**
   * Gets the singleton instance.
   */
  private static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }

    return Logger.instance
  }

  /**
   * Returns the default logging format.
   * 
   * @returns The default logging format.
   */
  private static getDefaultFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message }) => `${level}: ${message}`)
    )
  }

  /**
   * Retrieves the logger instance.
   * 
   * @returns The logger instance.
   */
  public static get() {
    const instance = Logger.getInstance()

    return instance.logger
  }

  /**
   * Creates a child logger with context-specific configuration.
   * 
   * @param context - The invocation context from Azure functions.
   * @returns The child logger.
   */
  public static create(context: InvocationContext) {
    const instance = Logger.getInstance()

    if (Logger.loggers.has(context.invocationId)) {
      return Logger.loggers.get(context.invocationId)
    }

    const format = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, invocationId }) => 
        `[${invocationId}] ${level}: ${message}`)
    )

    const transports = new AzureFunctionContextTransport({ context })

    const childLogger = instance.logger.child({
      invocationId: context.invocationId,
      format,
      transports
    })

    Logger.loggers.set(context.invocationId, childLogger)

    return childLogger
  }

  /**
   * Removes a child logger from the map.
   * 
   * @param context - The invocation context from Azure functions.
   */
  public static destroy(context: InvocationContext) {
    if (Logger.loggers.has(context.invocationId)) {
      Logger.loggers.delete(context.invocationId)
    }
  }

  /**
   * Logs a message with 'info' level.
   * 
   * @param message - The message to log.
   */
  static log(message: string): void {
    const instance = Logger.getInstance()

    instance.logger.log('info', message)
  }

  /**
   * Logs a message with 'info' level.
   * 
   * @param message - The message to log.
   */
  static info(message: string): void {
    const instance = Logger.getInstance()

    instance.logger.info(message)
  }

  /**
   * Logs a message with 'debug' level.
   * 
   * @param message - The message to log.
   */
  static debug(message: string): void {
    const instance = Logger.getInstance()

    instance.logger.debug(message)
  }

  /**
   * Logs a message with 'warn' level.
   * 
   * @param message - The message to log.
   */
  static warn(message: string): void {
    const instance = Logger.getInstance()

    instance.logger.warn(message)
  }

  /**
   * Logs a message with 'error' level.
   * 
   * @param message - The message to log.
   */
  static error(message: string): void {
    const instance = Logger.getInstance()

    instance.logger.error(message)
  }
}

export default Logger
