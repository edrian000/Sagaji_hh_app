﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class MobileAppEntities : DbContext
    {
        public MobileAppEntities()
            : base("name=MobileAppEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<C__MigrationHistory> C__MigrationHistory { get; set; }
        public virtual DbSet<app_version> app_version { get; set; }
        public virtual DbSet<AspNetRoles> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaims> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogins> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUsers> AspNetUsers { get; set; }
        public virtual DbSet<catalogo_bd> catalogo_bd { get; set; }
        public virtual DbSet<catalogo_csv> catalogo_csv { get; set; }
        public virtual DbSet<cliente_info> cliente_info { get; set; }
        public virtual DbSet<descarga_clientes> descarga_clientes { get; set; }
        public virtual DbSet<event_status> event_status { get; set; }
        public virtual DbSet<itempedido> itempedido { get; set; }
        public virtual DbSet<pedidoapp> pedidoapp { get; set; }
        public virtual DbSet<perfil> perfil { get; set; }
        public virtual DbSet<plataforma> plataforma { get; set; }
        public virtual DbSet<role> role { get; set; }
        public virtual DbSet<system_logger> system_logger { get; set; }
        public virtual DbSet<usuario> usuario { get; set; }
        public virtual DbSet<usuarios_sincronizacion> usuarios_sincronizacion { get; set; }
    }
}
