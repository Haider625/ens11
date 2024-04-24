/* eslint-disable no-undef */
const asyncHandler = require('express-async-handler');
const groups = require('../models/groupUser')
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')

exports.createGroupUser =   asyncHandler(async (req, res) => {

  if (!req.user.Permission.canCreatGroup) {
    return next(new ApiError('You do not have permission to create an group', 403));
  }
    const group = await groups.create(req.body);
    if (!group) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
      res.status(201).json({ group: group });
});

exports.getGroupUser = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneGroup) {
    return next(new ApiError('You do not have permission to viw this group', 403));
  }

  const { id } = req.params;
  const document = await groups.findById(id);
  if (!document) {
     return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ group: document });
});

exports.getsGroupUser = asyncHandler(async (req, res,next) => {

  if (!req.user.Permission.canViwsGroup) {
    return next(new ApiError('You do not have permission to viws this group', 403));
  }

  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }
  // Build query
  const documentsCounts = await groups.countDocuments();
  const apiFeatures = new ApiFeatures(groups.find(filter), req.query)
  .paginate(documentsCounts)
  .search('Order')
  .limitFields()
  .sort();


  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, group: documents });
});

exports.deleteGroupUser = asyncHandler(async (req, res, next) => {
    
  const { id } = req.params;

  if (!req.user.Permission.canDeletGroup) {
    return next(new ApiError('You do not have permission to delete this group', 403));
  }

  const document = await groups.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

exports.updateGroupUser = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canEidtGroup) {
    return next(new ApiError('You do not have permission to edit this group', 403));
  }

  const document = await groups.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!document) {
    return next(
      new ApiError(`No document for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ group: document });
});

exports.addGroupBetweenLevels = asyncHandler(async (req, res) => {
  const { name, level1, level2, inlevel } = req.body;


  if (!Number.isInteger(Number(level1)) || !Number.isInteger(Number(level2))) {
    throw new ApiError('Invalid integer levels', 400);
  }

  if (Math.abs(Number(level1) - Number(level2)) !== 1) {
    throw new ApiError('Non-consecutive levels', 400);
  }

  const newLevel = Math.trunc((Number(level1) + Number(level2)) / 2);


  await groups.updateMany(
    { level: { $gte: newLevel } }, 
    { $inc: { level: 1 } } 
  );

  const newGroup = await groups.create({ name: name, level: newLevel ,inlevel:inlevel });

  res.status(201).json({ message: 'Group added between levels', newGroup });
});

