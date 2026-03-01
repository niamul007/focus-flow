export const validate = (schema) => (req, res, next) => {
  // We wrap req.body inside an object called 'body' 
  // to match your: z.object({ body: z.object(...) })
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return res.status(400).json({
      status: "error",
      // This will now correctly show: "body.email: Invalid email"
      errors: result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Very Important: Extract the validated body back out
  req.body = result.data.body;
  next();
};