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
    
    public partial class usuario
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public usuario()
        {
            this.usuarios_sincronizacion = new HashSet<usuarios_sincronizacion>();
        }
    
        public string login { get; set; }
        public string id_role { get; set; }
        public Nullable<int> password { get; set; }
        public string fullname { get; set; }
        public string email { get; set; }
        public Nullable<System.DateTime> register { get; set; }
        public byte[] photo { get; set; }
    
        public virtual role role { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<usuarios_sincronizacion> usuarios_sincronizacion { get; set; }
    }
}
