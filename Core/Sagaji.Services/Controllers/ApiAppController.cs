using Newtonsoft.Json;
using Sagaji.Services.Hubs;
using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;


namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    [RoutePrefix("api/App")]
    public class ApiAppController : ApiControllerWithHub<DashboardHub>
    {
        private MobileAppEntities db = new MobileAppEntities();

        private static readonly string uploadDirectory = HttpContext.Current.Server.MapPath("~/Upload");

        [AllowAnonymous]
        [Route("Plataforms")]
        public IEnumerable<NumericValueSelectListItem> GetPlataforms()
        {
            var list = EnumHelper.GetSelectList();
            return list;
        }

        [Route("Apps")]
        public async Task<IEnumerable<AppModel>> Get()
        {
            List<AppModel> apps = null;

            try
            {
                apps = await db.app_version.Select(x => new AppModel
                {
                    Id = x.app_id,
                    Version = x.version,
                    Platform = (EnumPlatform)x.plataforma_id,
                    Release = x.liberacion,
                    //Data = x.app
                }).ToListAsync();

            }
            catch (Exception ex)
            {
                Hub.Clients.All.broadcastOperation(string.Format("Error al subir app:{0}",
                    ex.Message));

                var err = ex.InnerException;

                while (err != null)
                {
                    Hub.Clients.All.broadcastOperation(string.Format("Err: {0} ", err.Message));

                    err = err.InnerException;
                }
            }

            return apps;
        }
        [AllowAnonymous]
        [Route("Download")]
        public HttpResponseMessage GetApp(string version, EnumPlatform platform)
        {
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.NotFound);

            byte[] app = null;

            try
            {
                string filePath = Path.Combine(uploadDirectory, string.Format("app-{0}.{1}.{2}", version, (short)platform, platform == EnumPlatform.EnumAndroid ? "apk" : "ipa"));

                if (!File.Exists(filePath))
                {
                    return response;
                }

                app = File.ReadAllBytes(filePath);

                if (app != null)
                {
                    MemoryStream memStream = new MemoryStream(app);

                    if (Request.Headers.Range != null)
                    {
                        try
                        {
                            HttpResponseMessage partialResponse = Request.CreateResponse(HttpStatusCode.PartialContent);
                            partialResponse.Content = new ByteRangeStreamContent(memStream, Request.Headers.Range, new MediaTypeHeaderValue("application/octet-stream"));
                            partialResponse.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                            {
                                FileName = string.Format("app-{0}.{1}.{2}", version, (short)platform, platform == EnumPlatform.EnumAndroid ? "apk" : "ipa")
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
                            FileName = string.Format("app-{0}.{1}.{2}", version, (short)platform, platform == EnumPlatform.EnumAndroid ? "apk" : "ipa")
                        };

                        return fullResponse;
                    }
                }
            }
            catch (Exception ex)
            {
                Hub.Clients.All.broadcastOperation(string.Format("Error:", ex.Message));
            }

            return response;
        }

        [Route("Delete")]
        public async Task<IHttpActionResult> Delete(string version, EnumPlatform platform)
        {
            var app = await db.app_version.FirstOrDefaultAsync(x => x.version == version && x.plataforma_id == (short)platform);

            if (app == null)
            {
                return NotFound();
            }

            db.app_version.Remove(app);

            try
            {
                await db.SaveChangesAsync();

                string filePath = Path.Combine(uploadDirectory, string.Format("app-{0}.{1}.apk", version, platform));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (DbEntityValidationException ex)
            {
                foreach (var eve in ex.EntityValidationErrors)
                {
                    Hub.Clients.All.broadcastOperation(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                        eve.Entry.Entity.GetType().Name, eve.Entry.State));

                    foreach (var ve in eve.ValidationErrors)
                    {
                        Hub.Clients.All.broadcastOperation(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage));
                    }
                }
            }

            return Ok();
        }

        
        [Route("Upload")]
        public async Task<HttpResponseMessage> Upload()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                this.Request.CreateResponse(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = GetMultipartProvider();

            var result = await Request.Content.ReadAsMultipartAsync(provider);

            // On upload, files are given a generic name like "BodyPart_26d6abe1-3ae1-416a-9429-b35f15e6e5d5"
            // so this is how you can get the original file name
            var originalFileName = GetDeserializedFileName(result.FileData.First());

            // uploadedFileInfo object will give you some additional stuff like file length,
            // creation time, directory name, a few filesystem methods etc..
            var uploadedFileInfo = new FileInfo(result.FileData.First().LocalFileName);



            // Remove this line as well as GetFormData method if you're not 
            // sending any form data with your upload request
            var tmpModel = GetFormData<AppItem>(result);

            if (tmpModel == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            else
            {
                AppItem model = (AppItem)tmpModel;

                string filePath = Path.Combine(uploadDirectory, string.Format("app-{0}.{1}.apk", model.Version, model.Platform));

                if (model.Platform == (short)EnumPlatform.EnumIos)
                {
                    filePath = Path.Combine(uploadDirectory, string.Format("app-{0}.{1}.ipa", model.Version, model.Platform));
                }


                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                uploadedFileInfo.CopyTo(filePath);

                uploadedFileInfo.Delete();

                try
                {
                    app_version app = await db.app_version.FirstOrDefaultAsync(x => x.version == model.Version && x.plataforma_id == (short)model.Platform);

                    if (app == null)
                    {
                        app = new app_version
                        {
                            app_id = Guid.NewGuid().ToString(),
                            plataforma_id = (short)model.Platform,
                            liberacion = DateTime.Now,
                            version = model.Version,
                            app = null
                        };

                        db.app_version.Add(app);
                    }
                    else
                    {
                        app.liberacion = DateTime.Now;
                        app.version = model.Version;
                        app.app = null;
                    }

                    await db.SaveChangesAsync();
                }
                catch (DbEntityValidationException ex)
                {
                    foreach (var eve in ex.EntityValidationErrors)
                    {
                        Hub.Clients.All.broadcastOperation(string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                            eve.Entry.Entity.GetType().Name, eve.Entry.State));

                        foreach (var ve in eve.ValidationErrors)
                        {
                            Hub.Clients.All.broadcastOperation(string.Format("- Property: \"{0}\", Error: \"{1}\"",
                                ve.PropertyName, ve.ErrorMessage));
                        }
                    }

                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    Hub.Clients.All.broadcastOperation(string.Format("Error al subir app:{0}:{1}-{2}",
                        model.Version,
                        model.Platform,
                        ex.Message));

                    var err = ex.InnerException;

                    while (err != null)
                    {
                        Hub.Clients.All.broadcastOperation(string.Format("Err: {0} ", err.Message));

                        err = err.InnerException;
                    }
                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, new { message = ex.Message });
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.OK);
        }

        private MultipartFormDataStreamProvider GetMultipartProvider()
        {
            var uploadFolder = "~/App_Data/Temp/FileUploads"; // you could put this to web.config
            var root = HttpContext.Current.Server.MapPath(uploadFolder);
            Directory.CreateDirectory(root);
            return new MultipartFormDataStreamProvider(root);
        }

        private object GetFormData<T>(MultipartFormDataStreamProvider result)
        {
            if (result.FormData.HasKeys())
            {
                var unescapedFormData = Uri.UnescapeDataString(result.FormData.GetValues(0).FirstOrDefault() ?? String.Empty);
                if (!String.IsNullOrEmpty(unescapedFormData))
                    return JsonConvert.DeserializeObject<T>(unescapedFormData);
            }

            return null;
        }

        private string GetDeserializedFileName(MultipartFileData fileData)
        {
            var fileName = GetFileName(fileData);

            if (string.IsNullOrEmpty(fileName))
            {
                throw new Exception("Invalid file name");
            }

            return JsonConvert.DeserializeObject(fileName).ToString();
        }

        public string GetFileName(MultipartFileData fileData)
        {
            if (fileData != null)
            {
                return fileData.Headers.ContentDisposition.FileName;
            }
            return null;

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
