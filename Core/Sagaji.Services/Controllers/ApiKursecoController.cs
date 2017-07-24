using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using Sagaji.Services.Models;
using System.Web.Http.Cors;

namespace Sagaji.Services.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiKursecoController : ApiController
    {
        private Entities db = new Entities();

        // GET: api/ApiKurseco
        public async Task<IEnumerable<KUSRSECO>> Get(string filter)
        {
            List<KUSRSECO> items = await db.KUSRSECO.ToListAsync();

            if (!string.IsNullOrEmpty(filter))
            {
                items = items.Where(i => i.C1.StartsWith(filter)).ToList();
            }
            if(items.Count() > 100)
            {
                items = items.Take(100).ToList();
            }
            return items;
        }
                

        // POST: api/ApiKurseco
        [ResponseType(typeof(KUSRSECO))]
        public async Task<IHttpActionResult> Post(KUSRSECO model)
        {
            var item = await db.KUSRSECO.FirstOrDefaultAsync(k => k.C1 == model.C1 && k.C2 == model.C2);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if(item == null)
            {
                db.KUSRSECO.Add(model);

            }else
            {

            }            

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (KUSRSECOExists(model.C1))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = model.C1 }, model);
        }

        // DELETE: api/ApiKurseco/5
        [ResponseType(typeof(KUSRSECO))]
        public async Task<IHttpActionResult> DeleteKUSRSECO(string id)
        {
            KUSRSECO kUSRSECO = await db.KUSRSECO.FindAsync(id);
            if (kUSRSECO == null)
            {
                return NotFound();
            }

            db.KUSRSECO.Remove(kUSRSECO);
            await db.SaveChangesAsync();

            return Ok(kUSRSECO);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool KUSRSECOExists(string id)
        {
            return db.KUSRSECO.Count(e => e.C1 == id) > 0;
        }
    }
}