using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using Sagaji.Services.Models;

namespace Sagaji.Services.Hubs
{
    public class DashboardHub : Hub
    {
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {

            }
            base.Dispose(disposing);
        }

        public override Task OnConnected()
        {
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            return base.OnDisconnected(stopCalled);
        }

        public void SendPerformance(IList<PerformanceModel> performanceModels)
        {
            Clients.All.broadcastPerformance(performanceModels);
        }

        public void Heartbeat()
        {
            Clients.All.heartbeat();
        }

        public void Communicate(string messageId, string message)
        {
            Clients.All.addNewMessageToPage(messageId, message);
        }
    }
}