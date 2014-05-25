"use strict";

var Snoocore = require('../Snoocore')
, when = require('when')
, delay = require('when/delay')
, open = require('open')
, config = require('./testConfig')
, testServer = require('./server/testServer')
, chai = require('chai')
, chaiAsPromised = require('chai-as-promised');

chai.Should();
chai.use(chaiAsPromised);

/* global describe */
/* global it */
/* global beforeEach */

describe('Snoocore.oauth', function () {

	this.timeout(20000);

	var snoocore = new Snoocore({
		userAgent: 'snoocore-test-userAgent',
		browser: false
	});

	// Comply with Reddit's API terms
	function wait() {
		return delay(2000);
	}

	// helper to authenticate
	function auth() {
		return Snoocore.oauth.getAuthData('script', {
			consumerKey: config.reddit.REDDIT_KEY_SCRIPT,
			consumerSecret: config.reddit.REDDIT_SECRET_SCRIPT,
			username: config.reddit.REDDIT_USERNAME,
			password: config.reddit.REDDIT_PASSWORD,
			scope: [ 'identity', 'mysubreddits' ]
		})
		.then(function(authData) {
			return snoocore.auth(authData);
		});
	}

	function openAndAuth(url) {
		console.log('##############################################');
		console.log('Opening the following url in your browser:');
		console.log('\n' + url + '\n');
		console.log('You have thirty seconds...');
		console.log('##############################################');
		open(url);
	}

	describe('# TESTS FOR NON-AUTHENTICATION', function() {

		beforeEach(function() {
			return snoocore.deauth();
		});

		it('should get back error 403 when not authenticated', function() {
			return snoocore.api.v1.me().should.be.rejected;
		});

	});

	describe('# TESTS FOR AUTHENTICATION', function() {

		beforeEach(function() {
			return snoocore.deauth();
		});

		it.only('should authenticate with OAuth, and call an oauth endpoint (WEB)', function() {
			// because there is user intervention with these tests, give them
			// two minutes before timing out!
			this.timeout(30000);

			var url = Snoocore.oauth.getAuthUrl({
				consumerKey: config.reddit.REDDIT_KEY_WEB,
				redirectUri: config.reddit.redirectUri,
				state: 'foo'
			});

			openAndAuth(url);

			return testServer.waitForRequest().then(function(params) {

				console.log('params', params); //!!!debug

				var authorizationCode = params.code;
				return Snoocore.oauth.getAuthData('web', {
					consumerKey: config.reddit.REDDIT_KEY_WEB,
					consumerSecret: config.reddit.REDDIT_SECRET_WEB,
					authorizationCode: authorizationCode,
					redirectUri: config.reddit.redirectUri
				})
				.then(function(authData) {
					return snoocore.auth(authData);
				})
				.then(function() {
					return snoocore.api.v1.me();
				})
				.then(function(data) {
					chai.expect(data.error).to.be.undefined;
					data.name.should.be.a('string');
				});
			});

		});

		it('should authenticate with OAuth, and call an oauth endpoint (SCRIPT)', function() {
			// because there is user intervention with these tests, give them
			// two minutes before timing out!
			this.timeout(30000);

			return Snoocore.oauth.getAuthData('script', {
				consumerKey: config.reddit.REDDIT_KEY_SCRIPT,
				consumerSecret: config.reddit.REDDIT_SECRET_SCRIPT,
				username: config.reddit.REDDIT_USERNAME,
				password: config.reddit.REDDIT_PASSWORD
			})
			.then(function(authData) {
				return snoocore.auth(authData);
			})
			.then(function() {
				return snoocore.api.v1.me();
			})
			.then(function(data) {
				chai.expect(data.error).to.be.undefined;
				data.name.should.equal(config.reddit.REDDIT_USERNAME);
			});
		});

		it('should take a promise for authData', function() {
			// because there is user intervention with these tests, give them
			// two minutes before timing out!
			this.timeout(30000);

			var authData = Snoocore.oauth.getAuthData('script', {
				consumerKey: config.reddit.REDDIT_KEY_SCRIPT,
				consumerSecret: config.reddit.REDDIT_SECRET_SCRIPT,
				username: config.reddit.REDDIT_USERNAME,
				password: config.reddit.REDDIT_PASSWORD
			});

			return snoocore.auth(authData).then(function() {
				return snoocore.api.v1.me();
			})
			.then(function(data) {
				chai.expect(data.error).to.be.undefined;
				data.name.should.equal(config.reddit.REDDIT_USERNAME);
			});
		});

	});

	describe('General Reddit API Tests (OAUTH)', function() {

		beforeEach(function() {
			return snoocore.deauth();
		});

		it('should get resources when logged in', function() {
			return wait()
			.then(auth)
			.then(wait)
			.then(snoocore.api.v1.me)
			.then(function(data) {
				data.name.should.equal(config.reddit.REDDIT_USERNAME);
			});
		});

		it('should GET resources when logged in (respect parameters)', function() {
			return wait()
			.then(auth)
			.then(wait)
			.then(function() {
				return snoocore.subreddits.mine.$where({
					$where: 'subscriber',
					limit: 2
				});
			})
			.then(function(result) {
				result.data.children.length.should.equal(2);
			});
		});

	});

});
