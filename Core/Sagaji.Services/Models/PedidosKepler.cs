using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class PedidosKepler
    {
        public string Proceso { get; set; }
        public string FolioKepler { get; set; }
        public string Cliente { get; set; }
        public string Cartera { get; set; }
        public string Consecutivo { get; set; }
        public string Prioridad { get; set; }
        public string Domicilio { get; set; }
        public string Status { get; set; }
        public int? Partidas { get; set; }
    }
}
