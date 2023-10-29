import Transport from 'winston-transport'

/**
 * Custom winston transport for Azure Functions.
 * This transport allows logs to be directed to the Azure Function's built-in logging mechanism.
 */
class AzureFunctionContextTransport extends Transport {
  /** The Azure Function context object. */
  private context: any

  /**
   * Constructs a new AzureFunctionContextTransport instance.
   *
   * @param opts - Options for the transport. Must include the Azure Function's `context`.
   */
  constructor(opts: any) {
    super(opts)
    this.context = opts.context
  }

  /**
   * Logs information using Azure Function's context.
   *
   * @param info - Logging information. Includes log level and message.
   * @param callback - Callback function to be invoked after logging.
   */
  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    this.context.log(`${info.level}: ${info.message}`);
    callback()
  }
}

export default AzureFunctionContextTransport
