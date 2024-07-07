/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
const moment = require('moment-timezone');

class AggregateOperations {
    constructor(req, aggregatePipeline) {
        this.req = req;
        this.aggregatePipeline = aggregatePipeline;
    }

    paginate(documentsCounts) {
    const page = parseInt(this.req.query.page, 10) || 1;
    const limit = parseInt(this.req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Push pagination steps into the aggregation pipeline
    this.aggregatePipeline.push(
        { $skip: skip },
        { $limit: limit }
    );

    // Define pagination object
    const pagination = {
        currentPage: page,
        limit: limit,
        numberOfPages: Math.ceil(documentsCounts / limit)
    };

    // Set next page if applicable
    if (endIndex < documentsCounts) {
        pagination.next = page + 1;
    }

    // Set previous page if applicable
    if (skip > 0) {
        pagination.prev = page - 1;
    }

    return pagination

    }

    search(modelName) {
        if (!modelName || !this.req.query.keyword) {
            return;
        }

        let query = {};

        const { keyword } = this.req.query;
        const keywordRegex = new RegExp(keyword, 'i');

        if (modelName === 'Order') {
            query.$or = [
                { type1: { $regex: keywordRegex } },
                { type2: { $regex: keywordRegex } },
                { type3: { $regex: keywordRegex } },
                { caption: { $regex: keywordRegex } },
            ];
        } else {
            query = { name: { $regex: keywordRegex } };
        }

        this.aggregatePipeline.push({ $match: query });

    }

    filter() {
        const queryStringObj = { ...this.req.query };

        const excludesFields = ['page', 'sort', 'keyword', 'order', 'limit', 'fields'];
        excludesFields.forEach((field) => delete queryStringObj[field]);

        for (const key in queryStringObj) {
            if (queryStringObj[key] === 'true') {
                queryStringObj[key] = true;
            } else if (queryStringObj[key] === 'false') {
                queryStringObj[key] = false;
            } else if (!isNaN(queryStringObj[key])) {
                queryStringObj[key] = Number(queryStringObj[key]);
            }
        }

        let queryStr = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        const matchStage = { $match: JSON.parse(queryStr) };

        this.aggregatePipeline.push(matchStage);
        
    }

    sort() {
       if (this.req.query.sort) {
        console.log(this.req.query.sort)
            const sortBy = this.req.query.sort.split(',').reduce((acc, field) => {
            const key = field.startsWith('-') ? field.substring(1) : field;
            const order = field.startsWith('-') ? -1 : 1;
            acc[key] = order;
            return acc;
        }, {});

            this.aggregatePipeline.push({ $sort: sortBy });
   
        } else {
            this.aggregatePipeline.push({ $sort: { createdAt: 1 } });

        }
    }

    limitFields() {
        if (this.req.fields) {
            const fields = this.req.fields.split(',').reduce((acc, field) => {
                acc[field] = 1;
                return acc;
            }, {});
            this.aggregatePipeline.push({ $project: fields });
        } else {
            this.aggregatePipeline.push({ $project: { __v: 0 } });
        }

    }

    countOrdersGroup () {
    const orderCountQuery = this.req.query.order === 'asc' ? 1 : -1;
    if (orderCountQuery) {
    this.aggregatePipeline.push(
      {
        $group: {
          _id: "$senderGroupName",
          count: { $sum: 1 },
          totalOrders: { $push: "$$ROOT" }
        }
      },
      { $sort: { count: orderCountQuery } },
      {
        $unwind: "$totalOrders" 
      },
      { $replaceRoot: { newRoot: "$totalOrders" } }, 
      { $sort: { orderField: orderCountQuery } }
  );
}
    }

    addTimeSinceLastRefresh() {
          const currentTimeInBaghdad = moment.tz('Asia/Baghdad').toDate();

    const timeSinceLastRefreshStage = {
        $addFields: {
            timeSinceLastRefresh: {
                $let: {
                    vars: {
                        lastRefreshTime: { $toDate: "$updatedAt" }, // تحويل updatedAt إلى نوع التاريخ
                        currentTime: currentTimeInBaghdad // الوقت الحالي بتوقيت بغداد
                    },
                    in: {
                        days: { $floor: { $divide: [{ $subtract: ["$$currentTime", "$$lastRefreshTime"] }, 1000 * 60 * 60 * 24] } },
                        hours: { $floor: { $mod: [{ $divide: [{ $subtract: ["$$currentTime", "$$lastRefreshTime"] }, 1000 * 60 * 60] }, 24] } },
                        minutes: { $floor: { $mod: [{ $divide: [{ $subtract: ["$$currentTime", "$$lastRefreshTime"] }, 1000 * 60] }, 60] } },
                        seconds: { $floor: { $mod: [{ $divide: [{ $subtract: ["$$currentTime", "$$lastRefreshTime"] }, 1000] }, 60] } }
                    }
                }
            }
        }
    };

    this.aggregatePipeline.push(timeSinceLastRefreshStage);
  }
}

module.exports = AggregateOperations