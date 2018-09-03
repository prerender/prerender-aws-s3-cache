Prerender S3 Cache plugin
===========================

This is a plugin meant to be used with your Prerender server to cache responses in Amazon S3.

Run this from within your Prerender server directory:

```bash
$ npm install prerender-s3-cache --save
```
##### server.js
```js
const prerender = require('prerender');
const server = prerender();

server.use(require('prerender-s3-cache'))

server.start();
```
##### Test it:
```bash
curl http://localhost:3000/render?url=https://www.example.com/
```
A `GET` request will check S3 for a cached copy. If a cached copy is found, it will return that. Otherwise, it will make the request to your server and then persist the HTML to the S3 cache.

A `POST` request will skip the S3 cache. It will make a request to your server and then persist the HTML to the S3 cache. The `POST` is meant to update the cache.

You'll need to sign up with Amazon Web Services and export these 3 environment variables.

```
$ export AWS_ACCESS_KEY_ID=<aws access key>
$ export AWS_SECRET_ACCESS_KEY=<aws secret access key>
$ export S3_BUCKET_NAME=<bucket name>
```

Warning! Your keys should be kept private and you'll be charged for all files uploaded to S3.

> If Prerender is hosted on a EC2 instance, you can also take advantage of [IAM instance roles](http://aws.typepad.com/aws/2012/06/iam-roles-for-ec2-instances-simplified-secure-access-to-aws-service-apis-from-ec2.html)
so that you don't need to export your AWS credentials.

> You can also export the S3_PREFIX_KEY variable so that the key (which is by default the complete requested URL) is
prefixed. This is useful if you want to organize the snapshots in the same bucket.

## Options

#### REGION
By default, s3HtmlCache works with the US Standard region (East), if your bucket is localized in another region you can config it with an environment variable : `AWS_REGION`.

```
$ export AWS_REGION=<region name>
```

For example :

```
$ export AWS_REGION=eu-west-1
```

#### S3_PREFIX_KEY
Allows you to prefix your keys if you want all of your snapshots to live in a specific folder inside your S3 bucket

`export S3_PREFIX_KEY=prerender`

default: none

## License

The MIT License (MIT)

Copyright (c) 2018 Todd Hooper &lt;todd@prerender.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
