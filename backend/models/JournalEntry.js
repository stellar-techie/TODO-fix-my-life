import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please give your entry a title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please write your thoughts in the journal content'],
    },
    mood: {
      type: String,
      enum: ['happy', 'peaceful', 'productive', 'reflective', 'cozy', 'loved', 'tired', 'anxious', 'grateful', 'creative'],
      default: 'peaceful',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    sticker: {
      type: String,
      default: 'sunflower', // 'sunflower', 'daisy', 'tulip', 'star', 'sparkle', 'cup', 'heart', 'ribbon'
    },
    paperStyle: {
      type: String,
      enum: ['grid', 'lined', 'plain', 'dots'],
      default: 'grid',
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'breezy', 'starlit', 'rainbow'],
      default: 'sunny',
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user entry searches and sorting
journalEntrySchema.index({ user: 1, entryDate: -1 });

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;
