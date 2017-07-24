using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sagaji.Services.Models
{
    public enum EnumStatus
    {
        TansactionOk,
        TransactionWithFail,
        TransactionPending,
        RejectedByStocks,
        RejectedByPrices
    }
    public class TransactionResponse
    {
        public EnumStatus Status { get; set; }
        public string Message { get; set; }
        public long FolioKepler { get; set; }
    }
}
