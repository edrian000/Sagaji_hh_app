using Sagaji.Services.Models;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Sagaji.Services.Controllers
{
    [System.Web.Http.Authorize()]
    public abstract class ApiControllerWithHub<THub> : ApiController
    where THub : IHub
    {
        static Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected static IHubContext Hub
        {
            get { return hub.Value; }
        }

        protected static void Log(EventModel model)
        {
            model.Time = DateTime.Now;
            model.StatusDescription = EnumHelper.GetDescription(model.Status);

            Hub.Clients.All.broadcastOperation(model);

            using (MobileAppEntities db = new MobileAppEntities())
            {
                system_logger record = new system_logger
                {
                    login = model.Login,
                    id_status = (short)model.Status,
                    cvepedido = model.CvePedido,
                    register_event = model.Time,
                    message = model.Message,
                };

                db.system_logger.Add(record);

                try
                {
                    db.SaveChanges();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError(ex.Message);
                }
            }
        }
    }
}
