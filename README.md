JQuery.Retry
============

Simple AJAX Retry functionality for JQuery.

JQuery provides some basic helper functions for AJAX like $.post() and $.ajax(). When throwing a project together I frequently would use a helper function like this:

	function post(url, data, success, error) {
		return $.ajax({
			url: url,
			data: data,
			type: 'POST',
			dataType: 'json',
            success: success,
            error: error
		});
	}

And call it like:

    post('/test', { id: 3 }, function(r) {
        status.text('Hooray!');
    }, function(a,b,c) {
        status.text('We lose.');
    }

Which is convenient for posting to the server, and a little more resilient than many of the jquery helper methods like $.post() that have only a success argument, but it still doesn't really do what it should - which is retry in case the user's internet connection just flaked out for a moment.

It also happens to not use jQuery's Promises/Deferred objects, which can make things a little more flexible.

Thus, this library - it lets you easily add retry functionality and still respond to successes and failures effectively.

Here's an example using one of the included convenience methods, retryPost():

	retryPost('/user/profile', { username: 'Joe' }, 4)
	.done(function(r) {
		// Do something to show the user's profile data
	})
	.failWillRetry(function(a,b,c) {
		// Tell the user their internet connection flaked out but we'll try again
	})
	.fail(function(a,b,c) {
		// Tell the user the internet's dead or the server's dead.
	});

So if jQuery Deferred objects are new to you, retryPost returns one, and it has methods .done() and .fail(), and the function you pass in will get called back depending on how things resolve. The Ajax Deferred object is extended to support an extra .failWillRetry() so you can respond to temporary connection failures, by recording the connection error message so you can log it later or telling the user.

The 4 argument is the number of times to retry. By default  the first call goes out right away; if it fails the next call is at 100ms, and the time rises exponentially, so 200ms, 400ms, etc (this is called exponential backoff).

The a,b,c arguments to the callbacks to fail and failWillRetry are the standard jQuery arguments passed back when an AJAX call fails; unfortunately what they actually contain can vary depending on the nature of the error:

http://api.jquery.com/jQuery.ajax/

If you need to fetch multiple things from the server, this encapsulation of retry functionality is especially resilient and clean:

	retryPost('/user/profile', null, 4)
	.fail(function(a,b,c) {
		log(a,b,c);
		status.text("Sorry, couldn't load your profile.");
	})
	.done(function(profile) {
		renderProfile(profile);

		if (!profile.hasOrders)
			return;

		retryPost('/user/orders', { id: profile.id }, 4)
		.fail(function(a,b,c) {
			log(a,b,c);
		})
		.done(function(orders) {
			renderOrders(orders);
		});
	})

In some applications you might actually be waiting for something to happen - for example, if you're using an Eventually Consistent data store on the backend and the user just added an item to a list you're now trying to load, you may need to wait until the item shows up - retries both simplify this and protect against flaky net connections:

	retryPostJson('/user/orders', { id: profile.id, key: order.key }, 10, {
		validateResult: function(r) {
			return r && r.containsKey;
		}
	})
	.done(function(r) {
		renderList(r);
	});

This time we passed in a config object for the last object with a validateResult function. validateResult fires when the server returns an HTTP 200, which would normally be treated as a success and call .done(). You can inspect the value, and return false if you want to continue retrying. In this case we're sending the client's order key (probably a GUID) to the server so the server can gather a list of orders and verify the order with this key is in the list. If it's not, we had a success, but we want to keep waiting until the order shows up in the system, then load the list.


## Project Format and Layout ##

I'm used to coding in an ASP.Net environment so the examples here are in ASP.Net, and commented with Visual Studio Intellisense vsdoc format.

You'll need jquery-1.9.1, and if you're going to be posting JSON in IE6-8, json3.js. The 2 core files of the library are retry.js and post.js, located in the Scripts folder.