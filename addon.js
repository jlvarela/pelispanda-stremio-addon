const { addonBuilder } = require("stremio-addon-sdk")
const { fetchMoviesCatalog, searchMovies} = require("./pelis-panda-api")

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
	if (type === "movie" && id === "pp-alarum-codigo-letal") {
		const streams = [
			{
				infoHash: "721f3952439b05597b41adfdf140b07644738bb2",
				name: "WEB-DL 1080p",
				description: "Alarum.Codigo.Letal.2025.WEB-DL.1080p-Dual-Lat",
				sources: [
					"tracker:udp://tracker.openbittorrent.com:80/announce",
					"tracker:udp://tracker.opentrackr.org:1337/announce",
					"tracker:udp://open.demonii.com:1337/announce",
					"tracker:udp://explodie.org:6969/announce",
					"tracker:http://share.camoe.cn:8080/announce",
					"tracker:udp://tracker.torrent.eu.org:451/announce",
					"tracker:http://t.nyaatracker.com/:80announce",
					"tracker:udp://thetracker.org:80/announce",
					"tracker:udp://bt.xxx-tracker.com:2710/announce",
					"tracker:udp://tracker.vanitycore.co:6969/announce",
					"tracker:http://tracker.tfile.me:80/announce",
					"tracker:udp://tracker.tiny-vps.com:6969/announce",
					"tracker:http://retracker.telecom.by:80/announce",
					"tracker:http://tracker.electro-torrent.pl:80/announce",
					"tracker:udp://tracker.justseed.it:1337/announce",
					"tracker:udp://tracker.leechers-paradise.org:6969/announce",
					"tracker:udp://tracker.coppersurfer.tk:6969/announce",
					"tracker:udp://open.stealth.si:80/announce",
					"tracker:http://retracker.mgts.by:80/announce",
					"tracker:udp://tracker.cypherpunks.ru:6969/announce",
					"tracker:udp://tracker.cyberia.is:6969/announce",
					"tracker:udp://retracker.lanta-net.ru:2710/announce",
					"tracker:udp://tracker.internetwarriors.net:1337/announce",
					"tracker:udp://tracker.swateam.org.uk:2710/announce"
				]

			}
		]
		return Promise.resolve({ streams: streams })
	}

	return Promise.resolve({ streams: [] })
})

module.exports = builder.getInterface()
