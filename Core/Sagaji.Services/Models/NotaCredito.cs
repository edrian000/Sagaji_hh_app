using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class NotaCredito
    {
        public string NumDoc { get; set; }
        public string NumNota { get; set; }
        public DateTime? FechaRegistro { get; set; }
        public decimal? Importe { get; set; }
        public string Observaciones { get; set; }
    }
}
