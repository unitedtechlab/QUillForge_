// ============================================================================
// utilities/errors.js — STANDARDISED API ERROR CLASS
// ----------------------------------------------------------------------------
// Every controller and middleware that wants to return an HTTP error should
// throw an instance of ApiError instead of writing a raw res.status() call.
// The global error handler in app.js catches it and formats the JSON response.
//
// Usage example (inside any controller):
//   throw new ApiError(404, "Blog post not found");
//
// The asyncHandler wrapper ensures the thrown error propagates to app.js
// without needing individual try/catch blocks in every controller.
//
// HOW IT FLOWS:
//   Controller throws ApiError
//        ↓
//   asyncHandler catches it via Promise.catch
//        ↓
//   Express next(err) is called
//        ↓
//   Global error handler in app.js reads err.statusCode & err.message
//        ↓
//   Sends JSON: { success: false, message: "...", statusCode: 4xx/5xx }
// ============================================================================

class ApiError extends Error {
    constructor(
        statusCode,          // HTTP status code to send to the client (e.g. 400, 401, 404, 500)
        message = "Something went wrong"  // human-readable error message returned in the JSON body
    ) {
        super(message);      // sets this.message via the native Error class

        this.statusCode = statusCode;  // attached so the global error handler can read it
        this.success = false;          // always false for errors — mirrors ApiResponse.success shape
    }
}

export { ApiError };