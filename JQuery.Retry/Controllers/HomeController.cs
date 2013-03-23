using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;


namespace JQuery.Retry.Controllers
{
	public class HomeController : Controller
	{
		protected static Random random = new Random();

		// GET: /
		public ViewResult Index()
		{
			return View();
		}

		[HttpPost]
		public JsonResult Test()
		{
			Thread.Sleep(500);

			if (random.NextDouble() > .8d)
				return Json(new { message = "success" });

			return Json(null);
		}
	}
}
