using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    
    public class RequestPedidoModel
    {
        public string CvePedido { get; set; }
        public ClienteModel Cliente { get; set; }
        public string UsuarioLogin { get; set; }
        public DateTime? FechaCaptura { get; set; }
        public DateTime? FechaProceso { get; set; }
        public DomicilioModel Entrega { get; set; }
        public string TipoEntrega { get; set; }
        public string Observaciones { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? Iva { get; set; }
        public decimal? Total { get; set; }
        public List<PedidoModel> Partidas { get; set; }


    }
}
