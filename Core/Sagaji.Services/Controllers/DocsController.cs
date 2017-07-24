using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Sagaji.Services.Controllers
{
    public class DocsController : Controller
    {
        // GET: Docs
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult UploadFile()
        {
            var httpPostedFile = Request.Files[0];
            if (httpPostedFile != null)
            {

                // Validate the uploaded file if you want like content length(optional)

                // Get the complete file path
                var uploadFilesDir = System.Web.HttpContext.Current.Server.MapPath("~/Content/Media");
                if (!Directory.Exists(uploadFilesDir))
                {
                    Directory.CreateDirectory(uploadFilesDir);
                }
                var fileSavePath = Path.Combine(uploadFilesDir, httpPostedFile.FileName);

                // Save the uploaded file to "UploadedFiles" folder
                httpPostedFile.SaveAs(fileSavePath);

            }

            return Content("Uploaded Successfully");
        }
    }
}