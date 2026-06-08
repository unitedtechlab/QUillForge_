export const verifyadmin = (req,res,next) => {
       console.log("USER:", req.user);
    console.log("ROLE:", req.user?.role);
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