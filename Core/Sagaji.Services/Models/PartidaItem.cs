using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class PartidaItem
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public string Unidad { get; set; }
        public int Cantidad { get; set; }
        public decimal? Iva { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? Total { get; set; }
    }
}
