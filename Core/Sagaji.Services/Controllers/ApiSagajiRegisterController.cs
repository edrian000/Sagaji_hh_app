using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Sagaji.Services.Controllers

{

    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiSagajiRegisterController : ApiController
    {
        private KEPLEREntities db = new KEPLEREntities();

        public async Task<IHttpActionResult> Post(UserAppModel model)
        {
            var user = await db.KIUSRS.FirstOrDefaultAsync(k => k.C1.ToLower() == model.UserLogin || k.C4.ToLower() == model.UserEmail);

            if (user != null)
            {
                return BadRequest("El usuario ya está regisgrado!");
            }

            user = new KIUSRS
            {
                C1 = model.UserLogin.ToLower(),
                C2 = model.UserPassword,
                C3 = model.FullName,
                C4 = model.UserEmail.ToLower()
            };

            db.KIUSRS.Add(user);

            try
            {
                await db.SaveChangesAsync();

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }

            base.Dispose(disposing);
        }
    }
}
