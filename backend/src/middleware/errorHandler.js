/**
 * Global Express error handler.
 */
export function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err)
  const status = err.status ?? err.statusCode ?? 500
  res.status(status).json({
    error: err.message ?? 'Internal server error',
  })
}
