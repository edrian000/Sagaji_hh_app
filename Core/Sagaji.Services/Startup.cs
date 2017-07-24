using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;
using System.Web.Http;
using Sagaji.Services.Models;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

[assembly: OwinStartup(typeof(Sagaji.Services.Startup))]

namespace Sagaji.Services
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            HttpConfiguration config = new HttpConfiguration();

            config.MapHttpAttributeRoutes();

            ConfigureAuth(app);

            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);


            app.UseWebApi(config);

            var hubConfiguration = new HubConfiguration();
            hubConfiguration.EnableDetailedErrors = true;

            app.MapSignalR(hubConfiguration);

            SagajiManager.InitSystem();


            Task.Factory.StartNew(async () => await SagajiManager.OnServiceMonitor());

        }
    }
}
