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

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiProductsController : ApiControllerWithHub<DashboardHub>
    {
        private KEPLEREntities db = new KEPLEREntities();

        public async Task<IEnumerable<PedidoModel>> Get()
        {
            StringBuilder builder = new StringBuilder();

            builder.Append(string.Format("SELECT RTRIM(KDII.C1) CODIGO,"));
            builder.Append(string.Format(" RTRIM(KDII.C2) DESCRIPCION,"));
            builder.Append(string.Format(" KDII.C15 PRECIO,"));
            builder.Append(string.Format(" KDII.C11 UNIDAD,"));
            builder.Append(string.Format(" NULL  MEXICO,"));
            builder.Append(string.Format(" NULL LEON,"));
            builder.Append(string.Format(" NULL PUEBLA,"));
            builder.Append(string.Format(" NULL TUXTLA,"));
            builder.Append(string.Format(" NULL OAXACA,"));
            builder.Append(string.Format(" RTRIM(KDIG.C2) LINEA, "));
            builder.Append(string.Format(" 0 Cantidad "));
            builder.Append(string.Format(" FROM KDIG, KDII"));
            builder.Append(string.Format(" WHERE  KDIG.C1=KDII.C3 AND KDII.C2 <> '' "));

            string query = builder.ToString();

            List<PedidoModel> products = await db.Database.SqlQuery<PedidoModel>(query).ToListAsync();

            return products;
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
