// routes/userSettings.ts
import { Router } from 'express';
import { UserSettings } from '../models/userSettingsModels.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = Router();

// CREATE user settings
router.post('/', protect, async (req: any, res) => {
  try {
    // Check if user already has settings
    const existing = await UserSettings.findOne({ user: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Settings already exist for this user' });
    }

    // Create new settings
    const newSettings = new UserSettings({
      user: req.user._id,
      ...req.body,
    });

    const saved = await newSettings.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error creating settings', error: err });
  }
});

// GET user settings
router.get('/', protect, async (req: any, res) => {
  try {
    const settings = await UserSettings.findOne({ user: req.user._id });
    if (!settings) {
      return res.status(404).json({ message: 'User settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching settings', error: err });
  }
});

// UPDATE/UPSERT user settings
router.put('/', protect, async (req: any, res) => {
  try {
    const updated = await UserSettings.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating settings', error: err });
  }
});

export default router;
