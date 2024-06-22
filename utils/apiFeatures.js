// const User = require('../models/userModel')

class ApiFeatures {
    constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery;
      this.queryString = queryString;
    }
  
    filter() {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      const queryStringObj = { ...this.queryString };
      const excludesFields = ['page', 'sort', 'limit', 'fields'];
      excludesFields.forEach((field) => delete queryStringObj[field]);
      // Apply filtration using [gte, gt, lte, lt]
       let queryStr = JSON.stringify(queryStringObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);
    if (parsedQuery['groups.name']) {
      this.mongooseQuery = this.mongooseQuery.find({ 'groups.name': parsedQuery['groups.name'] });
      delete parsedQuery['groups.name'];
    }

     this.mongooseQuery = this.mongooseQuery.find(parsedQuery);
      return this;
    }

    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
      } else {
        this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.mongooseQuery = this.mongooseQuery.select(fields);
      } else {
        this.mongooseQuery = this.mongooseQuery.select('-__v');
      }
      return this;
    }
  
    search(modelName) {
      // التحقق من وجود نموذج صحيح
      let query = {};
    
      if (!modelName ) {
        return this;
      }
      // التحقق من وجود كلمة مفتاحية
      if (this.queryString.keyword) {
        const keyword = this.queryString.keyword.toLowerCase();
        const keywordRegex = new RegExp(keyword, 'i');
        if (modelName === 'Order') {
          // const editedByUserIds = await User.distinct('_id', { name: { $regex: keywordRegex } });

          // const historyQuery = {
          //   'history.editedBy': { $in: editedByUserIds }
          // };

// query.$or.push(historyQuery);
          query.$or = [
            { type1: { $regex: keywordRegex }},
            { type2: { $regex: keywordRegex }},
            { type3: { $regex: keywordRegex }},
            { caption: { $regex: keywordRegex }},
            // historyQuery
          ];
          
        } else if (modelName === 'User') {
          query.$or = [
            { name: { $regex: keywordRegex }},
            { userId: { $regex: keywordRegex }},
            { jobTitle: { $regex: keywordRegex }},
            { school: { $regex: keywordRegex }},
          ];
        } else if (modelName === 'wordText') {
          query.$or = [
            { name: { $regex: keywordRegex }},
            { text: { $regex: keywordRegex }},
          ];
        } else {
          query = { name: { $regex: keywordRegex } };
        }
        // استخدام هذا المتغير لحفظ حالة الاستعلام بعد كل تغيير
        const modifiedQuery = this.mongooseQuery;
        
        try {
          // تنفيذ البحث على المتغير المعدل
          this.mongooseQuery = modifiedQuery.find(query);
          
        
        } catch (error) {
          console.error('Error executing query:', error);
        }
        if (this.mongooseQuery.length === 0) {
          return;
        }
      } 

    
      return this;
    }
    
    paginate (countDocuments) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 15;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;
      // eslint-disable-next-line no-undef
   
  
      // Pagination result
      const pagination = {};
      pagination.currentPage = page;
      pagination.limit = limit;
      pagination.numberOfPages = Math.ceil(countDocuments / limit);

      // next page
      if (endIndex < countDocuments) {
        pagination.next = page + 1;
      }
      if (skip > 0) {
        pagination.prev = page - 1;
      }
      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
      this.paginationResult = pagination;
      return this;
    }
    // async paginate(countDocuments) {
    //   const page = this.queryString.page * 1 || 1;
    //   const limit = this.queryString.limit * 1 || 20;
    //   const skip = (page - 1) * limit;
    //   const endIndex = page * limit;
    
    //   // Pagination result
    //   const pagination = {
    //     currentPage: page,
    //     limit,
    //     numberOfPages: Math.ceil(countDocuments / limit),
    //   };
    
    //   const aggregationPipeline = [
    //     {
    //       $group: {
    //         _id: '$State',
    //         count: { $sum: 1 },
    //       },
    //     },
    //   ];
    
    //   const stateCounts = await order.aggregate(aggregationPipeline);
    
    //   const stateMap = new Map();
    //   stateCounts.forEach((state) => {
    //     stateMap.set(state._id, state.count);
    //   });
    
    //   pagination.stateCounts = stateMap;
    
    //   // ... (الكود السابق للتحكم بالـ pagination)
    
    //   return this;
    // }
    
  }
  
  module.exports = ApiFeatures;