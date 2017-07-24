using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class PedidoAnteriorModel
    {
        public string PedKepler { get; set; }
        public string Status { get; set; }
        public decimal? Total { get; set; }
        public string Plazo { get; set; }
        public string FechaFacturacion { get; set; }
        public string FechaEnvio { get; set; }
        public string NoCliente { get; set; }

    }
}
