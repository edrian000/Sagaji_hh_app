using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace Sagaji.Services.Controllers
{

    [Authorize]
    [RoutePrefix("api/Adviser")]
    public class ApiAdviserController : ApiController
    {
        private MobileAppEntities db = new MobileAppEntities();

        [Route("User")]
        public async Task<UserAppModel> Get(string id)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append("SELECT DISTINCT ");
            builder.Append("	LOWER(RTRIM(C1)) UserLogin,");
            builder.Append("	RTRIM(C2) UserPassword, ");
            builder.Append("	RTRIM(C3) FullName, ");
            builder.Append("	RTRIM(C4) UserEmail,");
            builder.Append("	CASE WHEN C5 <> '' THEN RTRIM(C5) ELSE 'A' END Perfil ");
            builder.Append(" FROM KIUSRS  ");
            builder.Append(string.Format(" WHERE C1 <> '' AND C3 IS NOT NULL AND LOWER(RTRIM(C4)) = '{0}' ", id.ToLower()));
            builder.Append("ORDER BY LOWER(RTRIM(C1));");

            string query = builder.ToString();

            UserAppModel user = null;

            try
            {
                using (KEPLEREntities kepler = new KEPLEREntities())
                {
                    user = await kepler.Database.SqlQuery<UserAppModel>(query).FirstOrDefaultAsync();
                }
                
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError(ex.Message);
            }

            return user;
        }

        [Route("Pedidos")]
        public async Task<IEnumerable<RequestPedidoModel>> GetPedidos(string id)
        {
            List<RequestPedidoModel> pedidos = await db.pedidoapp.Where(x => x.usuariologin == id)
                .Select(x => new RequestPedidoModel
                {
                    CvePedido = x.cvepedido,
                    Cliente = new ClienteModel { NoCliente = x.nocliente },
                    FechaCaptura = x.fecharegistro,
                    Observaciones = x.observaciones,
                    Iva = x.iva,
                    SubTotal = x.subtotal,
                    Total = x.total,
                    Partidas = db.itempedido.Where(y => y.cvepedido == x.cvepedido).Select(y => new PedidoModel
                    {
                        Codigo = y.codigo,
                        Cantidad = y.cantidad,
                        Descripcion = y.descripcion,
                        Linea = y.linea,
                        Precio = y.precio,
                        Unidad = y.unidad,
                    }).ToList()

                }).ToListAsync();

            if(pedidos.Count > 0)
            {
                pedidos = pedidos.OrderByDescending(x => x.FechaCaptura).ToList();
            }

            return pedidos;
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
