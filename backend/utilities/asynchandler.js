// ============================================================================
// utilities/asynchandler.js — ASYNC ERROR PROPAGATION WRAPPER
// ----------------------------------------------------------------------------
// Express does NOT automatically forward errors thrown inside async functions
// to the global error handler (app.js). You must call next(err) manually.
// asyncHandler eliminates that boilerplate — wrap any async controller or
// middleware in it and any thrown error (including `throw new ApiError(...)`)
// is automatically forwarded to next(), which routes it to the global handler.
//
// Usage:
//   export const myController = asyncHandler(async (req, res) => {
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) throw new ApiError(404, "Not found");
//     res.json(new ApiResponse(200, blog, "OK"));
//   });
//
// Without this wrapper you would need:
//   try { ... } catch(err) { next(err); }   ← in EVERY single controller
// ============================================================================

const asyncHandler = (requestHandler) => {
    // Returns a standard Express (req, res, next) function.
    return (req, res, next) => {
        Promise
            .resolve(requestHandler(req, res, next)) // run the real handler
            .catch((err) => next(err));              // forward any thrown error to global handler
    };
};

export { asyncHandler };