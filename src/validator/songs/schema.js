const Joi = require('joi');
const currentYear = new Date().getFullYear();

const SongPayloadSchema = Joi.object({
  title: Joi.string().max(50).required(),
  year: Joi.number().min(1900).max(currentYear).required(),
  genre: Joi.string().max(12).required(),
  performer: Joi.string().max(35).required(),
  duration: Joi.number(),
  albumId: Joi.string().max(50),
});
module.exports = { SongPayloadSchema };
