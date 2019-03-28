var s3 = new (require('aws-sdk')).S3({params:{Bucket: process.env.S3_BUCKET_NAME}});

module.exports = {

	requestReceived: function(req, res, next) {
		if(req.method !== 'GET') {
			return next();
		}

		var key = req.prerender.url;

		if (process.env.S3_PREFIX_KEY) {
			key = process.env.S3_PREFIX_KEY + '/' + key;
		}

		s3.getObject({
				Key: key
		}, function (err, result) {

			if (!err && result) {
				return res.send(200, result.Body);
			}

			next();
		});
	},

	pageLoaded: function(req, res, next) {
		if(req.prerender.statusCode !== 200) {
			return next();
		}

		var key = req.prerender.url;
		
		if (process.env.S3_PREFIX_KEY) {
			key = process.env.S3_PREFIX_KEY + '/' + key;
		}

		s3.putObject({
			Key: key,
			ContentType: 'text/html;charset=UTF-8',
			StorageClass: 'REDUCED_REDUNDANCY',
			Body: req.prerender.content
		}, function(err, result) {

			if (err) console.error(err);

			next();
		});
	}
};