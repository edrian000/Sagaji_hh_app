using Sagaji.Services.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace Sagaji.Services.Controllers
{
    public class VideosController : ApiController
    {
        private static readonly string mediaDirectory = HttpContext.Current.Server.MapPath("~/Content/Media");

        public HttpResponseMessage Get(string filename)
        {
            string filePath = Path.Combine(mediaDirectory, string.Format("{0}.mp4", filename));

            var video = new VideoStream(filePath);

            var response = Request.CreateResponse();

            response.Content = new PushStreamContent((Stream outputStream, HttpContent content, TransportContext context) =>
            {
                video.WriteToStream(outputStream, content, context);
            });



            return response;
        }
    }
}
