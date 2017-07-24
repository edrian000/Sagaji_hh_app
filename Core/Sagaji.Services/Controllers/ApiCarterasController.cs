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

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiCarterasController : ApiControllerWithHub<DashboardHub>
    {
        Entities db = new Entities();

        public async Task<IEnumerable<string>> Get(string login)
        {
            if (string.IsNullOrEmpty(login))
            {
                return null;
            }
            var query = string.Format(@" SELECT rtrim(C2) FROM KDCARTERAS WHERE C1 = '{0}' order by rtrim(C2) ", login);

            List<string> carteras = await db.Database.SqlQuery<string>(query).ToListAsync();

            //List<CarteraCliente> carteraClientes = new List<CarteraCliente>();

            //foreach (var item in carteras)
            //{
            //    CarteraCliente cc = new CarteraCliente
            //    {
            //        Cartera = item,
            //        Clientes = await db.KDUD.Select(k => new ClienteModel
            //        {
            //            Cartera = k.C12,
            //            NoCliente = k.C2,
            //            Nombre = k.C3,
            //            Rfc = k.C10,
            //            DomFiscal = k.C4.Trim() + " " + k.C5.Trim() + " " + k.C6.Trim() + "" + k.C27.Trim() + k.C52,
            //            Telefono = k.C7,
            //            Credito = k.C15.ToString()

            //        }).ToListAsync()
            //    };
            //    carteraClientes.Add(cc);
            //}

            Hub.Clients.All.broadcastOperation(string.Format("Consulta Usuario:{0} Carteras: {1}",
                        login,
                        carteras.Count));

            return carteras;
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
