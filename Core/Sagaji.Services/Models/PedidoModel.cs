using System;

namespace Sagaji.Services.Models
{
    public class PedidoModel
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public string Unidad { get; set; }        
        public string Linea { get; set; }
        public short? Cantidad { get; set; }
        public int Sincronizado { get; set; }
        
    }
}