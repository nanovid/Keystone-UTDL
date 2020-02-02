// Modules to run html server
const express = require("express");
const app = express();
const path = require("path");

const fs = require("fs");

const port = 3000;

// Extract and parse data from webpage
const bodyParser = require("body-parser");

// Express module setup
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Dropbox Setup
var fetch = require("isomorphic-fetch");
var Dropbox = require("dropbox").Dropbox;
var dbx = new Dropbox({
	accessToken:
		"BqD0eu8yhmAAAAAAAAABehsR2iWQXmzgo37lhqkDK998--ChPVO0tasTf_cn301a",
	fetch: fetch
});

// dbx
//   .filesListFolder({ path: "" })
//   .then(function(response) {
//     console.log(response);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });

function uploadData(inData, ejsFile, res) {
	dbx.filesDownload({ path: "/data.json" })
		.then(function(response) {
			var data = JSON.parse(response.fileBinary);
			data.package_providers.push(inData.provider);
			data.package_ids.push(inData.id);
			data.package_names.push(inData.name);
			var dataString = JSON.stringify(data);

			dbx.filesUpload({
				path: "/data.json",
				contents: dataString,
				mode: "overwrite"
			})
				.then(function(response) {
					res.render(ejsFile, {
						data: data
					});
				})
				.catch(function(error) {
					console.log(error);
				});
		})
		.catch(function(error) {
			console.log(error);
		});
}

function pullDataRender(ejsFile, res) {
	var data = {};
	dbx.filesDownload({ path: "/data.json" })
		.then(function(response) {
			data = JSON.parse(response.fileBinary);

			res.render(ejsFile, {
				data: data
			});
		})
		.catch(function(error) {
			console.log(error);
		});
}

function openDoor(isOpen, ejsFile, res) {
	dbx.filesDownload({ path: "/data.json" })
		.then(function(response) {
			var data = JSON.parse(response.fileBinary);
			data.open = isOpen;
			var dataString = JSON.stringify(data);

			dbx.filesUpload({
				path: "/data.json",
				contents: dataString,
				mode: "overwrite"
			})
				.then(function(response) {
					res.render(ejsFile, {
                        open: isOpen
                    });
				})
				.catch(function(error) {
					console.log(error);
				});
		})
		.catch(function(error) {
			console.log(error);
		});
}

app.get("/", function(req, res) {
	openDoor(false, "index.ejs", res);
});

app.post("/open", function(req, res) {
    openDoor(true, "index.ejs", res);
});

app.post("/close", function(req, res) {
	openDoor(false, "index.ejs", res);
});

app.get("/view", function(req, res) {
	pullDataRender("current-orders.ejs", res);
});

app.get("/add", function(req, res) {
	res.render("add-order.ejs");
});

app.post("/view", function(req, res) {
	var provider = req.body.provider;
	var tracking = req.body.tracking;
	var package = req.body.package;

	var inData = {
		provider: provider,
		id: tracking,
		name: package
	};

	uploadData(inData, "current-orders.ejs", res);
});

app.get("/login", function(req, res) {
	res.render("login.ejs");
});

app.listen(port, () => console.log(`Listening on port ${port}`));
