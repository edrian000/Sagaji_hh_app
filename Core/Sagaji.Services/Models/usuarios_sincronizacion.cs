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
    
    public partial class usuarios_sincronizacion
    {
        public string cat_id { get; set; }
        public string login { get; set; }
        public Nullable<System.DateTime> fecha_descarga { get; set; }
        public Nullable<bool> stauts { get; set; }
    
        public virtual catalogo_bd catalogo_bd { get; set; }
        public virtual usuario usuario { get; set; }
    }
}
