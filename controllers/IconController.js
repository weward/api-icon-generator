var jimp = require('jimp');
var _ = require('lodash');
var zip = require('node-zip')();
var fs = require('fs');

module.exports = {
    async process(req, res, next) {
        if (!req.files) {
            res.status(422).json({ msg: 'File is missing.' });
        }
        
        if (req.files.image.mimetype != 'image/png' 
            && req.files.image.mimetype != 'image/jpeg' 
            && req.files.image.mimetype != 'image/jpg' 
            && req.files.image.mimetype != 'image/gif' 
            && req.files.image.mimetype != 'image/tiff'
            && req.files.image.mimetype != 'image/bmp') {
            
            res.status(422).json({ msg: 'File type is not supported.' });
        }

        try {
            // process icon generation
            const image = req.files.image;
            const date = new Date().getTime();
            const rand = _.random(1000, 9999);
            const storageDir = __baseDir + '/uploads';
            const fileStore = date + "_" +rand;
            // store
            await image.mv(storageDir + "/" + fileStore + '/' + image.name);

            await resize(storageDir, fileStore, image.name);
            
            return res.status(200).json({ dir: fileStore });
        } catch(err) {
            next(err);

            return res.status(500).json({ msg: err });
        }
    },

    download(req, res, next) {
        try {
            const dir = req.body.dir;

            // delete upload/file_store
            fs.rmdir(__baseDir + "/uploads/" + dir, function(err) {
                if (err) {
                    return res.status(500).json({ msg: 'An error occurred' });
                }
            });

            // process download
            var file = __baseDir + '/public/'+ dir +'.zip';

            var filename = dir + ".zip";
            var mimetype = 'application/zip';

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);

            var filestream = fs.createReadStream(file);
            
            // handle error
            filestream.on('error', function(err) {
                next(err);
            });

            // delete file after download
            filestream.on('end', function() {
                fs.unlinkSync(__baseDir + "/public/" + dir + ".zip");
            });

            // download
            filestream.pipe(res);
        } catch(err) {
            next(err);
        }
    },
}

async function resize(storage_dir, file_store, image_name) {
    try {
        const sourceDir = storage_dir + "/" + file_store;
        const directoryToZip = storage_dir + "/" + file_store;
        const file = directoryToZip + '/' + image_name;
        const sizes = [
            32,
            57,
            60,
            72,
            76,
            96,
            114,
            120,
            144,
            152,
            180,
            192
        ];
        const splitName = image_name.split(".");
        const imageNameWithoutExt = splitName[0];

        await sizes.forEach(async function(size) {
            let outputFile = sourceDir + "/" + imageNameWithoutExt + "_" + size.toString() + ".png";

            // Read the image.
            const image = await jimp.read(file);

            // Resize the image to width 150 and auto height.
            await image.resize(size, size);

            // Save and overwrite the image
            await image.writeAsync(outputFile);
        });
        
        // This just creates a variable to store the name of the zip file that you want to create
        var zipName = file_store + ".zip"; 

        await setTimeout(function() {
            var someDir = fs.readdirSync(sourceDir);
            // append each file in the directory to the declared folder
            for(var i = 0; i < someDir.length; i++) {
                zip.file(someDir[i], fs.readFileSync(sourceDir+"/"+someDir[i]),{base64:true});
            }

            // generate the zip file data
            var data = zip.generate({ base64:false, compression: 'DEFLATE' });

            // write the data to file
            fs.writeFile(__baseDir + '/public/' + zipName, data, 'binary', function(err) {
                if(err){
                    throw new Error(err);
                }
                // delete uploaded and generated files
                try {
                    for(var i = 0; i < someDir.length; i++) {
                        fs.unlinkSync(sourceDir + "/" + someDir[i]);
                    }
                } catch (deleteErr) {
                    throw new Error(deleteErr);
                }
            });
        }, 2000);
        
    } catch (err) {
        throw new Error(err);
    }
}