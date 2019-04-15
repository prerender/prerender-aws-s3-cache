const AWS = require('aws-sdk')
const zlib = require('zlib')

var s3Options = {
	params: { Bucket: process.env.S3_BUCKET_NAME },
}

if (process.env.S3_ENDPOINT) {
	s3Options.endpoint = new AWS.Endpoint(process.env.S3_ENDPOINT)
}

const s3 = new AWS.S3(s3Options);

module.exports = {

	requestReceived: function (req, res, next) {
		if (!['HEAD', 'GET'].includes(req.method)) {
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
				const ifModifiedSince = new Date(req.headers['if-modified-since']);
				const lastModified = new Date(result['LastModified']);

				if ('LastModified' in result) {
					res.setHeader('Last-Modified', lastModified.toUTCString());
				}

				if (ifModifiedSince &&
					lastModified &&
					ifModifiedSince < Date.now() &&
					lastModified < ifModifiedSince) {

					res.send(304);
					return
				}

				if (result['ContentEncoding'] === 'gzip') {
					zlib.gunzip(result.Body, (gzip_err, gzip_res) => {
						if (gzip_err) console.log(gzip.err)
						res.send(200, gzip_res)
					})
					return
				}

				res.send(200, result.Body)
			}

			next();
		});
	},

	pageLoaded: function (req, res, next) {
		if (req.prerender.statusCode !== 200) {
			next()
			return
		}

		var key = req.prerender.url;

		if (process.env.S3_PREFIX_KEY) {
			key = process.env.S3_PREFIX_KEY + '/' + key;
		}

		var putObjectParams = {
			Key: key,
			ContentType: 'text/html;charset=UTF-8',
			Body: req.prerender.content
		}

		const putObject = function (params) {
			s3.putObject(params, function (err, _) {

				if (err) console.error(err);

				next();
			});
		}

		if (['yes', 'true'].includes(process.env.S3_ENABLE_COMPRESSION)) {
			putObjectParams.ContentEncoding = 'gzip'
			zlib.gzip(putObjectParams.Body, (gzip_err, gzip_res) => {
				if (gzip_err) console.error(gzip_err)
				putObjectParams.Body = gzip_res
				putObject(putObjectParams)
			})
			return
		}

		putObject(putObjectParams)
	}
};
