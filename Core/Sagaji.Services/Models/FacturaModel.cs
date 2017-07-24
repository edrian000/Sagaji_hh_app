using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class FacturaModel
    {
        public string NumDoc { get; set; }
        public string Status { get; set; }
        public decimal? Iva { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? Total { get; set; }
        public List<PartidaItem> Partidas { get; set; }
    }
}
