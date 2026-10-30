import JournalEntry from '../models/JournalEntry.js';

// @desc    Get all journal entries for logged-in user with search & filters
// @route   GET /api/entries
// @access  Private
export const getEntries = async (req, res, next) => {
  try {
    const { search, mood, tag, favorite, startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (mood && mood !== 'all') {
      query.mood = mood;
    }

    if (tag && tag !== 'all') {
      query.tags = tag.toLowerCase().trim();
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) {
        query.entryDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.entryDate.$lte = end;
      }
    }

    const entries = await JournalEntry.find(query).sort({ entryDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single journal entry
// @route   GET /api/entries/:id
// @access  Private
export const getEntryById = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    // Strict Authorization check
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this journal entry',
      });
    }

    res.json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new journal entry
// @route   POST /api/entries
// @access  Private
export const createEntry = async (req, res, next) => {
  try {
    const {
      title,
      content,
      mood,
      tags,
      entryDate,
      imageUrl,
      sticker,
      paperStyle,
      weather,
      isFavorite,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for your entry',
      });
    }

    // Clean tags array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const entry = await JournalEntry.create({
      user: req.user._id,
      title,
      content,
      mood: mood || 'peaceful',
      tags: processedTags,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      imageUrl: imageUrl || '',
      sticker: sticker || 'sunflower',
      paperStyle: paperStyle || 'grid',
      weather: weather || 'sunny',
      isFavorite: Boolean(isFavorite),
    });

    res.status(201).json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a journal entry
// @route   PUT /api/entries/:id
// @access  Private
export const updateEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    // Strict Authorization check
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this journal entry',
      });
    }

    const {
      title,
      content,
      mood,
      tags,
      entryDate,
      imageUrl,
      sticker,
      paperStyle,
      weather,
      isFavorite,
    } = req.body;

    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (mood !== undefined) entry.mood = mood;
    if (entryDate !== undefined) entry.entryDate = new Date(entryDate);
    if (imageUrl !== undefined) entry.imageUrl = imageUrl;
    if (sticker !== undefined) entry.sticker = sticker;
    if (paperStyle !== undefined) entry.paperStyle = paperStyle;
    if (weather !== undefined) entry.weather = weather;
    if (isFavorite !== undefined) entry.isFavorite = Boolean(isFavorite);

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        entry.tags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof tags === 'string') {
        entry.tags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    const updatedEntry = await entry.save();

    res.json({
      success: true,
      entry: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/entries/:id
// @access  Private
export const deleteEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found',
      });
    }

    // Strict Authorization check
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this journal entry',
      });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      message: 'Journal entry removed successfully ♡',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's distinct tags
// @route   GET /api/entries/tags
// @access  Private
export const getJournalTags = async (req, res, next) => {
  try {
    const tags = await JournalEntry.distinct('tags', { user: req.user._id });
    res.json({
      success: true,
      tags: tags.sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal stats & mood summary
// @route   GET /api/entries/stats
// @access  Private
export const getJournalStats = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id }).sort({ entryDate: -1 });

    const total = entries.length;
    const moodCounts = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    res.json({
      success: true,
      total,
      moodCounts,
    });
  } catch (error) {
    next(error);
  }
};
