import proxy from "express-http-proxy"

export const proxyWithHeaders =(serviceUrl, options = {})=>{
    return proxy(
        serviceUrl,
        {
          ...options,
          proxyReqOptDecorator: (proxyReqOpts, srcReq) =>{
            if(srcReq.user){
                proxyReqOpts.headers["x-user-id"]=srcReq.user.userId
            }
            if(srcReq.cookies?.session){
                proxyReqOpts.headers["x-session-id"]=srcReq.cookies.session
            }
            proxyReqOpts.headers["x-internal-api-key"] = process.env.INTERNAL_SERVICE_API_KEY || ""
            return proxyReqOpts

          } 
        }

    )
}
