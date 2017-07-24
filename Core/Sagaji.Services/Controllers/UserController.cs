using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Sagaji.Services.Controllers
{
    public class UserController : Controller
    {
        ApplicationDbContext context;

        public UserController()
        {
            context = new ApplicationDbContext();
        }

        [AllowAnonymous]
        // GET: User
        public ActionResult Register()
        {
            ViewBag.Name = new SelectList(context.Roles.ToList(), "Name", "Name");
            return View();
        }
    }
}