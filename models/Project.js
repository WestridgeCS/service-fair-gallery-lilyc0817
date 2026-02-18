import mongoose from 'mongoose';

const serviceFairSchema = new mongoose.Schema(
  {
    projectName: { 
      type: String, 
      required: true },
    category: {
       type: String, 
       required: true },
    image: { 
      type: String }, // URL to the image
    semester: { type: String }, // e.g., "Fall 2025" "Spring 2026"
    description: { type: String, required: true },
    attendance: [
      {
        studentName: { type: String, required: true },
        checkInTime: { type: Date, default: Date.now }
      }
    ]
}, 
{ timestamps: true });



export const Project = mongoose.model('Project', serviceFairSchema);