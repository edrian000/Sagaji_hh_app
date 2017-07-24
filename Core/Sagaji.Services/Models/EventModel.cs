using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class EventModel
    {
        public DateTime? Time { get; set; }
        public EnumEventStatus Status { get; set; }
        public string StatusDescription { get; set; }
        public string CvePedido { get; internal set; }
        public string Login { get; internal set; }
        public string Message { get; internal set; }
    }
}
