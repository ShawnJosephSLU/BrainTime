import { Request, Response } from 'express';
import Group from '../models/Group';
import Quiz from '../models/Quiz';
import User from '../models/User';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Create a new group
 * @route POST /api/groups/create
 * @access Private - Creator, Admin
 */
export const createGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      res.status(400).json({ message: 'Group name is required' });
      return;
    }
    
    // Generate a unique enrollment code (6 characters)
    const enrollmentCode = nanoid(6).toUpperCase();
    
    const newGroup = new Group({
      name,
      description: description || '',
      creatorId: req.user.id,
      enrollmentCode,
      students: [],
      exams: [],
    });
    
    await newGroup.save();
    
    res.status(201).json({
      _id: newGroup._id,
      name: newGroup.name,
      description: newGroup.description,
      enrollmentCode: newGroup.enrollmentCode,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

/**
 * Get all groups created by the logged-in creator
 * @route GET /api/groups/creator
 * @access Private - Creator, Admin
 */
export const getCreatorGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const groups = await Group.find({ creatorId: req.user.id })
      .populate('students', 'email')
      .populate('exams', 'title');
    
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching creator groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

/**
 * Get a group by ID
 * @route GET /api/groups/:groupId
 * @access Private - All authenticated users
 */
export const getGroupById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId)
      .populate('students', 'email')
      .populate('exams', 'title description startTime endTime duration isLive');
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is authorized (creator or member)
    const isCreator = group.creatorId.toString() === req.user.id;
    const isMember = group.students.some(student => student._id.toString() === req.user.id);
    
    if (!isCreator && !isMember && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to view this group' });
      return;
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Failed to fetch group' });
  }
};

/**
 * Update a group
 * @route PUT /api/groups/:groupId
 * @access Private - Creator, Admin
 */
export const updateGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is authorized (creator or admin)
    if (group.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this group' });
      return;
    }
    
    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    await group.save();
    
    res.status(200).json({
      _id: group._id,
      name: group.name,
      description: group.description,
      enrollmentCode: group.enrollmentCode,
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Failed to update group' });
  }
};

/**
 * Delete a group
 * @route DELETE /api/groups/:groupId
 * @access Private - Creator, Admin
 */
export const deleteGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId);
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is authorized (creator or admin)
    if (group.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this group' });
      return;
    }
    
    await Group.deleteOne({ _id: groupId });
    
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Failed to delete group' });
  }
};

/**
 * Enroll a student in a group using enrollment code
 * @route POST /api/groups/enroll
 * @access Private - Student
 */
export const enrollInGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Debug logs
    console.log('=== Enroll In Group Debug Info ===');
    console.log('Request user:', req.user);
    console.log('Auth header:', req.headers.authorization);
    console.log('User role:', req.user.role);
    
    const { enrollmentCode } = req.body;
    console.log('Enrollment code received:', enrollmentCode);
    
    if (!enrollmentCode) {
      console.log('Error: No enrollment code provided');
      res.status(400).json({ message: 'Enrollment code is required' });
      return;
    }
    
    // Extra validation to ensure user.id exists
    if (!req.user || !req.user.id) {
      console.error('Error: Missing user ID in request');
      res.status(401).json({ message: 'Authentication required. Missing user ID.' });
      return;
    }
    
    const group = await Group.findOne({ enrollmentCode });
    
    if (!group) {
      console.log('Error: Invalid enrollment code - no matching group found');
      res.status(404).json({ message: 'Invalid enrollment code' });
      return;
    }
    
    console.log('Group found:', {
      id: group._id,
      name: group.name,
      creatorId: group.creatorId,
      studentCount: group.students.length
    });
    
    // Try/catch for ObjectId conversion
    let userId;
    try {
      // Convert user ID to ObjectId for matching in the database
      userId = new mongoose.Types.ObjectId(req.user.id);
      console.log('Student ID (ObjectId):', userId);
    } catch (idError) {
      console.error('Error converting user ID to ObjectId:', idError);
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }
    
    const isAlreadyEnrolled = group.students.some(id => id.equals(userId));
    console.log('Student already enrolled?', isAlreadyEnrolled);
    
    if (isAlreadyEnrolled) {
      console.log('Error: Student already enrolled in this group');
      res.status(400).json({ message: 'Already enrolled in this group' });
      return;
    }
    
    // Add student to group
    group.students.push(userId);
    await group.save();
    
    console.log('Student successfully enrolled. Updated student count:', group.students.length);
    
    res.status(200).json({
      message: 'Successfully enrolled in group',
      groupName: group.name,
      groupId: group._id,
    });
  } catch (error) {
    console.error('Error enrolling in group:', error);
    res.status(500).json({ message: 'Failed to enroll in group' });
  }
};

/**
 * Get all groups that a student is enrolled in
 * @route GET /api/groups/student
 * @access Private - Student
 */
export const getStudentGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: 'Authentication required' });
      return;
    }
    
    console.log('Student ID:', req.user.id);
    
    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }
    
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    
    // Wrap the main database query in another try/catch to isolate errors
    try {
      // Find groups where this user is in the students array
      const groups = await Group.find({ students: userObjectId })
        .populate('creatorId', 'email')
        .populate({
          path: 'exams',
          select: 'title description startTime endTime duration isLive',
          // Removed the match condition to show all exams, will filter on the client side
          // match: {
          //   isLive: true,
          //   startTime: { $lte: new Date() },
          //   endTime: { $gte: new Date() },
          // },
        });
      
      console.log('Groups found:', groups.length);
      if (groups.length > 0) {
        console.log('First group:', {
          id: groups[0]._id,
          name: groups[0].name,
          studentCount: groups[0].students.length,
          examCount: groups[0].exams.length
        });
      }
      
      res.status(200).json(groups);
    } catch (queryError: any) {
      console.error('Error during database query:', queryError);
      res.status(500).json({ 
        message: 'Database query failed', 
        error: queryError.message || 'Unknown database error' 
      });
      return;
    }
  } catch (error) {
    console.error('Error fetching student groups:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

/**
 * Assign an exam to a group
 * @route POST /api/groups/:groupId/assign-exam/:examId
 * @access Private - Creator, Admin
 */
export const assignExamToGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId, examId } = req.params;
    
    // Debug logs
    console.log('=== Assign Exam Debug Info ===');
    console.log('Request user:', req.user);
    console.log('Auth header:', req.headers.authorization);
    console.log('GroupId:', groupId);
    console.log('ExamId:', examId);
    
    const group = await Group.findById(groupId);
    if (!group) {
      console.log('Group not found');
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    console.log('Group creator ID:', group.creatorId);
    console.log('Group creator ID (string):', group.creatorId.toString());
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    
    // Check if user is authorized (creator or admin)
    // Convert both IDs to strings for reliable comparison
    const creatorIdStr = group.creatorId.toString();
    const userIdStr = req.user.id.toString();
    
    console.log('Comparing IDs as strings:');
    console.log('- Creator ID:', creatorIdStr);
    console.log('- User ID:', userIdStr);
    console.log('- Equal?', creatorIdStr === userIdStr);
    console.log('- User is admin?', req.user.role === 'admin');
    
    if (creatorIdStr !== userIdStr && req.user.role !== 'admin') {
      console.log('Authorization failed - Not the creator or admin');
      res.status(403).json({ message: 'Not authorized to update this group' });
      return;
    }
    
    const exam = await Quiz.findById(examId);
    if (!exam) {
      res.status(404).json({ message: 'Exam not found' });
      return;
    }
    
    // Check if exam is already assigned to the group
    const examObjectId = new mongoose.Types.ObjectId(examId);
    const isExamAlreadyAssigned = group.exams.some(id => id.equals(examObjectId));
    if (isExamAlreadyAssigned) {
      res.status(400).json({ message: 'Exam already assigned to this group' });
      return;
    }
    
    // Add exam to group's exams array
    group.exams.push(examObjectId);
    await group.save();
    
    // Add group to exam's groups array if it's not already there
    // Ensure groups array exists
    if (!exam.groups) {
      exam.groups = [];
    }
    
    // Check if group is already in the exam's groups array
    // Use string comparison for consistency
    const hasGroup = exam.groups.some((id: any) => id.toString() === groupId.toString());
    if (!hasGroup) {
      // Add the group ID as a string to avoid type issues
      exam.groups.push(groupId);
      await exam.save();
    }
    
    console.log('Exam assigned successfully');
    res.status(200).json({ message: 'Exam assigned to group successfully' });
  } catch (error) {
    console.error('Error assigning exam to group:', error);
    res.status(500).json({ message: 'Failed to assign exam to group' });
  }
};

/**
 * Remove an exam from a group
 * @route DELETE /api/groups/:groupId/remove-exam/:examId
 * @access Private - Creator, Admin
 */
export const removeExamFromGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId, examId } = req.params;
    
    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is authorized (creator or admin)
    if (group.creatorId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this group' });
      return;
    }
    
    // Remove exam from group's exams array
    const examObjectId = new mongoose.Types.ObjectId(examId);
    group.exams = group.exams.filter(id => !id.equals(examObjectId));
    await group.save();
    
    // Also remove group from exam's groups array
    await Quiz.updateOne(
      { _id: examId },
      { $pull: { groups: groupId } }
    );
    
    res.status(200).json({ message: 'Exam removed from group successfully' });
  } catch (error) {
    console.error('Error removing exam from group:', error);
    res.status(500).json({ message: 'Failed to remove exam from group' });
  }
};

/**
 * Test endpoint to verify authentication is working
 * @route GET /api/groups/test-auth
 * @access Private - Any authenticated user
 */
export const testAuth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('=== Test Auth Debug Info ===');
    console.log('Request headers:', req.headers);
    console.log('User object:', req.user);
    
    // Send back the user information for verification
    res.status(200).json({ 
      message: 'Authentication working', 
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      rawHeaders: {
        authorization: req.headers.authorization ? 'Present' : 'Missing'
      }
    });
  } catch (error) {
    console.error('Error in test auth endpoint:', error);
    res.status(500).json({ message: 'Error in test endpoint' });
  }
}; 