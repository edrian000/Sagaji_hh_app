using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class ArticuloModel
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public string Unidad { get; set; }
        public string Linea { get; set; }
    }
}
