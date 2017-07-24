using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Sagaji.Services.Models
{
    public enum EnumPlatform
    {
        [Description("Android")]
        EnumAndroid,
        [Description("iOS")]
        EnumIos,
        [Description("Windows")]
        EnumWindows,
    };

    public class AppItem
    {
        public short Platform { get; set; }
        public string Version { get; set; }
    }

    public class AppModel
    {
        public string Id { get; set; }
        public EnumPlatform Platform { get; set; }
        public string Version { get; set; }
        public DateTime? Release { get; set; }
        public byte[] Data { get; set; }
    }


}
