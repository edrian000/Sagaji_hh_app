using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public enum EnumPlatform
    {
        EnumAndroid,
        EnumIos,
        EnumWindows,
    };

    public class AppModel
    {
        public string AppId { get; set; }
        public EnumPlatform Plataform { get; set; }
        public DateTime? Release { get; set; }
        public string Version { get; set; }
        public byte[] App { get; set; }
    }
}
