const { addonBuilder } = require("stremio-addon-sdk")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.pelispanda",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "top"
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

builder.defineCatalogHandler(({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
	return Promise.resolve({ metas: [
		{
			id: "pp-alarum-codigo-letal",
			type: "movie",
			name: "Alarum: Código Letal",
			poster: "https://image.tmdb.org/t/p/original//qSOMdbZ6AOdHR999HWwVAh6ALFI.jpg"
		}
	] })
})

builder.defineStreamHandler(({type, id}) => {
	console.log("request for streams: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	if (type === "movie" && id === "pp-alarum-codigo-letal") {
		const streams = [
			{
				infoHash: "721f3952439b05597b41adfdf140b07644738bb2",
				name: "WEB-DL 1080p",
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