using Sagaji.Services.Hubs;
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
using System.Web.Http.Cors;
using System.Web.Http.Description;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiClientesController : ApiControllerWithHub<DashboardHub>
    {
        Entities db = new Entities();


        private  List<DomicilioModel> GetDomicilios(string NoCliente)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append(" SELECT RTRIM(k2.C2) Id, RTRIM(K1.C2) NoCliente,REPLACE( RTRIM(k2.C3) + ' ' + RTRIM(k2.C4) + ' ' + RTRIM(k2.C5), ',', ' ')  DomEntrega ");
            builder.Append(string.Format(" FROM  KDUD k1, KDUDENT k2 WHERE k1.C2 = k2.C1 and rtrim(K1.C2) = '{0}' ORDER BY RTRIM(k2.C2)", NoCliente));

            string query = builder.ToString();

            List<DomicilioModel> domicilios =   db.Database.SqlQuery<DomicilioModel>(query).ToList();

            return domicilios;
        }

        public async Task<IEnumerable<ClienteModel>> Get(string idCartera, int? page)
        {

            StringBuilder builder = new StringBuilder();

            builder.Append("SELECT RTRIM(k1.C12)  Cartera, RTRIM(K1.C2) NoCliente, RTRIM(k1.C3) Nombre, RTRIM(k1.C10) RFC, RTRIM(k1.C4) + ' ' + RTRIM(k1.C5) + ' ' + RTRIM(k1.C6) + ' ' + RTRIM(k1.C27) + RTRIM(k1.C52) DomFiscal, RTRIM(k1.C7) Telefono, RTRIM(k1.C15) Credito");
            builder.Append(string.Format(" FROM  KDUD k1 WHERE RTRIM(k1.C12) = '{0}' ORDER BY RTRIM(k1.C12); ", idCartera));

            string query = builder.ToString();

            var clientes = await db.Database.SqlQuery<ClienteModel>(query).ToListAsync();

            if (clientes.Count > 0)
            {
                clientes = clientes.Select(x => new ClienteModel
                {
                    NoCliente = x.NoCliente,
                    Cartera = x.Cartera,
                    DomFiscal = x.DomFiscal,
                    Credito = x.Credito,
                    Nombre = x.Nombre,
                    Rfc = x.Rfc,
                    Telefono = x.Telefono,
                    Domicilios =   GetDomicilios(x.NoCliente)

                }).ToList();
            }

            Hub.Clients.All.broadcastOperation(string.Format("Consulta Cartera:{0} Clientes: {1}",
                        idCartera,
                        clientes.Count));


            return clientes;
        }

        //private async Task<List<CarritoModel>> GetCarrito(string NoCliente)
        //{
        //    StringBuilder builder = new StringBuilder();

        //    builder.Append(string.Format("SELECT KDTEMPEDIDOHH.C2 NoCliente, KDTEMPEDIDOHH.C7 CvProducto, KDTEMPEDIDOHH.C9 Descripcion, KDTEMPEDIDOHH.C8 Piezas, KDII.C11 Unidad, KDII.C20 Moneda, KDII.C15 PrecioUnitario, KDTEMPEDIDOHH.C8*KDII.C15 AS Total "));
        //    builder.Append(string.Format(" FROM KDTEMPEDIDOHH "));
        //    builder.Append(string.Format("INNER JOIN KDII ON KDII.C1 = KDTEMPEDIDOHH.C7 "));
        //    builder.Append(string.Format("WHERE KDTEMPEDIDOHH.C2 = '{0}' ", NoCliente));


        //    string query = builder.ToString();

        //    List<CarritoModel> carrito = null;

        //    try
        //    {
        //        carrito = await db.Database.SqlQuery<CarritoModel>(query).ToListAsync();
        //    }
        //    catch (Exception ex)
        //    {
        //        System.Diagnostics.Trace.TraceError(ex.Message);
        //    }

        //    return carrito;

        //}

        [ResponseType(typeof(ClienteModel))]
        public async Task<IHttpActionResult> Get(string id)
        {
            var model = await db.KDUD.FirstOrDefaultAsync(k => k.C2 == id);

            if (model == null)
            {
                return NotFound();
            }

            ClienteModel client = new ClienteModel
            {
                Cartera = model.C12,
                NoCliente = model.C2,
                Nombre = model.C3,
                Rfc = model.C10,
                DomFiscal = model.C4.Trim() + " " + model.C5.Trim() + " " + model.C6.Trim() + "" + model.C27.Trim() + model.C52,
                Telefono = model.C7,
                Credito = model.C15.ToString(),
                //Carrito = GetCarrito(id).Result,
            };


            return Ok(client);
        }

        private List<CompraRapidaModel> GetCompras(string id)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append(string.Format("KDII.C1 CODIGO,"));
            builder.Append(string.Format("KDII.C2 DESCRIPCION,"));
            builder.Append(string.Format(" KDII.C15 PRECIO,"));
            builder.Append(string.Format("KDII.C11 UNIDAD,"));
            builder.Append(string.Format("DBO.F_EXISTENCIA(KDII.C1,1)  MEXICO,"));
            builder.Append(string.Format("DBO.F_EXISTENCIA(KDII.C1,14) LEON,"));
            builder.Append(string.Format("DBO.F_EXISTENCIA(KDII.C1,27) PUEBLA,"));
            builder.Append(string.Format("DBO.F_EXISTENCIA(KDII.C1,40) TUXTLA,"));
            builder.Append(string.Format("DBO.F_EXISTENCIA(KDII.C1,53) OAXACA,"));
            builder.Append(string.Format("DBOKDIG.C2 LINEA "));
            builder.Append(string.Format("FROM KDIG, KDII"));
            builder.Append(string.Format("WHERE  KDIG.C1=KDII.C3 AND KDII.C1 = '0' ", id));

            string query = builder.ToString();

            List<CompraRapidaModel> compras = null;
            //db.Database.SqlQuery<CompraRapidaModel>(query)
            //.ToList();

            return compras;
        }

        private List<PedidoModel> GetPedidos(string id)
        {
            List<PedidoModel> pedidos = null;
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
