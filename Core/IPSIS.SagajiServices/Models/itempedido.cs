//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace IPSIS.SagajiServices.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class itempedido
    {
        public decimal id { get; set; }
        public string codigo { get; set; }
        public string cvepedido { get; set; }
        public string descripcion { get; set; }
        public Nullable<decimal> precio { get; set; }
        public string linea { get; set; }
        public string unidad { get; set; }
        public Nullable<short> cantidad { get; set; }
        public Nullable<bool> sincronizado { get; set; }
        public Nullable<System.DateTime> fecharegistro { get; set; }
    
        public virtual pedidoapp pedidoapp { get; set; }
    }
}
