using Sagaji.Services.Hubs;
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
using System.Web.Http.Description;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiSagajiLoginController : ApiControllerWithHub<DashboardHub>
    {
        private KEPLEREntities db = new KEPLEREntities();

        [ResponseType(typeof(UserAppModel))]
        public async Task<IHttpActionResult> Post(UserAppModel model)
        {
            if(model == null)
            {
                return BadRequest();
            }

            if (string.IsNullOrEmpty(model.UserLogin))
            {
                return BadRequest();
            }

            if (string.IsNullOrEmpty(model.UserPassword))
            {
                return BadRequest();
            }

            var user = await db.KIUSRS.FirstOrDefaultAsync(k=>k.C1.ToLower() == model.UserLogin.ToLower() && k.C2 == model.UserPassword);

            if(user == null)
            {
                return NotFound();
            }

            model.UserEmail = user.C3.ToLower();

            Hub.Clients.All.broadcastAddUser(model);
            Hub.Clients.All.broadcastOperation(string.Format("Acceso Usuario:{0} Correo: {1}",
                        model.UserLogin,
                        model.UserEmail));

            return Ok(model);
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
