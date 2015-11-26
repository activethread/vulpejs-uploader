vulpejs.plugins.uploader = true;

module.exports = function(router) {
  // UPLOADER
  var upload = {
    options: {
      tmpDir: vulpejs.app.uploader[vulpejs.app.env].dir.tmp,
      uploadDir: vulpejs.app.uploader[vulpejs.app.env].dir.files,
      uploadUrl: '/uploaded/files/',
      copyImgAsThumb: true,
      imageVersions: {
        maxWidth: 200
      },
      accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
      },
      storage: {
        type: 'local'
      }
    },
    dir: function(req, callback) {
      if (req.params.dir) {
        upload.options.uploadDir = req.params.dir.indexOf('/') !== -1 ? req.params.dir : vulpejs.app.uploader[vulpejs.app.env].dir.files + '/' + req.params.dir;
        uploader = require('blueimp-file-upload-expressjs')(upload.options);
        callback();
      } else {
        callback();
      }
    },
    fix: function(req, obj) {
      if (obj.files) {
        obj.files.forEach(function(file) {
          delete file.options;
          if (req.params.dir) {
            file.url = file.url.replace('/uploaded/files/', '/uploaded/files/' + req.params.dir + '/');
            file.deleteUrl += '/' + req.params.dir;
            if (file.thumbnailUrl) {
              file.thumbnailUrl = file.thumbnailUrl.replace('/uploaded/files/', '/uploaded/files/' + req.params.dir + '/');
            }
          }
        });
      }
      return obj;
    }
  };
  var uploader = require('blueimp-file-upload-expressjs')(upload.options);
  router.get('/upload/:dir?', function(req, res) {
    upload.dir(req, function() {
      uploader.get(req, res, function(error, obj) {
        if (!error) {
          res.json(upload.fix(req, obj));
        }
      });
    });
  });

  router.post('/upload/:dir?', function(req, res) {
    upload.dir(req, function() {
      uploader.post(req, res, function(error, obj, redirect) {
        if (!error) {
          res.json(upload.fix(req, obj));
        }
      });
    });
  });

  router.delete('/uploaded/files/:name/:dir?', function(req, res) {
    upload.dir(req, function() {
      if (req.params.dir) {
        req.url = req.url.replace('/' + req.params.dir, '');
      }
      uploader.delete(req, res, function(error, obj) {
        if (!error) {
          res.json(obj);
        }
      });
    });
  });
};