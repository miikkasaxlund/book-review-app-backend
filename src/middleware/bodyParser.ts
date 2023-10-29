import Middleware from "../utils/Middleware";

const bodyParser = new Middleware('bodyParser', async (request, context, next) => {
  
  
  await next()
})

export default bodyParser
