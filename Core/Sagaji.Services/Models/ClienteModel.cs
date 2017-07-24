using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class ClienteModel
    {
        public string NoCliente { get; set; }
        public string Nombre { get; set; }
        public string Rfc { get; set; }
        public string Cartera { get; set; }
        public string DomFiscal { get; set; }
        public string Telefono { get; set; }
        public string Credito { get; set; }
        public List<DomicilioModel> Domicilios { get; set; }

    }

}
