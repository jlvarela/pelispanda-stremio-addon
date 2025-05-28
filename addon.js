const { addonBuilder } = require("stremio-addon-sdk")
const { fetchMoviesCatalog, searchMovies, getMovieDetails } = require("./pelis-panda-api")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.pelispanda",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "top",
			extra: [
				{
					name: "search",
					isRequired: false
				}
			]
		}
	],
	"resources": [
		"catalog",
		"stream"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "pelispanda",
	"description": "Fetch the catalog from PelisPanda website"
}
const builder = new addonBuilder(manifest)

const POST_PER_PAGE = 100;
const DEFAULT_PAGE_NUMBER = 1;

builder.defineCatalogHandler(({type, id, extra}) => {
	console.log(`requesting catalog: ${type} ${id}. Extra: ${JSON.stringify(extra)}`)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md

	// Default values for pagination
	// skip value will be a multiple of 100; if return is less than 100 items, Stremio will consider this to be the
	// end of the catalog.
	const page = extra.skip !== undefined ? Number(extra.skip) / POST_PER_PAGE + 1 : DEFAULT_PAGE_NUMBER;

	if(extra.search !== undefined) {
		return searchMovies(extra.search, POST_PER_PAGE, page)
			.then(data => {
				// Map the movies to the required format
				const metas = data.movies.map(movie => ({
					id: movie.slug,
					type: "movie",
					name: movie.title,
					poster: movie.featured
				}));

				return { metas };
			})
			.catch(error => {
				console.error("Error searching movies:", error);
				return { metas: [] };
			});
	}

	return fetchMoviesCatalog(POST_PER_PAGE, page)
		.then(data => {
			// Map the movies to the required format
			const metas = data.movies.map(movie => ({
				id: movie.slug,
				type: "movie",
				name: movie.title,
				poster: movie.featured
			}));

			return { metas };
		})
		.catch(error => {
			console.error("Error fetching movies:", error);
			return { metas: [] };
		});
})

builder.defineStreamHandler(({type, id}) => {
	console.log("request for streams: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	if (type === "movie") {
		return getMovieDetails(id)
			.then(movieDetails => {
				// Check if movie has downloads
				if (!movieDetails.downloads || !Array.isArray(movieDetails.downloads) || movieDetails.downloads.length === 0) {
					console.log(`No downloads found for movie: ${id}`);
					return { streams: [] };
				}

				// Convert downloads to Stremio streams format
				const streams = movieDetails.downloads.map(download => {
					// Extract infoHash from magnet link
					// Magnet links have format: magnet:?xt=urn:btih:INFOHASH&...
					const infoHashMatch = download.download_link.match(/magnet:\?xt=urn:btih:([^&]+)/i);
					const infoHash = infoHashMatch ? infoHashMatch[1].toLowerCase() : null;

					// Extract trackers from magnet link
					const trackerMatches = download.download_link.match(/tr=([^&]+)/g);
					const sources = trackerMatches 
						? trackerMatches
							.map(tracker => decodeURIComponent(tracker.substring(3)))
							.filter(tracker => tracker.startsWith('udp://') || tracker.startsWith('http://'))
							.map(tracker => `tracker:${tracker}`)
						: [];

					// Create stream object
					return {
						infoHash: infoHash,
						name: download.quality,
						description: `${movieDetails.title} - ${download.quality} - ${download.language} (${download.size})`,
						sources: sources
					};
				}).filter(stream => stream.infoHash);

				console.log(`Found ${streams.length} streams for movie: ${id}`);

				return { streams };
			})
			.catch(error => {
				console.error(`Error fetching streams for movie ${id}:`, error);
				return { streams: [] };
			});
	}

	return Promise.resolve({ streams: [] })
})

module.exports = builder.getInterface()
