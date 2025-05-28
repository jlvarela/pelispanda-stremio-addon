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

/**
 * Searches for records in the PelisPanda's catalog by a search term using the PelisPanda API and filters results to
 * only include movies in the result.
 *
 * @param {string} searchTerm - The term to search for
 * @param {number} postsPerPage - Number of posts per page
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} - Promise that resolves to the filtered API response
 */
function searchMovies(searchTerm, postsPerPage, page = 1) {
    const MOVIE_TYPE = "pelicula";

    return new Promise((resolve, reject) => {
        const url = `https://pelispanda.org/wp-json/wpreact/v1/search?query=${encodeURIComponent(searchTerm)}&posts_per_page=${postsPerPage}&page=${page}`;
        console.log(`Searching movies with term "${searchTerm}" from ${url}`);

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

                    // Since this endpoint searches from the whole catalog, including movies and series, we need to
                    // filter results to only include movies (type == "pelicula")
                    if (parsedData.results && Array.isArray(parsedData.results)) {
                        parsedData.results = parsedData.results.filter(item => item.type === MOVIE_TYPE);

                        resolve({
                            movies: parsedData.results,
                            total: parsedData.total,
                            pages: parsedData.pages
                        });
                    }

                    resolve({});
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Error searching movies: ${error.message}`));
        });
    });
}

module.exports = {
    fetchMoviesCatalog,
    searchMovies
};
