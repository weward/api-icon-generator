module.exports = {
    async process(req, res, next) {
        try {
            // process icon generation
            
            return res.status(200).json({ dir: '' });
        } catch(err) {
            next(err);
        }
    },

    async download(req, res, next) {
        try {
            const dir = req.body.dir;

            // process download

            return res.status(500).json({ msg: 'Failed to downloadd' });
        } catch(err) {
            next(err);
        }
    }
}