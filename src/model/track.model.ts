import mongoose, { Schema } from "mongoose";

export interface ITrack {
  name: string;
  artistName: string[];
  duration: number;
  ISRC: string;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trackSchema: Schema<ITrack> = new Schema({
  name: { type: String, required: true },
  artistName: { type: [String], required: true },
  duration: { type: Number, required: true },
  ISRC: { type: String, required: true },
  releaseDate: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

trackSchema.index({ name: 1, artistName: 1 });

export const Track = mongoose.model<ITrack>("Track", trackSchema);

