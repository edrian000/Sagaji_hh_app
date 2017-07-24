using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public class FileResult
    {
        public string version { get; set; }
        public IEnumerable<string> FileNames { get; set; }        
        public DateTime CreatedTimestamp { get; set; }
        public DateTime UpdatedTimestamp { get; set; }
        public string DownloadLink { get; set; }
        public IEnumerable<string> ContentTypes { get; set; }
        public IEnumerable<string> Names { get; set; }
    }
}
