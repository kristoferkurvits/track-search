import Joi from 'joi';

const contributorSchema = Joi.object({
  name: Joi.string().optional().allow(null),
  ipi: Joi.number().optional().allow(null),
  roles: Joi.array().items(Joi.string().optional().allow(null)).optional().allow(null),
}).unknown(true);

const workSchema = Joi.object({
  iswc: Joi.string().optional().allow(null),
  contributors: Joi.array().items(contributorSchema).optional().allow(null),
  name: Joi.string().optional().allow(null),
}).unknown(true);

const appleMusicMetadataSchema = Joi.object({
  id: Joi.string().optional().allow(null),
  link: Joi.string().uri().optional().allow(null),
  preview: Joi.string().uri().optional().allow(null),
  artists: Joi.array().items(Joi.object({ id: Joi.string().optional().allow(null) }).unknown(true)).optional().allow(null),
  album: Joi.object({
    id: Joi.string().optional().allow(null),
    cover: Joi.string().uri().optional().allow(null),
  }).unknown(true).optional().allow(null),
}).unknown(true);

const deezerMetadataSchema = Joi.object({
  id: Joi.string().optional().allow(null),
  link: Joi.string().uri().optional().allow(null),
  artists: Joi.array().items(Joi.object({ id: Joi.number().optional().allow(null) }).unknown(true)).optional().allow(null),
  album: Joi.object({
    id: Joi.number().optional().allow(null),
    cover: Joi.string().uri().optional().allow(null),
  }).unknown(true).optional().allow(null),
}).unknown(true);

const youtubeMetadataSchema = Joi.object({
  id: Joi.string().optional().allow(null),
  link: Joi.string().uri().optional().allow(null),
  artists: Joi.array().items(Joi.object({
    id: Joi.string().optional().allow(null),
    link: Joi.string().uri().optional().allow(null),
  })).optional().allow(null),
  album: Joi.object({
    id: Joi.string().optional().allow(null),
    link: Joi.string().uri().optional().allow(null),
  }).optional(),
}).unknown(true);

const spotifyMetadataSchema = Joi.object({
  id: Joi.string().optional().allow(null),
  link: Joi.string().uri().optional().allow(null),
  preview: Joi.string().uri().optional().allow(null),
  artists: Joi.array().items(Joi.object({ id: Joi.string().optional().allow(null) }).unknown(true)).optional().allow(null),
  album: Joi.object({
    id: Joi.string().optional().allow(null),
    cover: Joi.string().uri().optional().allow(null),
  }).unknown(true).optional().allow(null),
}).unknown(true);

const externalMetadataSchema = Joi.object({
  applemusic: Joi.array().items(appleMusicMetadataSchema).optional().allow(null),
  deezer: Joi.array().items(deezerMetadataSchema).optional().allow(null),
  youtube: Joi.array().items(youtubeMetadataSchema).optional().allow(null),
  spotify: Joi.array().items(spotifyMetadataSchema).optional().allow(null),
}).unknown(true);

const albumSchema = Joi.object({
  name: Joi.string().optional().allow(null),
  track_count: Joi.number().optional().allow(null),
  upc: Joi.string().optional().allow(null),
  release_date: Joi.date().iso().optional().allow(null),
  label: Joi.string().optional().allow(null),
  cover: Joi.string().uri().optional().allow(null),
  covers: Joi.object({
    small: Joi.string().uri().optional().allow(null),
    medium: Joi.string().uri().optional().allow(null),
    large: Joi.string().uri().optional().allow(null),
  }),
}).unknown(true);

const artistSchema = Joi.object({
  name: Joi.string().optional().allow(null),
}).unknown(true);

const trackSchema = Joi.object({
  name: Joi.string().required(),
  disc_number: Joi.number().optional().allow(null),
  track_number: Joi.number().optional().allow(null),
  isrc: Joi.string().required(),
  genres: Joi.array().items(Joi.any()).optional().allow(null),
  duration_ms: Joi.number().required(),
  release_date: Joi.date().iso().optional().allow(null),
  artists: Joi.array().items(artistSchema).required(),
  album: albumSchema.optional().allow(null),
  external_metadata: externalMetadataSchema.optional().allow(null),
  type: Joi.string().optional().allow(null),
  works: Joi.array().items(workSchema).optional().allow(null),
}).unknown(true);

export const trackMetadataResponseSchema = Joi.object({
  data: Joi.array().items(trackSchema).required(),
}).unknown(true);
