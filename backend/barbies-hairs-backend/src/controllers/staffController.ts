// src/controllers/staffController.ts
import { Request, Response } from 'express';
import Staff from '../models/staffModels.js';

export const createStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : err });
  }
};

export const getStaff = async (_: Request, res: Response) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : err });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : err });
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : err });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : err });
  }
};
