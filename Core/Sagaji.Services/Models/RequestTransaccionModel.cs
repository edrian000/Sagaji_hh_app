using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class RequestTransaccionModel
    {
        public string Usuario { get; set; }
        public string Paswword { get; set; }
        public string Compañía { get; set; }
        public string FechaConsulta { get; set; }
        public string Branch { get; set; }
        public string ReferenciaCobro { get; set; }
    }
}
