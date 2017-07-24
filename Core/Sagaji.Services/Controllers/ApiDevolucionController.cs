using Microsoft.AspNet.SignalR;
using Sagaji.Services.Hubs;
using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Devoluciones")]
    public class ApiDevolucionController : ApiControllerWithHub<DashboardHub>
    {
        private MobileAppEntities db = new MobileAppEntities();

        [Route("Facturas")]
        public async Task<IEnumerable<FacturaModel>> Get(DateTime? filterDate)
        {
            List<FacturaModel> facturas = null;
            StringBuilder builder = new StringBuilder();
            builder.Append("");
            builder.Append("");
            builder.Append("");

            string query = builder.ToString();

            try
            {
                facturas = await db.Database.SqlQuery<FacturaModel>(query).ToListAsync();
            }
            catch (Exception ex)
            {
                Hub.Clients.All.broadcastErrorMessage(ex.Message);
            }

            return facturas;
        }

        [Route("SyncNotaCredito")]
        [ResponseType(typeof(TransactionResponse))]
        public async Task<IHttpActionResult> Post(NotaCredito model)
        {
            TransactionResponse response = new TransactionResponse
            {
                Status = EnumStatus.TransactionWithFail,
                Message = "Falla en la transacción"
            };

            StringBuilder builder = new StringBuilder();
            builder.Append("");
            builder.Append("");
            builder.Append("");

            string query = builder.ToString();

            if (model == null)
            {
                return BadRequest("Requerimiento invalido!");
            }

            try
            {
                await db.Database.ExecuteSqlCommandAsync(query);
            }
            catch (Exception ex)
            {
                Hub.Clients.All.broadcastErrorMessage(ex.Message);
            }

            return Ok(response);
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
