using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class UserAppModel
    {
        public string UserLogin { get; set; }
        public string UserPassword { get; set; }
        public string FullName { get; set; }
        public string UserEmail { get; set; }
        public string Perfil { get; internal set; }
    }
}
