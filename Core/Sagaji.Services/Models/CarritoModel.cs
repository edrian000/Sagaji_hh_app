namespace Sagaji.Services.Models
{
    public class CarritoModel
    {
        public string NoCliente { get; set; }
        public string CvProducto { get; set; }
        public string Descripcion { get; set; }
        public decimal Piezas { get; set; }
        public string Unidad { get; set; }
        public string Moneda { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Total { get; set; }
    }
}