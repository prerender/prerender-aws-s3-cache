const AWS = require('aws-sdk');
const s3 = new AWS.S3({params: {Bucket: process.env.S3_BUCKET_NAME}});

module.exports = {
  requestReceived: function(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    s3.getObject({Key: this.getCacheKey(req)}, (err, result) => {
      if (!err && result) {
        const freshness = process.env.S3_CACHE_FRESHNESS || 604800000;
        const now = Date.now();
        const lastModified = result.LastModified.getTime();
        if ((now - lastModified) < freshness) {
          return res.send(200, result.Body);
        }
      }

      next();
    });
  },

  pageLoaded: function(req, res, next) {
    if(req.prerender.statusCode !== 200) {
      return next();
    }

    const s3Options = {
      Key: this.getCacheKey(req),
      ContentType: 'text/html;charset=UTF-8',
      StorageClass: 'REDUCED_REDUNDANCY',
      Body: req.prerender.content
    }

    s3.putObject(s3Options, (err, result) => {
      if (err) console.error(err);
      next();
    });
  },

  getCacheKey: function(req) {
    let key = req.prerender.url;
    if (req.prerender.width) {
      key = `${key}-width-${req.prerender.width}`;
    }
    if (process.env.S3_PREFIX_KEY) {
      key = `${process.env.S3_PREFIX_KEY}/${key}`;
    }
    return key;
  },
};
