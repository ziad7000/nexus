const { ProblemError } = require('./problemDetails');

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const invalidParams = result.error.errors.map((err) => ({
        name: err.path.join('.'),
        reason: err.message
      }));

      return next(
        new ProblemError({
          status: 422,
          title: 'Unprocessable Entity',
          detail: 'Request payload failed schema validation',
          type: 'https://api.giu-nexus.com/errors/validation-error',
          code: 'VALIDATION_FAILED',
          invalidParams
        })
      );
    }

    req[source] = result.data;
    next();
  };
};

module.exports = validate;
