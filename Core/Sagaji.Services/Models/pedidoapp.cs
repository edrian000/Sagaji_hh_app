//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Sagaji.Services.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class pedidoapp
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public pedidoapp()
        {
            this.itempedido = new HashSet<itempedido>();
        }
    
        public string cvepedido { get; set; }
        public string idcartera { get; set; }
        public string nocliente { get; set; }
        public string usuariologin { get; set; }
        public string domentrega { get; set; }
        public string observaciones { get; set; }
        public Nullable<decimal> subtotal { get; set; }
        public Nullable<decimal> iva { get; set; }
        public Nullable<decimal> total { get; set; }
        public Nullable<bool> sincronizado { get; set; }
        public Nullable<System.DateTime> fecharegistro { get; set; }
        public Nullable<long> keppler_folio { get; set; }
        public string proceso_folio { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<itempedido> itempedido { get; set; }
    }
}