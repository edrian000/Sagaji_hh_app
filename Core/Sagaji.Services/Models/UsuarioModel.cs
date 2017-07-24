using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class UsuarioModel
    {
        public string Login { get; set; }
        public int? HashPassword { get; set; }
        public DateTime? Register { get; set; }
        public string PhotoImageUrl { get; set; }
        public List<RequestPedidoModel> Pedidos { get; set; }
    }
}
