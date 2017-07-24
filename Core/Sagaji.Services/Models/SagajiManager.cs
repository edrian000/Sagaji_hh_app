using Microsoft.AspNet.SignalR;
using Sagaji.Services.Hubs;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public enum EnumEventStatus
    {
        [Description("Error")]
        Error,
        [Description("Información")]
        Info,
        [Description("Bitacora")]
        Log,
        [Description("Exito")]
        Success
    }
    public class SagajiManager
    {
        private static IHubContext _hubs = GlobalHost.ConnectionManager.GetHubContext<DashboardHub>();
        private static readonly int _pollIntervalMillis = 800;



        public static void InitSystem()
        {
            BuildPlatforms();

            InitEventStatus();
        }

        private static void BuildPlatforms()
        {
            var items = Enum.GetValues(typeof(EnumPlatform));
            using (MobileAppEntities db = new MobileAppEntities())
            {
                if (items.Length != db.plataforma.Count())
                {
                    foreach (EnumPlatform item in items)
                    {
                        plataforma pl = new plataforma
                        {
                            plataforma_id = (short)item,
                            descripcion = EnumHelper.GetDescription(item)
                        };

                        db.plataforma.Add(pl);

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

        private static void InitEventStatus()
        {
            var items = Enum.GetValues(typeof(EnumEventStatus));

            using (MobileAppEntities db = new MobileAppEntities())
            {
                if (db.event_status.Count() != items.Length)
                {
                    foreach (EnumEventStatus item in items)
                    {
                        event_status record = new event_status
                        {
                            id_status = (short)item,
                            descripcion = EnumHelper.GetDescription(item),

                        };

                        db.event_status.Add(record);

                        db.SaveChanges();
                    }
                }
            }
        }

        public static async Task OnServiceMonitor()
        {
            while (true)
            {
                await Task.Delay(_pollIntervalMillis);

                try
                {
                    QueryPedidosProcesadosKepler();

                    QueryPedidosCapturadosApp();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Trace.TraceError("OnServiceMonitor: ", ex.Message);
                }
            }
        }

        private static void QueryPedidosCapturadosApp()
        {
            
        }

        private static void QueryPedidosProcesadosKepler()
        {
            List<PedidosKepler> pedidos = null;
            StringBuilder builder = new StringBuilder();

            builder.Append("SELECT TOP 10 CONVERT(VARCHAR(16), C15, 126) Proceso");
            builder.Append(" ,[C14] FolioKepler  ");
            builder.Append(" ,[C2] Cliente ");
            builder.Append(" ,[C3] Cartera ");
            builder.Append(" ,[C10] Status ");
            builder.Append(" ,[C11] Consecutivo ");
            builder.Append(" ,[C12] Prioridad ");
            builder.Append(" ,[C13] Domicilio ");
            builder.Append(" , COUNT(*) Partidas ");
            builder.Append(" FROM[KEPLER].[dbo].[KDPEDIDOHH] ");
            builder.Append(" WHERE C1 <> '' AND C5='H' ");
            builder.Append(" GROUP BY CONVERT(VARCHAR(16), C15, 126), [C14],[C2],[C3], [C10], [C11], [C13], [C12]  ");
            builder.Append(" ORDER BY CONVERT(VARCHAR(16), C15, 126) DESC, C3, C2, [C10] ASC, C11 DESC  ");

            string query = builder.ToString();

            using (KEPLEREntities _db = new KEPLEREntities())
            {
                
                try
                {
                    pedidos = _db.Database.SqlQuery<PedidosKepler>(query).ToList();

                    if (pedidos != null && pedidos.Count > 0)
                    {
                            _hubs.Clients.All.broadcastPedidos(pedidos);
                    }
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }
    }
}
