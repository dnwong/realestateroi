'use strict';

/**
 * Creates a validation middleware for a joi schema.
 * Validates req.body (POST) or req.query (GET).
 * Returns 400 with field-level errors on validation failure (SECURITY-05).
 *
 * @param {import('joi').Schema} schema
 * @param {'body'|'query'} [source='body']
 */
module.exports = function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    req.validated = value;
    next();
  };
};
