import { Schema, model, Document } from "mongoose";

export interface ISeason extends Document {
  name: string;         
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const SeasonSchema = new Schema<ISeason>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false }
});

export const Season = model<ISeason>("Season", SeasonSchema);
