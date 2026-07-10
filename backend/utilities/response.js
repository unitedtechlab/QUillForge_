// ============================================================================
// utilities/response.js — STANDARDISED API SUCCESS RESPONSE CLASS
// ----------------------------------------------------------------------------
// Every controller should wrap successful data in an ApiResponse so all JSON
// responses follow the same shape, making the frontend's life predictable.
//
// Usage example (inside any controller):
//   return res.status(200).json(
//     new ApiResponse(200, { user }, "Logged in successfully")
//   );
//
// The resulting JSON body will always look like:
//   { statusCode: 200, data: {...}, message: "...", success: true }
//
// When statusCode >= 400 the success flag flips to false automatically,
// but in practice that case is handled by ApiError — ApiResponse is for 2xx.
// ============================================================================

class ApiResponse {
    constructor(
        statusCode,              // HTTP status code (e.g. 200, 201)
        data,                    // the payload — object, array, or empty {}
        message = "Success"      // human-readable description returned to the client
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // true for 2xx/3xx, false otherwise
    }
}

export { ApiResponse };