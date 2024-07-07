class ApiFeatures {
    constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery;
      this.queryString = queryString;
    }

   search(modelName) {
    if (!modelName) {
      return this;
    }

    let query = {};

    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.toLowerCase();
      const keywordRegex = new RegExp(keyword, 'i');

      if (modelName === 'Order') {
        query.$or = [
          { type1: { $regex: keywordRegex }},
          { type2: { $regex: keywordRegex }},
          { type3: { $regex: keywordRegex }},
          { caption: { $regex: keywordRegex }},
        ];
      } else {
        query = { name: { $regex: keywordRegex } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }

    return this;
   }

    filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ['page', 'sort','keyword','order','limit', 'fields'];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);


    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
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
      } 
      else {
        this.mongooseQuery = this.mongooseQuery.select('-__v');
      }
      return this;
    }

    paginate (countDocuments) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 15;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;
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
    
}
  
  module.exports = ApiFeatures;