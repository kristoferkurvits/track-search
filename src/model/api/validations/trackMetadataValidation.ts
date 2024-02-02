import Joi from 'joi';

const contributorSchema = Joi.object({
  name: Joi.string().required(),
  ipi: Joi.number().required(),
  roles: Joi.array().items(Joi.string()).required(),
});

const workSchema = Joi.object({
  iswc: Joi.string().required(),
  contributors: Joi.array().items(contributorSchema).required(),
  name: Joi.string().required(),
});

const appleMusicMetadataSchema = Joi.object({
  id: Joi.string().required(),
  link: Joi.string().uri().required(),
  preview: Joi.string().uri().required(),
  artists: Joi.array().items(Joi.object({ id: Joi.string().required() })).required(),
  album: Joi.object({
    id: Joi.string().required(),
    cover: Joi.string().uri().required(),
  }).required(),
});

const deezerMetadataSchema = Joi.object({
  id: Joi.string().required(),
  link: Joi.string().uri().required(),
  artists: Joi.array().items(Joi.object({ id: Joi.number().required() })).required(),
  album: Joi.object({
    id: Joi.number().required(),
    cover: Joi.string().uri().required(),
  }).required(),
});

const youtubeMetadataSchema = Joi.object({
  id: Joi.string().required(),
  link: Joi.string().uri().required(),
  artists: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    link: Joi.string().uri().required(),
  })).required(),
  album: Joi.object({
    id: Joi.string().required(),
    link: Joi.string().uri().required(),
  }).required(),
});

const spotifyMetadataSchema = Joi.object({
  id: Joi.string().required(),
  link: Joi.string().uri().required(),
  preview: Joi.string().uri().required(),
  artists: Joi.array().items(Joi.object({ id: Joi.string().required() })).required(),
  album: Joi.object({
    id: Joi.string().required(),
    cover: Joi.string().uri().required(),
  }).required(),
});

const externalMetadataSchema = Joi.object({
  applemusic: Joi.array().items(appleMusicMetadataSchema).optional(),
  deezer: Joi.array().items(deezerMetadataSchema).optional(),
  youtube: Joi.array().items(youtubeMetadataSchema).optional(),
  spotify: Joi.array().items(spotifyMetadataSchema).optional(),
});

const albumSchema = Joi.object({
  track_count: Joi.number().required(),
  upc: Joi.string().required(),
  release_date: Joi.date().iso().required(),
  label: Joi.string().required(),
  cover: Joi.string().uri().required(),
  covers: Joi.object({
    small: Joi.string().uri().required(),
    medium: Joi.string().uri().required(),
    large: Joi.string().uri().required(),
  }).required(),
});

const artistSchema = Joi.object({
  name: Joi.string().required(),
});

const trackSchema = Joi.object({
  name: Joi.string().required(),
  disc_number: Joi.number().required(),
  track_number: Joi.number().required(),
  isrc: Joi.string().required(),
  genres: Joi.array().items(Joi.string()).required(),
  duration_ms: Joi.number().required(),
  release_date: Joi.date().iso().required(),
  artists: Joi.array().items(artistSchema).required(),
  album: albumSchema.required(),
  external_metadata: externalMetadataSchema.required(),
  type: Joi.string().required(),
  works: Joi.array().items(workSchema).required(),
});

export const trackMetadataResponseSchema = Joi.object({
  data: Joi.array().items(trackSchema).required(),
});
