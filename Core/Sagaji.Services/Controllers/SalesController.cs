using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Sagaji.Services.Controllers
{
    public class SalesController : Controller
    {
        // GET: Sales
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Adviser(string id)
        {
            return View();
        }
    }
}