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
    
    public partial class perfil
    {
        public short id_modulo { get; set; }
        public string id_role { get; set; }
        public string nombre { get; set; }
    
        public virtual role role { get; set; }
    }
}