var Song = function(data) {
	return {
		song: data.body,
		date: data.date_created
	}
}

var client = require('twilio')('AC98eb705703556ad95bc5cf7e4b1cbc8b', 'a198863452f1e840159ff4f102556c7f');

exports.setup = function(app) {

	app.get('/new_number', function(request, result) {
		var country = request.query.country;
		var phone_numbers = [];
		client.availablePhoneNumbers(country).local.list({ sms_enabled: true }, function(err, numbers) {
			if (numbers["available_phone_numbers"].length > 0) {
				var phoneNumber = numbers["available_phone_numbers"][0];
				request.cookies.account.phone = phoneNumber;
				if (request.cookies.account) {
					var name = request.cookies.account.name;
					var sid = request.cookies.account.sid;
					result.cookie("account", { name: name, sid: sid, phone: phoneNumber });
					result.send("Account created!");
				} else {
					result.send("Improper cookies! Create an account first.");
				}
			} else {
				result.send("Out of phone numbers!");
			}
		});

	});

	app.get('/new_account', function(request, result) {
		var name = request.query.name;
		var country = request.query.country;
		client.accounts.create({
			"friendlyName": name
		}, function(err, account) {
			result.cookie("account", { name: name, sid: account.sid });	
			result.redirect('/new_number?country=' + country);
		});
	});

	app.get('/party/:id', function(request, result) {
		var phoneNumber = request.params.id;
		result.cookie("phone", { number: phoneNumber });

		result.send("Cookie set!");
	});

	app.get('/test', function(request, result) {
		//Send an SMS text message
		client.sendMessage({

		    to:'8602519172', // Any number Twilio can deliver to
		    from: '+15087624751', // A number you bought from Twilio and can use for outbound communication
		    body: 'heyyyyyyy.' // body of the SMS message

		}, function(err, responseData) { //this function is executed when a response is received from Twilio

		    if (!err) { // "err" is an error received during the request, if any

		        // "responseData" is a JavaScript object containing data received from Twilio.
		        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
		        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

		        console.log(responseData.from); // outputs "+14506667788"
		        console.log(responseData.body); // outputs "word to your mother."

		    }
		});

		result.send("HEY");
	});

	app.post('/text', function(request, results) {
		var text = request.body;
		var song = text.Body;
		console.log("Requested song: " + song);
	});

	app.get('/texts', function(request, results) {
		var messages = client.messages.list(function(err, data) {
			var songs = [];
			data.messages.forEach(function(msg) {
				songs.push(new Song(msg));	
			});
			results.jsonp(songs);
		});
	});

	app.get('/list', function(request, result) {
		client.accounts.list({ status: "active" }, function(err, data) {
			result.send(data.accounts);
		});

	});
}
