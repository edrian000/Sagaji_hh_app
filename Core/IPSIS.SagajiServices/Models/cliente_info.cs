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
    
    public partial class cliente_info
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public cliente_info()
        {
            this.descarga_clientes = new HashSet<descarga_clientes>();
        }
    
        public string nocliente { get; set; }
        public Nullable<System.DateTime> register { get; set; }
        public Nullable<long> count_pedidos { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<descarga_clientes> descarga_clientes { get; set; }
    }
}
