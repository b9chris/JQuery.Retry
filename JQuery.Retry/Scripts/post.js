/// <reference path="jquery-1.9.1.js"/>
/// <reference path="json3.js"/>

// Helper methods for posting to the server, especially an ASP.Net MVC server

function post(url, data) {
	/// <summary>Post to the server using querystring form POST format, so an object like { a: 1, b: 's' } gets sent as a
	/// request body like a=1&b=s</summary>
	/// <param name="url" type="String">URL</param>
	/// <param name="data" type="Object">Querystring parameters to POST to server</param>
	/// <returns>An AJAX Deferred object.</returns>
	return $.ajax({
		url: url,
		data: data,
		type: 'POST',
		dataType: 'json'
	});
}

function postJson(url, data) {
	/// <summary>Post to the server using JSON POST format, so an object like { a: 1, b: 's' } gets sent as a request body like
	/// data={"a":1,"b":"s"} Essential for sending nested or complex objects to the server.</summary>
	/// <param name="url" type="String">URL</param>
	/// <param name="data" type="Object">Object to POST to server as JSON</param>
	/// <returns>An AJAX Deferred object.</returns>
	return $.ajax({
		url: url,

		/*
		Help for usage with ASP.Net MVC:

		MVC method must take exactly one argument of type that supports an empty constructor
		Stringified here with the internal/shim external JSON library before passing to jquery
		rather than delegating to jquery.

		Should NOT use this format:
		{
		  vm: { ... }
		}

		where method is
		public JsonResult Submit(ViewModel vm) { ...

		This can cause ASP.Net to become confused and treat the vm property as the root object to
		pass as a value for the vm argument to the Controller Action, and because everything in
		the object tree is now off by one descendant, the rest of the deserialization ends up
		filling everything with nulls, 0s and empty lists.

		If this fails the ViewModel is failing to map properly to what's being passed to it -
		try building a ViewModel specific to the input. Dates often cause problems. Pass them
		as strings.
		*/
		data: JSON.stringify(data),
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json; charset=utf-8'
	});
}
