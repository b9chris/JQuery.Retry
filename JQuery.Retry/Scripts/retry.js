/// <reference path="jquery-1.9.1.js"/>


// Core method

function retryAjax(load, count, config) {
	/// <summary>
	/// Calls a function passed into the load argument up to count times until the ajax call succeeds.
	///
	/// Expects load to immediately return a standard jQuery AJAX Deferred object so it can call .done and .fail to respond to the
	/// success / failure of the AJAX call.
	///
	/// Uses an extended Deferred object with .failWillRetry() for callbacks when the AJAX call has failed but more retries are
	/// still available. Callback takes the same 3 error callbacks a normal AJAX .fail would take.
	/// </summary>
	/// <param name="load" type="function" value="function({})">A function that performs the AJAX request and returns a jQuery
	/// Ajax Deferred, for example function() { return postJson(...); }</param>
	/// <param name="count" type="Number" optional="true">Optional. Number of times to retry. Uses exponential backoff.</param>
	/// <param name="config" type="Object" optional="true">Optional configuration.
	/// {
	///		validateResult: function(r) { } // Return true if the returned object is valid, false if it should be treated as a failure and retried (if retry count remains)
	/// }
	/// </param>
	/// <returns type="RetryAjaxDeferred">jQuery AJAX Deferred, extended to support .failWillRetry()</returns>
	var config = config || {};
	
	var deferred = new $.Deferred();

	// Extend the Deferred to include a callback for failWillRetry
	var failWillRetries = [];
	deferred.failWillRetry = function (fn) {
		failWillRetries.push(fn);
		return this;
	};

	count = count || 0;
	var backoff = 50;	// Backs off exponentially starting at 2x this value (100ms)

	var validateResult = config.validateResult || function () { return true; };

	function tryAjax() {
		function fail(a, b, c) {
			if (count-- > 0) {
				// Notify any faillWillRetry() callbacks on the Deferred
				$.each(failWillRetries, function (i, fail) {
					fail(a, b, c);
				});

				setTimeout(tryAjax, backoff *= 2);
			} else {
				deferred.reject(a, b, c);
			}
		};

		load().done(function (r) {
			if (validateResult(r))
				deferred.resolve(r);
			else
				fail(r);
		}).fail(fail);
	}

	tryAjax();

	return deferred;
}


// Convenience methods. Depend on post.js.

function retryPost(url, data, count, config) {
	/// <summary>Post to the server using querystring form POST format, so an object like { a: 1, b: 's' } gets sent as a
	/// request body like a=1&amp;b=s</summary>
	/// <param name="url" type="String">URL</param>
	/// <param name="data" type="Object">Querystring parameters to POST to server</param>
	/// <param name="count" type="Number" optional="true">Optional. Number of times to retry. Uses exponential backoff.</param>
	/// <param name="config" type="Object" optional="true">Optional configuration.
	/// {
	///		validateResult: function(r) { } // Return true if the returned object is valid, false if it should be treated as a failure and retried (if retry count remains)
	/// }
	/// </param>
	/// <returns type="RetryAjaxDeferred">jQuery AJAX Deferred, extended to support .failWillRetry()</returns>
	return retryAjax(function() { return post(url, data); }, count, config);
}

function retryPostJson(data, config) {
	/// <summary>Post to the server using JSON POST format, so an object like { a: 1, b: 's' } gets sent as a request body like
	/// data={"a":1,"b":"s"} Essential for sending nested or complex objects to the server.</summary>
	/// <param name="url" type="String">URL</param>
	/// <param name="data" type="Object">Object to POST to server as JSON</param>
	/// <param name="count" type="Number" optional="true">Optional. Number of times to retry. Uses exponential backoff.</param>
	/// <param name="config" type="Object" optional="true">Optional configuration.
	/// {
	///		validateResult: function(r) { } // Return true if the returned object is valid, false if it should be treated as a failure and retried (if retry count remains)
	/// }
	/// </param>
	/// <returns type="RetryAjaxDeferred">jQuery AJAX Deferred, extended to support .failWillRetry()</returns>
	return retryAjax(function() { return postJson(url, data); }, count, config);
}

