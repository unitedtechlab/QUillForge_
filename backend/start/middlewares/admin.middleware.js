export const verifyadmin = (req,res,next) => {
    if(!req.user ){
         console.log("REQ.USER =", req.user);
        return res.status(401).json({
            success: false,
            message: "unauthenticated"
        });
    }
    if(req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "you not the admin dude ! "
        });


    }
    next();
}