"use strict";

const _ = require("lodash");
const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const User = require("../models/user.model");
const CacheCleaner = require("../mixins/cache.cleaner.mixin");
const Fakerator = require("fakerator");
const fake = new Fakerator();
/*
const bcrypt = require("bcrypt");
function hashPassword(password) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, function (error, salt) {
			if (error) {
				return reject(error);
			}

			bcrypt.hash(password, salt, function (error, hashedPassword) {
				if (error) {
					return reject(error);
				}

				resolve(hashedPassword);
			});
		});
	});
}*/

module.exports = {
	name: "users",
	mixins: [DbService, CacheCleaner(["users"])],
	adapter: new MongooseAdapter(process.env.MONGO_URI || "mongodb://localhost/moleculer-blog"),
	model: User,

	settings: {
		fields: ["_id", "username", "fullName", "email", "avatar", "author"]
	},

	actions: {
		authors: {
			cache: true,
			handler(ctx) {
				return this.adapter.find({ query: { author: true }});
			}
		}
	},

	methods: {
		seedDB() {
			this.logger.info("Seed Users DB...");
			// Create authors
			return Promise.resolve()
				.then(() => this.adapter.insert({
					username: "john",
					password: "john1234",
					fullName: "John Doe",
					email: "john.doe@blog.moleculer.services",
					avatar: fake.internet.avatar(),
					author: true,
				}))
				.then(() => this.adapter.insert({
					username: "jane",
					password: "jane1234",
					fullName: "Jane Doe",
					email: "jane.doe@blog.moleculer.services",
					avatar: fake.internet.avatar(),
					author: true
				}))

				// Create fake commenter users
				.then(() => this.adapter.insertMany(_.times(30, () => {
					let fakeUser = fake.entity.user();
					return {
						username: fakeUser.userName,
						password: fakeUser.password,
						fullName: fakeUser.firstName + " " + fakeUser.lastName,
						email: fakeUser.email,
						avatar: fakeUser.avatar,
						author: false
					};
				})))
				.then(users => {
					this.logger.info(`Generated ${users.length} users!`);
					this.clearCache();
				});
		}
	},

	afterConnected() {
		return this.adapter.count().then(count => {
			if (count == 0) {
				this.seedDB();
			}
		});
	}

};
