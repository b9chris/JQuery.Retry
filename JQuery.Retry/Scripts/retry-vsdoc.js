/// <reference path="retry.js"/>

function RetryAjaxDeferred() {
	/// <summary>Returned from retryAjax. A jQuery Ajax Deferred object extended to support failWillRetry()</summary>

	this.done = function (success) {
		/// <summary>A callback when the Ajax call succeeds.</summary>
		/// <param name="success" type="Function">Success callback</param>
	}

	this.fail = function (error) {
		/// <summary>A callback when the Ajax call fails permanently.</summary>
		/// <param name="error" type="Function">Fail callback</param>
	}

	this.failWillRetry = function (willRetry) {
		/// <summary>A callback when the Ajax call fails with retries pending.</summary>
		/// <param name="willRetry" type="Function">Fail callback</param>
	}
};
