using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    [JsonObject]
    public class ExistenciaItem
    {
        public string Codigo { get; set; }
        public string Almacen { get; set; }
        public double Existencia { get; set; }
    }
}
