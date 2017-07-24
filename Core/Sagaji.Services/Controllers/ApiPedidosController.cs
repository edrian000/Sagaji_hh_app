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
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Globalization;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Pedidos")]
    public class ApiPedidosController : ApiControllerWithHub<DashboardHub>
    {
        private MobileAppEntities db = new MobileAppEntities();
        private static JobProcessor<RequestPedidoModel, TransactionResponse> _jobProcessor;
        public static JobProcessor<RequestPedidoModel, TransactionResponse> JobProcessor
        {
            get
            {
                if (_jobProcessor == null)
                {
                    System.Diagnostics.Trace.WriteLine("Instanciando JobProcessor...");
                    _jobProcessor = new JobProcessor<RequestPedidoModel, TransactionResponse>(SyncKeplerProcess);
                }
                return _jobProcessor;
            }
        }

        private static TransactionResponse SyncKeplerProcess(RequestPedidoModel request)
        {
            TransactionResponse response = new TransactionResponse
            {
                Status = EnumStatus.TransactionWithFail,
                Message = "Falla en la transacción"
            };

            // Obten contador de cliente y cartera
            long consecutivo = GetCustomerCounts(request.Cliente.NoCliente);
            string asesor = GetAsesor(request.Cliente.NoCliente);
            string clave = request.FechaCaptura.Value.ToString("yyyy/MM/dd:HH:mm:ss");

            System.Diagnostics.Trace.WriteLine(" Insertando en keppler");

            // Inserta en kepler
            try
            {
                InsertInKeppler(request, clave, consecutivo, asesor);
            }
            catch (Exception ex)
            {
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = request.CvePedido,
                    Login = request.UsuarioLogin
                });

                response.Status = EnumStatus.TransactionWithFail;
                response.Message = ex.Message;
                return response;
            }

            // consulta inseción en kepler
            var sumPedido = ConsultaPedidoInKepler(clave, request.UsuarioLogin, consecutivo, asesor, request.Cliente.NoCliente, "3");

            if (sumPedido != null)
            {
                System.Diagnostics.Trace.WriteLine(string.Format(" Consultado en Kepler: {0}", Newtonsoft.Json.JsonConvert.SerializeObject(sumPedido)));
            }

            // actualiza bandera en kepler
            try
            {
                System.Diagnostics.Trace.WriteLine("Actualizando bandera en kepler...");

                UpdatePedidoInKepler(clave, consecutivo, asesor, request.Cliente.NoCliente);
            }
            catch (Exception ex)
            {
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = request.CvePedido,
                    Login = request.UsuarioLogin
                });

                response.Status = EnumStatus.TransactionWithFail;
                response.Message = ex.Message;
                return response;
            }

            // consulta actualización
            sumPedido = ConsultaPedidoInKepler(clave, request.UsuarioLogin, consecutivo, asesor, request.Cliente.NoCliente, "1");

            if (sumPedido != null)
            {
                System.Diagnostics.Trace.WriteLine(string.Format(" Consultado en Kepler: {0}", Newtonsoft.Json.JsonConvert.SerializeObject(sumPedido)));
            }

            // actualiza contador de cliente
            UpdateCustomerCounts(request.Cliente.NoCliente, consecutivo);

            response.Status = EnumStatus.TansactionOk;
            response.Message = string.Format("¡Pedido registrado exitosamente!");
            response.FolioKepler = consecutivo;

            return response;
        }

        private static void ExecuteTransaction(string query)
        {

            using (KEPLEREntities _db = new KEPLEREntities())
            {
                try
                {
                    _db.Database.ExecuteSqlCommand(query);
                    // commit ¿?
                    _db.SaveChanges();

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        private static PedidosKepler ConsultaPedidoInKepler(string clave, string login, long consecutivo, string asesor, string cliente, string flag)
        {
            PedidosKepler pedidos = null;
            StringBuilder builder = new StringBuilder();

            builder.Append("SELECT convert(varchar(15), C15, 126) Proceso");
            builder.Append(" ,[C14] FolioKepler  ");
            builder.Append(" ,[C2] Cliente ");
            builder.Append(" ,[C3] Cartera ");
            builder.Append(" ,[C11] Consecutivo ");
            builder.Append(" , COUNT(*) Partidas ");
            builder.Append(" FROM[KEPLER].[dbo].[KDPEDIDOHH] ");
            builder.Append(" WHERE C1 <> '' AND C5='H' ");
            builder.Append(string.Format(" AND C1 ='{0}' AND C3='{1}' AND C2='{2}' AND C11 = '{3}' AND C10 = '{4}'", clave, asesor, cliente, consecutivo, flag));
            builder.Append(" GROUP BY CONVERT(varchar(15), C15, 126), [C14],[C2],[C3],[C11] ");

            string query = builder.ToString();

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = string.Format("SQL: {0}", query),
                Login = login,
                CvePedido = clave
            });

            using (KEPLEREntities _db = new KEPLEREntities())
            {
                try
                {
                    pedidos = _db.Database.SqlQuery<PedidosKepler>(query).FirstOrDefault();

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

            return pedidos;
        }

        private static void UpdatePedidoInKepler(string clave, long consecutivo, string asesor, string cliente)
        {
            StringBuilder builder = new StringBuilder();

            builder.Append("UPDATE [dbo].[KDPEDIDOHH] SET  [C10] = '1'");
            builder.Append(string.Format("WHERE C10 = '3' AND C5='H' AND C1 ='{0}' AND C3='{1}' AND C2='{2}' AND C11 = '{3}'", clave, asesor, cliente, consecutivo));

            string query = builder.ToString();

            try
            {
                ExecuteTransaction(query);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private static void InsertInKeppler(RequestPedidoModel request, string clave, long consecutivo, string asesor)
        {
            short idEntrega = 0;

            if (!short.TryParse(request.Entrega.Id, out idEntrega))
            {
                idEntrega = 0;
            }

            StringBuilder builder = new StringBuilder();

            string query = string.Empty;

            string prioridad = short.Parse(request.TipoEntrega).ToString("D2");

            foreach (var item in request.Partidas)
            {
                builder.Append(" INSERT INTO [dbo].[KDPEDIDOHH] \n");
                builder.Append(" ([C1], [C2] ,[C3] ,[C4] ,[C5] ,[C6] ,[C7] ,[C8] ,[C9] ,[C10] , [C11], [C12], [C13], [C14], [C15] ) \n");
                builder.Append(string.Format(" VALUES ('{0}' , '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', '{9}', '{10}', '{11}', '{12}', '{13}', {14} ); \n",
                    clave,                      // C1 Clave consecutivo
                    request.Cliente.NoCliente,  // C2 Clave de cliente                                                                            
                    asesor,                     // C3 Clave de asesor
                    "01",                       // C4 Filial
                    "H",                        // C5 Origen
                    '1',                        // C6 Tipo de pedido
                    item.Codigo,                // C7 Producto
                    item.Cantidad,              // C8 Cantidad
                    item.Descripcion,           // C9 Descripcion producto
                    '3',                        // C10 Procesado: 0 Sin procesar: 1, Temporal: 3
                    consecutivo,                // C11 Agrupación de pedido                                                
                    prioridad,                  // C12 Prioridad de envio ***
                    idEntrega,                  // C13 Domicilio de entrega ***
                    "",                         // C14 Pedido
                    "CONVERT(varchar, GETDATE(), 120)"  // C15 Procesado
                    ));
            }

            query = builder.ToString();

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = string.Format("Sincronizando en Kepler: {0} ", query),
                CvePedido = request.CvePedido,
                Login = request.UsuarioLogin
            });

            try
            {
                ExecuteTransaction(query);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void RegisterCliente(RequestPedidoModel request)
        {
            var customer = db.cliente_info.FirstOrDefault(x => x.nocliente == request.Cliente.NoCliente);

            if (customer == null)
            {
                customer = new cliente_info
                {
                    nocliente = request.Cliente.NoCliente,
                    register = DateTime.Now,
                    count_pedidos = 0
                };

                db.cliente_info.Add(customer);
            }

            try
            {
                db.SaveChanges();
            }
            catch (DbEntityValidationException ex)
            {
                foreach (var eve in ex.EntityValidationErrors)
                {
                    //Hub.Clients.All.broadcastOperation(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                    //    eve.Entry.Entity.GetType().Name, eve.Entry.State));

                    foreach (var ve in eve.ValidationErrors)
                    {
                        Log(new EventModel
                        {
                            Status = EnumEventStatus.Error,
                            CvePedido = request.CvePedido,
                            Login = request.UsuarioLogin,
                            Message = ve.ErrorMessage
                        });
                    }

                }
                throw ex;
            }

        }

        private static string GetAsesor(string nocliente)
        {
            string asesor = string.Empty;

            StringBuilder builder = new StringBuilder();

            builder.Append(" SELECT RTRIM(k1.C12) ");
            builder.Append(string.Format(" FROM  [KEPLER].[dbo].[KDUD] k1, [KEPLER].[dbo].[KDUDENT] k2 WHERE k1.C2 = k2.C1 and rtrim(K1.C2) = '{0}' ", nocliente));

            string query = builder.ToString();

            using (KEPLEREntities _db = new KEPLEREntities())
            {
                try
                {
                    asesor = _db.Database.SqlQuery<string>(query).FirstOrDefault();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError(ex.Message);
                    throw ex;
                }
            }
            return asesor;
        }

        private static long GetCustomerCounts(string nocliente)
        {
            long consecutivo = 0;

            try
            {
                using (MobileAppEntities _db = new MobileAppEntities())
                {
                    consecutivo = _db.cliente_info.Where(x => x.nocliente == nocliente).FirstOrDefault().count_pedidos.Value + 1;
                }

                System.Diagnostics.Trace.WriteLine(string.Format("GetCustomerCounts({0}): {1}", nocliente, consecutivo));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError(ex.Message);
                throw ex;
            }

            return consecutivo;
        }

        private static void UpdateCustomerCounts(string nocliente, long consecutivo)
        {
            try
            {
                using (MobileAppEntities _db = new MobileAppEntities())
                {
                    var customer = _db.cliente_info.FirstOrDefault(x => x.nocliente == nocliente);

                    if (customer != null)
                    {
                        customer.count_pedidos = consecutivo;

                        customer.register = DateTime.Now;

                        _db.SaveChanges();
                    }
                }

                System.Diagnostics.Trace.WriteLine(string.Format("UpdateCustomerCounts({0}): {1}", nocliente, consecutivo));
            }
            catch (DbEntityValidationException ex)
            {

                throw ex;
            }
        }

        private void UpdatePedidoDetalles(pedidoapp pedido)
        {
            if (pedido != null)
            {

                foreach (var item in pedido.itempedido)
                {
                    var itemp = db.itempedido.FirstOrDefault(x => x.cvepedido == pedido.cvepedido && x.codigo == item.codigo);

                    try
                    {
                        if (itemp == null)
                        {
                            db.itempedido.Add(item);
                        }
                        else
                        {
                            itemp.descripcion = item.descripcion;
                            itemp.precio = item.precio;
                            itemp.linea = item.linea;
                            itemp.unidad = item.unidad;
                            itemp.cantidad = item.cantidad;
                            itemp.sincronizado = item.sincronizado;
                            itemp.fecharegistro = DateTime.Now;
                        }

                        db.SaveChanges();
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }

                }
            }
        }

        [AllowAnonymous]
        [Route("SyncPedido")]
        [ResponseType(typeof(TransactionResponse))]
        public async Task<IHttpActionResult> SyncPedido(RequestPedidoModel request)
        {

            TransactionResponse response = new TransactionResponse
            {
                Status = EnumStatus.TransactionWithFail,
                Message = "Falla en la transacción"
            };

            if (request == null)
            {
                return BadRequest("Requerimiento invalido!");
            }

            if (string.IsNullOrEmpty(request.Cliente.NoCliente))
            {
                return BadRequest("cliente invalido!");
            }

            if (string.IsNullOrEmpty(request.Cliente.Cartera))
            {
                return BadRequest("cartera invalido!");
            }

            if (request.Partidas.Count == 0)
            {
                return BadRequest("No existen articulos en el pedido!");
            }

            if (request.Partidas.FirstOrDefault(x => x.Cantidad == null || x.Cantidad == 0) != null)
            {
                return BadRequest("Inconsitencias en el carrito revise las cantidades!");
            }

            if (request.Total == null || request.Total == 0)
            {
                return BadRequest("Inconsitencias en el sumarizado del pedido!");
            }

            if (request.SubTotal == null || request.SubTotal == 0)
            {
                return BadRequest("Inconsitencias en el subtotal del pedido!");
            }

            if (request.Iva == null || request.Iva == 0)
            {
                return BadRequest("Inconsitencias en el sumarizado del pedido!");
            }

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = string.Format("Procesando pedido: {0} Cliente: {1} Partidas: {2}",
                request.CvePedido, request.Cliente.Nombre, request.Partidas.Count),
                CvePedido = request.CvePedido,
                Login = request.UsuarioLogin
            });


            var json = Newtonsoft.Json.JsonConvert.SerializeObject(request);


            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = string.Format("Request: {0}", json),
                CvePedido = request.CvePedido,
                Login = request.UsuarioLogin
            });

            try
            {
                RegisterCliente(request);

                var pedido = await db.pedidoapp.FirstOrDefaultAsync(x => x.cvepedido == request.CvePedido);

                if (pedido == null)
                {
                    pedido = new pedidoapp
                    {
                        cvepedido = request.CvePedido,
                        idcartera = request.Cliente.Cartera,
                        nocliente = request.Cliente.NoCliente,
                        usuariologin = request.UsuarioLogin,
                        domentrega = request.Entrega.Id,
                        observaciones = request.Observaciones,
                        iva = request.Iva,
                        subtotal = request.SubTotal,
                        total = request.Total,
                        sincronizado = true,
                        keppler_folio = 0,
                        fecharegistro = request.FechaCaptura,
                        itempedido = request.Partidas.Select(y => new itempedido
                        {
                            codigo = y.Codigo.ToUpper().Trim(),
                            cvepedido = request.CvePedido,
                            descripcion = y.Descripcion.Length < 150 ? y.Descripcion.ToUpper().Trim() : y.Descripcion.ToUpper().Trim().Substring(0, 150),
                            precio = y.Precio,
                            linea = y.Linea.Length < 20 ? y.Linea.ToUpper().Trim() : y.Linea.ToUpper().Trim().Substring(0, 20),
                            unidad = y.Unidad.Length < 20 ? y.Unidad.ToUpper().Trim() : y.Unidad.ToUpper().Trim().Substring(0, 20),
                            cantidad = (short)y.Cantidad,
                            sincronizado = y.Sincronizado == 1,

                            fecharegistro = request.FechaCaptura //DateTime.Now
                        }).ToList()
                    };

                    //Hub.Clients.All.broadcastOperation(string.Format("Agregando pedido: {0} Cliente: {1}",
                    //request.CvePedido, request.Cliente.Nombre));

                    db.pedidoapp.Add(pedido);

                    await db.SaveChangesAsync();


                    response = await ApiPedidosController.JobProcessor.QueueJob(request);

                    if (response.Status == EnumStatus.TansactionOk)
                    {
                        pedido.keppler_folio = response.FolioKepler;

                        db.Entry(pedido).State = EntityState.Modified;

                        try
                        {
                            await db.SaveChangesAsync();
                        }
                        catch (Exception ex)
                        {
                            Log(new EventModel
                            {
                                Status = EnumEventStatus.Error,
                                Message = string.Format("Error al sincronizar foloio kepler:{0} Cliente: {1} Error: {2}",
                                request.UsuarioLogin,
                                request.Cliente.NoCliente,
                                ex.Message),
                                CvePedido = request.CvePedido,
                                Login = request.UsuarioLogin
                            });

                            var err = ex.InnerException;

                            while (err != null)
                            {
                                Log(new EventModel
                                {
                                    Status = EnumEventStatus.Error,
                                    Message = string.Format("Err: {0} ", err.Message),
                                    CvePedido = request.CvePedido,
                                    Login = request.UsuarioLogin
                                });

                                err = err.InnerException;
                            }
                        }
                    }

                    return Ok(response);
                }
                else
                {
                    response.Status = EnumStatus.TansactionOk;
                    response.Message = "Este pedido ya se encuentra registrado";
                    return Ok(response);
                }

            }
            catch (DbEntityValidationException ex)
            {
                foreach (var eve in ex.EntityValidationErrors)
                {
                    Log(new EventModel
                    {
                        Status = EnumEventStatus.Error,
                        Message = string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State),
                        CvePedido = request.CvePedido,
                        Login = request.UsuarioLogin
                    });

                    foreach (var ve in eve.ValidationErrors)
                    {
                        Log(new EventModel
                        {
                            Status = EnumEventStatus.Error,
                            Message = string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage),
                            CvePedido = request.CvePedido,
                            Login = request.UsuarioLogin
                        });
                    }
                }
                response.Status = EnumStatus.TransactionWithFail;
                response.Message = ex.Message;
                return Ok(response);
            }
            catch (Exception ex)
            {
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = string.Format("Error al agregar pedido Usuario:{0} Cliente: {1} Error: {2}",
                    request.UsuarioLogin,
                    request.Cliente.NoCliente,
                    ex.Message),
                    CvePedido = request.CvePedido,
                    Login = request.UsuarioLogin
                });

                var err = ex.InnerException;

                while (err != null)
                {
                    Log(new EventModel
                    {
                        Status = EnumEventStatus.Error,
                        Message = string.Format("Err: {0} ", err.Message),
                        CvePedido = request.CvePedido,
                        Login = request.UsuarioLogin
                    });

                    err = err.InnerException;
                }

                response.Status = EnumStatus.TransactionWithFail;
                response.Message = ex.Message;

                return Ok(response);
            }
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
