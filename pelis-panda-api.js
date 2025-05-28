const https = require('https');

/**
 * Fetches movies catalog from the PelisPanda API
 *
 * @param {number} postsPerPage - Number of posts per page
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} - Promise that resolves to the API response
 */
function fetchMoviesCatalog(postsPerPage, page = 1) {
    return new Promise((resolve, reject) => {
        const url = `https://pelispanda.org/wp-json/wpreact/v1/movies?posts_per_page=${postsPerPage}&page=${page}`;
        console.log(`Fetching data from ${url}`);
        
        https.get(url, (res) => {
            let data = '';
            
            // A chunk of data has been received
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            // The whole response has been received
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Error fetching data: ${error.message}`));
        });
    });
}

module.exports = {
    fetchMoviesCatalog: fetchMoviesCatalog
};