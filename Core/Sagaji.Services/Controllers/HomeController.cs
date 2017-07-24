using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Sagaji.Services.Controllers
{
    public class ViewDataUploadFilesResult
    {
        public string Name { get; set; }
        public int Length { get; set; }
    }

    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [System.Web.Http.Authorize()]
        public ActionResult App()
        {
            return View();
        }

        [System.Web.Http.Authorize()]
        public ActionResult Download()
        {
            return View();
        }

        [System.Web.Http.Authorize()]
        public ActionResult Dashboard()
        {
            return View();
        }
    }
}
