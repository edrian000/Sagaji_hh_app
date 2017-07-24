using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiMitPagosController : ApiController
    {


        public async Task<string> Post(RequestTransaccionModel request)
        {
            string response = string.Empty;

            try
            {
                //RC4 rc4 = new RC4();

                //rc4.Key = "6740FAF8";

                using (SagajiMitPagos.xmltransaccionesPortTypeClient client =
                //new SagajiMitPagos.xmltransaccionesPortTypeClient("xmltransaccionesHttpBinding", "https://vip.e-pago.com.mx/pgs/cobroXml"))
                new SagajiMitPagos.xmltransaccionesPortTypeClient())
                {
                    

                    //rc4.Text = request.Usuario;
                    //rc4.compute();

                    string encypteduser = AesBase64Wrapper.EncryptAndEncode(request.Usuario);

                    //rc4.Text = request.Usuario;
                    //rc4.compute();

                    string encryptedpswd = AesBase64Wrapper.EncryptAndEncode(request.Paswword);

                    response = await client.transaccionesAsync(
                    encypteduser,
                    encryptedpswd,
                    request.Compañía,
                    request.FechaConsulta,
                    request.Branch,
                    request.ReferenciaCobro);

                    if (string.IsNullOrEmpty(response))
                    {
                        System.Diagnostics.Trace.TraceError("ApiMitPagos: ", response);
                    }


                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Trace.TraceError("ApiMitPagos: ", ex.Message);

            }


            return response;
        }

    }
}
