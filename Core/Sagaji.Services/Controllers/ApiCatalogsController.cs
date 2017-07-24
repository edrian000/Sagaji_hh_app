using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Data.Entity;
using System.Net.Http;
using System.Web.Http;
using Sagaji.Services.Models;
using System.Web.Http.Cors;
using Microsoft.AspNet.SignalR;
using System.Text;
using Sagaji.Services.Hubs;
using System.Threading.Tasks;
using System.IO;
using System.Net.Http.Headers;
using System.Web;
using System.Text.RegularExpressions;
using Sagaji.Services.Process;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/Catalogos")]
    public class ApiCatalogsController : ApiControllerWithHub<DashboardHub>
    {
        private KEPLEREntities db = new KEPLEREntities();

        private static readonly string alpha = @"[^a-zA-Z0-9]^(\(.*\)\s)";

        private static readonly string dataDirectory = HttpContext.Current.Server.MapPath("~/Download");


        private Regex rgxAplha = new Regex(alpha);


        [AllowAnonymous]
        [Route("Domicilios")]
        public async Task<HttpResponseMessage> GetDomicilios(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);

            StringBuilder builder = new StringBuilder();

            builder.Append(" SELECT DISTINCT RTRIM(k2.C2) Id,  ");
            builder.Append(" RTRIM(K1.C2) NoCliente,  ");
            builder.Append(" REPLACE( RTRIM(k2.C3) + ' ' + RTRIM(k2.C4) + ' ' + RTRIM(k2.C5), ',', ' ')  DomEntrega  ");
            builder.Append(" FROM KDUD k1, KDUDENT k2, KDCARTERAS k3   ");
            builder.Append(" WHERE k1.C2 = k2.C1   ");
            builder.Append(" AND k3.C2 = k1.C12	  ");
            builder.Append(" AND RTRIM(k2.C2) <> ''	  ");

            if (!string.IsNullOrEmpty(login))
            {
                builder.Append(string.Format(" AND k3.C1 ='{0}' ", login.ToLower()));
            }

            builder.Append(" ORDER BY RTRIM(K1.C2), RTRIM(k2.C2) ");


            var query = builder.ToString();

            List<DomicilioModel> domicilios = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Domiclios",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                domicilios = await db.Database.SqlQuery<DomicilioModel>(query).ToListAsync();

                var cvsArray = domicilios.Select(x => string.Format("{0}\t{1}\t{2}", x.Id, x.NoCliente, rgxAplha.Replace(x.DomEntrega, "")))
                    .ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("domicilios.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("domicilios.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("domicilios.txt")
                        };

                        return fullResponse;
                    }
                }
            }
            catch (Exception ex)
            {
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = login
                });
                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
            }

            return response;
        }

        [AllowAnonymous]
        [Route("Carteras")]
        public async Task<HttpResponseMessage> GetCarteras(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);

            StringBuilder builder = new StringBuilder();
            builder.Append(" SELECT DISTINCT RTRIM(C1) Login, RTRIM(C2) Cartera ");
            builder.Append(" FROM KDCARTERAS  ");
            if (!string.IsNullOrEmpty(login))
            {
                builder.Append(string.Format(" WHERE C1 = '{0}' ", login.ToLower()));
            }

            builder.Append(" ORDER BY RTRIM(C1), RTRIM(C2)");

            string query = builder.ToString();

            List<CarteraModel> carteras = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Carteras",
                CvePedido = string.Empty,
                Login = login
            });
            try
            {
                carteras = await db.Database.SqlQuery<CarteraModel>(query).ToListAsync();

                var cvsArray = carteras.Select(x => string.Format("{0},{1}", x.Login, x.Cartera)).ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("carteras.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("carteras.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("carteras.txt")
                        };

                        return fullResponse;
                    }
                }

            }
            catch (Exception ex)
            {
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = login
                });

                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
            }


            return response;
        }

        [AllowAnonymous]
        [Route("Clientes")]
        public async Task<HttpResponseMessage> GetClientes(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);

            StringBuilder builder = new StringBuilder();

            //Hub.Clients.All.broadcastOperation(string.Format("Consultando clientes ..."));

            builder.Append(" SELECT DISTINCT  ");
            builder.Append(" RTRIM(k1.C12)  Cartera, ");
            builder.Append(" RTRIM(K1.C2) NoCliente, ");
            builder.Append(" REPLACE( RTRIM(k1.C3), ',', '') Nombre, ");
            builder.Append(" RTRIM(k1.C10) Rfc, ");
            builder.Append(" REPLACE( RTRIM(k1.C4) + ' ' + RTRIM(k1.C5) + ' ' + RTRIM(k1.C6) + ' ' + RTRIM(k1.C27) + RTRIM(k1.C52),',', ' ') DomFiscal,  ");
            builder.Append("RTRIM(k1.C7) Telefono, ");
            builder.Append(" RTRIM(k1.C15) Credito ");
            builder.Append(" FROM KDUD k1, KDCARTERAS k2 ");
            builder.Append(" WHERE k1.C12 = k2.C2 ");
            builder.Append(" AND RTRIM(k1.C12) <> ''");
            builder.Append(" AND UPPER(k1.C59) = 'S'");

            if (!string.IsNullOrEmpty(login))
            {
                builder.Append(string.Format("AND k2.C1 = '{0}'", login.ToLower()));
            }

            builder.Append("ORDER BY RTRIM(k1.C12), RTRIM(K1.C2)");

            var query = builder.ToString();

            List<ClienteModel> clientes = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Clientes",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                clientes = await db.Database.SqlQuery<ClienteModel>(query).ToListAsync();

                var cvsArray = clientes.Select(x => string.Format("{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}",
                    x.Cartera,
                    x.NoCliente,
                    x.Nombre,
                    x.Rfc,
                    rgxAplha.Replace(x.DomFiscal, ""),
                    x.Telefono,
                    x.Credito))
                    .ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("clientes.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("clientes.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("clientes.txt")
                        };

                        return fullResponse;
                    }
                }

            }
            catch (Exception ex)
            {
                response = Request.CreateResponse(HttpStatusCode.ExpectationFailed);

                //Hub.Clients.All.broadcastOperation(string.Format(ex.Message));
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = login
                });
            }


            return response;
        }

        [AllowAnonymous]
        [Route("Existencias")]
        public async Task<HttpResponseMessage> GetExistencias(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);

            StringBuilder builder = new StringBuilder();
            builder.Append("SELECT RTRIM(KDIL.C3) Codigo, case RTRIM(KDIQ.C10) when 'OXPE' then 'OAXACA' ELSE RTRIM(KDIQ.C10) END AS  Almacen, (KDIL.C4 + KDIL.C8 - KDIL.C9) AS Existencia ");
            builder.Append("FROM KDIL INNER JOIN KDIQ ON KDIL.C2 = KDIQ.C2	");
            builder.Append("WHERE KDIL.C2 IN ('1','14','27','40','53') ");
            builder.Append("ORDER BY KDIL.C3 DESC");


            string query = builder.ToString();

            System.Diagnostics.Trace.TraceError(query);

            List<ExistenciaModel> existencias = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Existencias",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                existencias = await db.Database.SqlQuery<ExistenciaModel>(query).ToListAsync();

                var cvsArray = existencias.Select(x => string.Format("{0}\t{1}\t{2}", x.Codigo, x.Almacen, x.Existencia)).ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("existencias.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("existencias.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("existencias.txt")
                        };

                        return fullResponse;
                    }
                }

            }
            catch (Exception ex)
            {
                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = string.Empty
                });
            }

            return response;
        }

        [AllowAnonymous]
        [Route("Productos")]
        public async Task<HttpResponseMessage> GetProductos(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);
            StringBuilder builder = new StringBuilder();

            builder.Append(" SELECT RTRIM(KDII.C1) Codigo, ");            
            builder.Append(" REPLACE(REPlACE(REPlACE(RTRIM(UPPER( KDII.C2)), CHAR(13), '-*-'),CHAR(10), '%-$-%'), '\"', ' % -&-% ') Descripcion, ");
            builder.Append(" KDII.C15 Precio, ");
            builder.Append(" KDII.C11 Unidad,        ");
            builder.Append(" RTRIM(KDIG.C2) Linea		");
            builder.Append(" FROM KDIG, KDII ");
            builder.Append(" WHERE  KDIG.C1=KDII.C3 AND KDII.C2 <> '' and KDII.C15 <> 0 and KDII.C11 <> ''  ");
            builder.Append(" ORDER BY RTRIM(KDII.C1) DESC  ");

            string query = builder.ToString();
            List<ArticuloModel> productos = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Productos",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                productos = await db.Database.SqlQuery<ArticuloModel>(query).ToListAsync();

                var cvsArray = productos.Select(x => string.Format("{0}\t{1}\t{2}\t{3}\t{4}", x.Codigo, rgxAplha.Replace(x.Descripcion, ""), x.Precio, x.Unidad, x.Linea)).ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("productos.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("productos.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("productos.txt")
                        };

                        return fullResponse;
                    }
                }

            }
            catch (Exception ex)
            {
                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = string.Empty
                });
            }

            return response;
        }

        [AllowAnonymous]
        [Route("Equivalencias")]
        public async Task<HttpResponseMessage> GetEquivalencias(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);
            List<EquivalenciaModel> equivalencias = null;

            StringBuilder builder = new StringBuilder();

            builder.Append(" SELECT DISTINCT RTRIM(KDII.C1) Codigo,  RTRIM( KDIIEQUIVA.C2) CodigoEquivalente	 ");
            builder.Append(" FROM [KEPLER].[dbo].[KDII] ");
            builder.Append(" INNER JOIN [KEPLER].[dbo].[KDIIEQUIVA] ON KDIIEQUIVA.C1 = KDII.C1  ");
            builder.Append(" ORDER BY RTRIM(KDII.C1), RTRIM( KDIIEQUIVA.C2);  ");


            string query = builder.ToString();

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Equivalencias",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                equivalencias = await db.Database.SqlQuery<EquivalenciaModel>(query).ToListAsync();

                var cvsArray = equivalencias.Select(x => string.Format("{0}\t{1}", x.Codigo, x.CodigoEquivalente)).ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("equivalencias.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("equivalencias.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("equivalencias.txt")
                        };

                        return fullResponse;
                    }
                }
            }
            catch (Exception ex)
            {
                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = string.Empty
                });
            }

            return response;
        }

        [AllowAnonymous]
        [Route("Usuarios")]
        public async Task<HttpResponseMessage> GetUsuarios(string login)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);
            StringBuilder builder = new StringBuilder();

            builder.Append("SELECT DISTINCT ");
            builder.Append("	LOWER(RTRIM(C1)) UserLogin,");
            builder.Append("	RTRIM(C2) UserPassword, ");
            builder.Append("	RTRIM(C3) FullName, ");
            builder.Append("	RTRIM(C4) UserEmail,");
            builder.Append("	CASE WHEN C5 <> '' THEN RTRIM(C5) ELSE 'A' END Perfil ");
            builder.Append(" FROM KIUSRS  ");
            builder.Append(" WHERE C1 <> '' AND C3 IS NOT NULL ");
            builder.Append("ORDER BY LOWER(RTRIM(C1));");

            string query = builder.ToString();

            List<UserAppModel> users = null;

            Log(new EventModel
            {
                Status = EnumEventStatus.Info,
                Message = "Consultando Usuarios",
                CvePedido = string.Empty,
                Login = login
            });

            try
            {
                users = await db.Database.SqlQuery<UserAppModel>(query).ToListAsync();

                var cvsArray = users.Select(x => string.Format("{0}\t{1}\t{2}\t{3}\t{4}",
                    x.UserLogin,
                    x.UserPassword,
                    x.FullName,
                    x.UserEmail,
                    x.Perfil)).ToArray();

                string filePath = Path.Combine(dataDirectory, string.Format("usuarios.txt"));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                File.WriteAllLines(filePath, cvsArray);

                byte[] cvsBytes = File.ReadAllBytes(filePath);

                if (cvsBytes != null)
                {
                    MemoryStream memStream = new MemoryStream(cvsBytes);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("usuarios.txt")
                            };

                            return partialResponse;
                        }
                        catch (InvalidByteRangeException invalidByteRangeException)
                        {
                            return Request.CreateErrorResponse(invalidByteRangeException);
                        }
                    }
                    else
                    {
                        // If it is not a range request we just send the whole thing as normal
                        HttpResponseMessage fullResponse = Request.CreateResponse(HttpStatusCode.OK);
                        fullResponse.Content = new StreamContent(memStream);
                        fullResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                        fullResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                        {
                            FileName = string.Format("usuarios.txt")
                        };

                        return fullResponse;
                    }
                }

            }
            catch (Exception ex)
            {
                //Hub.Clients.All.broadcastErrorMessage(ex.Message);
                Log(new EventModel
                {
                    Status = EnumEventStatus.Error,
                    Message = ex.Message,
                    CvePedido = string.Empty,
                    Login = string.Empty
                });
            }

            return response;
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
