// ============================================================================
// middlewares/admin.middleware.js — ADMIN ROLE GUARD
// ----------------------------------------------------------------------------
// A second-layer middleware that runs AFTER verifyjwt. By the time this runs,
// req.user is already populated (verifyjwt did that). This middleware simply
// checks that the authenticated user is an admin and rejects anyone who isn't.
//
// USAGE IN ROUTES (user.routes.js / blog.routes.js):
//   router.delete("/users/:id", verifyjwt, verifyadmin, deleteUser);
//   router.get("/admin/stats",  verifyjwt, verifyadmin, getAdminStats);
//
// MIDDLEWARE CHAIN ORDER:
//   Request → verifyjwt (checks JWT, sets req.user) → verifyadmin (checks role) → Controller
//
// WHY A SEPARATE MIDDLEWARE?
//   Keeps role-checking logic out of controllers. Any route that needs admin
//   access just adds `verifyadmin` to its chain — no if-statements in controllers.
// ============================================================================

export const verifyadmin = (req, res, next) => {

    // This guard normally shouldn't trigger because verifyjwt runs before this,
    // but serves as a safety net if verifyadmin is accidentally used alone.
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "unauthenticated"
        });
    }

    // Check the role field stored on the user document (set in user.model.js).
    // Only "admin" role passes — "user" and "pro" receive a 403 Forbidden.
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "you not the admin! "
        });
    }

    next(); // role confirmed — pass control to the next middleware or controller
}